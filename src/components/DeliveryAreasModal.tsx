import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import { X, MapPin, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './DeliveryAreasModal.module.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with brand color
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DeliveryAreasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Service area coordinates (approximate boundaries)
const serviceAreas = [
  {
    name: 'Vancouver',
    coordinates: [
      [49.3093, -123.2270],
      [49.3093, -123.0270],
      [49.2093, -123.0270],
      [49.2093, -123.2270],
      [49.3093, -123.2270]
    ] as [number, number][],
    center: [49.2827, -123.1207] as [number, number],
    population: '695,000+'
  },
  {
    name: 'Burnaby',
    coordinates: [
      [49.2988, -123.0688],
      [49.2988, -122.9088],
      [49.2088, -122.9088],
      [49.2088, -123.0688],
      [49.2988, -123.0688]
    ] as [number, number][],
    center: [49.2488, -122.9888] as [number, number],
    population: '249,000+'
  },
  {
    name: 'Surrey',
    coordinates: [
      [49.2188, -122.9488],
      [49.2188, -122.6488],
      [49.0588, -122.6488],
      [49.0588, -122.9488],
      [49.2188, -122.9488]
    ] as [number, number][],
    center: [49.1388, -122.7988] as [number, number],
    population: '568,000+'
  },
  {
    name: 'Langley',
    coordinates: [
      [49.1688, -122.7488],
      [49.1688, -122.4488],
      [49.0088, -122.4488],
      [49.0088, -122.7488],
      [49.1688, -122.7488]
    ] as [number, number][],
    center: [49.0888, -122.5988] as [number, number],
    population: '147,000+'
  },
  {
    name: 'Coquitlam',
    coordinates: [
      [49.3288, -122.8488],
      [49.3288, -122.6488],
      [49.2288, -122.6488],
      [49.2288, -122.8488],
      [49.3288, -122.8488]
    ] as [number, number][],
    center: [49.2788, -122.7488] as [number, number],
    population: '148,000+'
  }
];

export const DeliveryAreasModal: React.FC<DeliveryAreasModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Truck className={styles.headerIconSvg} />
            </div>
            <div className={styles.headerText}>
              <h2>{t('footer.deliveryAreas')}</h2>
              <p>Greater Vancouver Service Coverage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* Map Container */}
        <div className={styles.mapSection}>
          <div className={styles.mapContainer}>
            <MapContainer
              center={[49.2, -122.8]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              {/* Dark themed map tiles - CartoDB Dark Matter */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Service Area Polygons */}
              {serviceAreas.map((area) => (
                <React.Fragment key={area.name}>
                  <Polygon
                    positions={area.coordinates}
                    pathOptions={{
                      fillColor: '#C8E400',
                      fillOpacity: 0.25,
                      color: '#C8E400',
                      weight: 2,
                      opacity: 0.8
                    }}
                  />
                  <Marker position={area.center} icon={customIcon}>
                    <Popup>
                      <div className={styles.mapPopup}>
                        <div className={styles.popupHeader}>
                          <MapPin className={styles.popupIcon} />
                          <span className={styles.popupName}>{area.name}</span>
                        </div>
                        <p className={styles.popupPopulation}>Population: {area.population}</p>
                        <span className={styles.popupBadge}>
                          ✓ Delivery Available
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Service Areas Grid */}
        <div className={styles.areasGrid}>
          {serviceAreas.map((area) => (
            <div key={area.name} className={styles.areaCard}>
              <div className={styles.areaIconWrapper}>
                <MapPin className={styles.areaIcon} />
              </div>
              <h3 className={styles.areaName}>{area.name}</h3>
              <span className={styles.areaBadge}>
                ✓ Active
              </span>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className={styles.infoSection}>
          <div className={styles.infoHeader}>
            <Truck className={styles.infoIcon} />
            <h3 className={styles.infoTitle}>Current Service Coverage</h3>
          </div>
          <p className={styles.infoText}>
            We currently deliver to <span className={styles.infoHighlight}>Vancouver, Burnaby, Langley, Surrey, and Coquitlam</span>.
            Our delivery network covers over <span className={styles.infoHighlightWhite}>1.8 million residents</span> across Greater Vancouver.
          </p>
          <div className={styles.expandingBox}>
            <p className={styles.expandingTitle}>
              🚀 Expanding Soon!
            </p>
            <p className={styles.expandingText}>
              We're working to include Richmond, North Vancouver, West Vancouver, and New Westminster.
              Stay tuned for updates!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerText}>
            Service areas updated December 2024
          </span>
          <button onClick={onClose} className={styles.footerButton}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
