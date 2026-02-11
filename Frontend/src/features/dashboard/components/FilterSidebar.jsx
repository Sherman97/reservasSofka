import React from 'react';

export const FilterSidebar = () => {
    return (
        <aside className="filter-sidebar">
            <div className="filter-section">
                <h3>EQUIPAMIENTO</h3>
                <div className="checkbox-group">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Incluye Proyector</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Cámara 4K</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Pizarra Digital</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Conexión HDMI/USB-C</span>
                    </label>
                </div>
            </div>

            <div className="filter-section">
                <h3>UBICACIÓN</h3>
                <div className="checkbox-group">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Planta Baja</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Sala de Juntas A</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Edificio Central</span>
                    </label>
                </div>
            </div>
        </aside>
    );
};
