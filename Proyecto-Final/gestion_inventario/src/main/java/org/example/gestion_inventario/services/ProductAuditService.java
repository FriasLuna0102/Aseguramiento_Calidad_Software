package org.example.gestion_inventario.services;

import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.example.gestion_inventario.model.dto.ProductAuditResponse;
import org.example.gestion_inventario.model.entity.CustomRevisionEntity;
import org.example.gestion_inventario.model.entity.Product;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional(readOnly = true)
public class ProductAuditService {

    private final EntityManager entityManager;

    public ProductAuditService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Page<ProductAuditResponse> getProductHistoryWithFilters(
            Long productId,
            String modificationType,
            String username,
            Integer minStockDifference,
            Integer maxStockDifference,
            Date fromDate,
            Date toDate,
            Pageable pageable
    ) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        AuditQuery query = auditReader.createQuery()
                .forRevisionsOfEntity(Product.class, false, true)
                .add(AuditEntity.id().eq(productId));

        applyFilters(query, modificationType, username, fromDate, toDate);

        query.addOrder(AuditEntity.revisionNumber().asc());
        List<Object[]> revisions = query.getResultList();

        List<ProductAuditResponse> auditResponses = processRevisions(revisions);

        if (minStockDifference != null || maxStockDifference != null) {
            auditResponses = auditResponses.stream()
                    .filter(response -> filterByStockDifference(response, minStockDifference, maxStockDifference))
                    .collect(Collectors.toList());
        }

        return paginateResults(auditResponses, pageable);
    }


    public Page<ProductAuditResponse> getAllProductsHistoryWithFilters(
            String productName,
            String modificationType,
            String username,
            Integer minStockDifference,
            Integer maxStockDifference,
            Date fromDate,
            Date toDate,
            String searchTerm,
            Pageable pageable
    ) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        AuditQuery query = auditReader.createQuery()
                .forRevisionsOfEntity(Product.class, false, true);

        applyFilters(query, modificationType, username, fromDate, toDate);

        query.addOrder(AuditEntity.revisionNumber().desc());
        List<Object[]> revisions = query.getResultList();

        List<ProductAuditResponse> auditResponses = new ArrayList<>();

        for (Object[] revision : revisions) {
            Product product = (Product) revision[0];
            CustomRevisionEntity revisionEntity = (CustomRevisionEntity) revision[1];

            Object[] previousRevision = findPreviousRevision(auditReader, product.getId(), revisionEntity.getId());
            ProductAuditResponse response = mapToAuditResponse(revision, previousRevision);
            auditResponses.add(response);
        }

        auditResponses = auditResponses.stream()
                .filter(response -> applyAdditionalFilters(response, productName, minStockDifference, maxStockDifference, searchTerm))
                .collect(Collectors.toList());

        return paginateResults(auditResponses, pageable);
    }

    public Map<String, Object> getAuditStatistics() {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        List<Object[]> allRevisions = auditReader.createQuery()
                .forRevisionsOfEntity(Product.class, false, true)
                .getResultList();

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalChanges", allRevisions.size());

        Map<String, Long> changesByType = allRevisions.stream()
                .collect(Collectors.groupingBy(
                        revision -> ((RevisionType) revision[2]).name(),
                        Collectors.counting()
                ));
        stats.put("changesByType", changesByType);

        Map<String, Long> changesByUser = allRevisions.stream()
                .collect(Collectors.groupingBy(
                        revision -> {
                            CustomRevisionEntity rev = (CustomRevisionEntity) revision[1];
                            return rev.getUsername() != null ? rev.getUsername() : "Unknown";
                        },
                        Collectors.counting()
                ));
        stats.put("changesByUser", changesByUser);

        Date yesterday = Date.from(LocalDateTime.now().minusDays(1).atZone(ZoneId.systemDefault()).toInstant());
        long recentChanges = allRevisions.stream()
                .mapToLong(revision -> {
                    CustomRevisionEntity rev = (CustomRevisionEntity) revision[1];
                    return rev.getRevisionDate().after(yesterday) ? 1 : 0;
                })
                .sum();
        stats.put("changesLast24Hours", recentChanges);

        return stats;
    }

    public Page<ProductAuditResponse> getRecentChanges(int hours, Pageable pageable) {
        Date fromDate = Date.from(LocalDateTime.now().minusHours(hours).atZone(ZoneId.systemDefault()).toInstant());
        return getAllProductsHistoryWithFilters(null, null, null, null, null, fromDate, null, null, pageable);
    }

    public Page<ProductAuditResponse> getChangesByUser(String username, Date fromDate, Date toDate, Pageable pageable) {
        return getAllProductsHistoryWithFilters(null, null, username, null, null, fromDate, toDate, null, pageable);
    }

    public Page<ProductAuditResponse> getStockMovements(
            String movementType,
            Integer minDifference,
            Date fromDate,
            Date toDate,
            Pageable pageable
    ) {
        Page<ProductAuditResponse> allChanges = getAllProductsHistoryWithFilters(
                null, "MOD", null, null, null, fromDate, toDate, null, pageable
        );

        List<ProductAuditResponse> filteredChanges = allChanges.getContent().stream()
                .filter(response -> {
                    if (response.getStockDifference() == null) return false;

                    int difference = response.getStockDifference();

                    switch (movementType.toUpperCase()) {
                        case "INCREASE":
                            if (difference <= 0) return false;
                            break;
                        case "DECREASE":
                            if (difference >= 0) return false;
                            break;
                        case "ALL":
                            break;
                        default:
                            return false;
                    }

                    if (minDifference != null && Math.abs(difference) < minDifference) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(
                filteredChanges,
                pageable,
                filteredChanges.size()
        );
    }

    private void applyFilters(AuditQuery query, String modificationType, String username, Date fromDate, Date toDate) {
        if (modificationType != null && !modificationType.trim().isEmpty()) {
            try {
                RevisionType revType = RevisionType.valueOf(modificationType.toUpperCase());
                query.add(AuditEntity.revisionType().eq(revType));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid modification type: {}", modificationType);
            }
        }

        if (fromDate != null) {
            query.add(AuditEntity.revisionProperty("timestamp").ge(fromDate.getTime()));
        }

        if (toDate != null) {
            Calendar cal = Calendar.getInstance();
            cal.setTime(toDate);
            cal.add(Calendar.DAY_OF_MONTH, 1);
            query.add(AuditEntity.revisionProperty("timestamp").lt(cal.getTime().getTime()));
        }

        if (username != null && !username.trim().isEmpty()) {
            query.add(AuditEntity.revisionProperty("username").eq(username));
        }
    }

    private boolean applyAdditionalFilters(
            ProductAuditResponse response,
            String productName,
            Integer minStockDifference,
            Integer maxStockDifference,
            String searchTerm
    ) {
        if (productName != null && !productName.trim().isEmpty()) {
            if (!response.getProductName().toLowerCase().contains(productName.toLowerCase())) {
                return false;
            }
        }

        if (!filterByStockDifference(response, minStockDifference, maxStockDifference)) {
            return false;
        }

        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            String searchLower = searchTerm.toLowerCase();
            boolean matches = response.getProductName().toLowerCase().contains(searchLower) ||
                    (response.getUsername() != null && response.getUsername().toLowerCase().contains(searchLower));
            if (!matches) {
                return false;
            }
        }

        return true;
    }

    private boolean filterByStockDifference(ProductAuditResponse response, Integer minDifference, Integer maxDifference) {
        if (response.getStockDifference() == null) {
            return true;
        }

        int difference = Math.abs(response.getStockDifference());

        if (minDifference != null && difference < minDifference) {
            return false;
        }

        if (maxDifference != null && difference > maxDifference) {
            return false;
        }

        return true;
    }

    private List<ProductAuditResponse> processRevisions(List<Object[]> revisions) {
        List<ProductAuditResponse> auditResponses = new ArrayList<>();

        for (int i = 0; i < revisions.size(); i++) {
            Object[] currentRevision = revisions.get(i);
            Object[] previousRevision = i > 0 ? revisions.get(i - 1) : null;

            ProductAuditResponse response = mapToAuditResponse(currentRevision, previousRevision);
            auditResponses.add(response);
        }

        return auditResponses;
    }

    private Page<ProductAuditResponse> paginateResults(List<ProductAuditResponse> auditResponses, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), auditResponses.size());

        List<ProductAuditResponse> paginatedList = new ArrayList<>();
        if (start < auditResponses.size()) {
            paginatedList = auditResponses.subList(start, end);
        }

        return new PageImpl<>(
                paginatedList,
                pageable,
                auditResponses.size()
        );
    }

    private ProductAuditResponse mapToAuditResponse(Object[] currentRevision, Object[] previousRevision) {
        Product product = (Product) currentRevision[0];
        CustomRevisionEntity revisionEntity = (CustomRevisionEntity) currentRevision[1];
        RevisionType revisionType = (RevisionType) currentRevision[2];

        ProductAuditResponse response = new ProductAuditResponse();
        response.setId(product.getId());
        response.setProductName(product.getName());
        response.setModificationType(revisionType.name());
        response.setDateModified(revisionEntity.getRevisionDate());
        response.setUsername(revisionEntity.getUsername());
        response.setNewStock(product.getQuantityCurrent());

        if (previousRevision != null && revisionType != RevisionType.ADD) {
            Product previousProduct = (Product) previousRevision[0];
            response.setPreviousStock(previousProduct.getQuantityCurrent());
            response.setStockDifference(product.getQuantityCurrent() - previousProduct.getQuantityCurrent());
        } else if (revisionType == RevisionType.ADD) {
            response.setPreviousStock(0);
            response.setStockDifference(product.getQuantityCurrent());
        }

        return response;
    }

    private Object[] findPreviousRevision(AuditReader auditReader, Long productId, Long currentRevisionId) {
        List<Object[]> previousRevisions = auditReader.createQuery()
                .forRevisionsOfEntity(Product.class, false, true)
                .add(AuditEntity.id().eq(productId))
                .add(AuditEntity.revisionNumber().lt(currentRevisionId))
                .addOrder(AuditEntity.revisionNumber().desc())
                .setMaxResults(1)
                .getResultList();

        return previousRevisions.isEmpty() ? null : previousRevisions.get(0);
    }
}