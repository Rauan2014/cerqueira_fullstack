'use client';

import React from 'react';
import styles from './Map.module.css';
import { useEffect, useRef } from 'react';

const Map = ({ location = 'Poá, SP, Brasil', zoom = 15 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  useEffect(() => {
    // Função para carregar o OpenStreetMap
    const loadOpenStreetMap = () => {
      if (!mapRef.current) return;
      
      // Verificar se o Leaflet já está carregado
      if (!window.L) {
        // Carregar CSS do Leaflet
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkElement);
        
        // Carregar JS do Leaflet
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initOpenStreetMap;
        document.head.appendChild(script);
      } else {
        initOpenStreetMap();
      }
    };
    
    const initOpenStreetMap = () => {
      if (!mapRef.current || !window.L) return;
      
      // Limpar mapa existente se houver
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      // Coordenadas aproximadas de Poá, SP, Brasil
      const lat = -23.520439;
      const lng = -46.343293;
      
      // Inicializar o mapa e salvar a referência
      mapInstanceRef.current = window.L.map(mapRef.current).setView([lat, lng], zoom);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      window.L.marker([lat, lng])
        .addTo(mapInstanceRef.current)
        .bindPopup('Cerqueira Psicologia - Unidade de Poá')
        .openPopup();
    };
    
    // Usar OpenStreetMap que não requer API key
    loadOpenStreetMap();
    
    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, zoom]);
  
  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map}></div>
    </div>
  );
};

export default Map;