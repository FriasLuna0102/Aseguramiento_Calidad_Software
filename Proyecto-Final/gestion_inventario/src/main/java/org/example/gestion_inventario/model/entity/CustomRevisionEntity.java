package org.example.gestion_inventario.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.gestion_inventario.utils.AuditRevisionListener;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

import java.util.Date;

@Entity
@Table(name = "revinfo")
@RevisionEntity(AuditRevisionListener.class)
@Getter
@Setter
public class CustomRevisionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "revinfo_seq")
    @SequenceGenerator(name = "revinfo_seq", sequenceName = "revinfo_seq", allocationSize = 50)
    @RevisionNumber
    private Long id;

    @RevisionTimestamp
    @Column(name = "timestamp")
    private Long timestamp;

    @Column(name = "username")
    private String username;

    @Transient
    public Date getRevisionDate() {
        return new Date(this.timestamp);
    }
}