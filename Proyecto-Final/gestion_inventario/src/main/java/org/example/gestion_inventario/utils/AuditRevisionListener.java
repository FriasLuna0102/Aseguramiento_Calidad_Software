package org.example.gestion_inventario.utils;

import org.example.gestion_inventario.model.entity.CustomRevisionEntity;
import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuditRevisionListener implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        if (revisionEntity instanceof CustomRevisionEntity) {
            CustomRevisionEntity revision = (CustomRevisionEntity) revisionEntity;

            String currentUser = "system";

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && authentication.getName() != null
                    && !authentication.getName().equals("anonymousUser")) {
                currentUser = authentication.getName();
            }

            revision.setUsername(currentUser);
        }
    }
}