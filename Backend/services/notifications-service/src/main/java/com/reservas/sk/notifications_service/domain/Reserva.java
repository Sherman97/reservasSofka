package com.reservas.sk.notifications_service.domain;

import java.time.LocalDateTime;

public class Reserva {
    private Long id;
    private String nombreRecurso;
    private LocalDateTime fechaFin;
    private boolean activa;
    private boolean entregada;
    private boolean modificada;

    public Reserva(Long id, String nombreRecurso, LocalDateTime fechaFin, boolean activa, boolean entregada, boolean modificada) {
        this.id = id;
        this.nombreRecurso = nombreRecurso;
        this.fechaFin = fechaFin;
        this.activa = activa;
        this.entregada = entregada;
        this.modificada = modificada;
    }

    public Long getId() { return id; }
    public String getNombreRecurso() { return nombreRecurso; }
    public LocalDateTime getFechaFin() { return fechaFin; }
    public boolean isActiva() { return activa; }
    public boolean isEntregada() { return entregada; }
    public boolean isModificada() { return modificada; }
}

