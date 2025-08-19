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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@Transactional(readOnly = true)
public class ProductAuditService {

    private final EntityManager entityManager;

    public ProductAuditService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Page<ProductAuditResponse> getProductHistory(Long productId, Pageable pageable) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Product.class, false, true)
                .add(AuditEntity.id().eq(productId))
                .addOrder(AuditEntity.revisionNumber().asc())
                .getResultList();

        List<ProductAuditResponse> auditResponses = new ArrayList<>();

        for (int i = 0; i < revisions.size(); i++) {
            Object[] currentRevision = revisions.get(i);
            Object[] previousRevision = i > 0 ? revisions.get(i - 1) : null;

            ProductAuditResponse response = mapToAuditResponse(currentRevision, previousRevision);
            auditResponses.add(response);
        }

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

    public Page<ProductAuditResponse> getAllProductsHistory(Pageable pageable) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Product.class, false, true)
                .addOrder(AuditEntity.revisionNumber().desc())
                .getResultList();

        List<ProductAuditResponse> auditResponses = new ArrayList<>();

        for (Object[] revision : revisions) {
            Product product = (Product) revision[0];
            CustomRevisionEntity revisionEntity = (CustomRevisionEntity) revision[1];
            RevisionType revisionType = (RevisionType) revision[2];

            Object[] previousRevision = findPreviousRevision(auditReader, product.getId(), revisionEntity.getId());

            ProductAuditResponse response = mapToAuditResponse(revision, previousRevision);
            auditResponses.add(response);
        }

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