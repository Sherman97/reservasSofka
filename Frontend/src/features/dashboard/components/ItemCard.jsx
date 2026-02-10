import React from 'react';

export const ItemCard = ({ item }) => {
    return (
        <div className="item-card">
            <div className="item-image-container">
                <img src={item.image} alt={item.name} className="item-image" />
                {item.available && <span className="status-badge">DISPONIBLE</span>}
            </div>
            <div className="item-content">
                <div className="item-header">
                    <h3>{item.name}</h3>
                    {item.capacity && (
                        <span className="item-capacity">👥 {item.capacity} pax</span>
                    )}
                    {item.category && (
                        <span className="item-category">🎧 {item.category}</span>
                    )}
                </div>
                <div className="item-location">📍 {item.location}</div>
                <div className="item-tags">
                    {item.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                    ))}
                </div>
                <button className="btn-book">📅 Ver Calendario</button>
            </div>
        </div>
    );
};
