import React, { useState, useRef } from 'react';
import styles from './ProductImage.module.css';

interface ProductImageProps {
  images: string[];
  productName: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  images,
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Handle swipe gestures on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || images.length <= 1) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && selectedIndex < images.length - 1) {
        // Swipe left - next image
        setSelectedIndex(selectedIndex + 1);
      } else if (diff < 0 && selectedIndex > 0) {
        // Swipe right - previous image
        setSelectedIndex(selectedIndex - 1);
      }
    }
    setTouchStart(null);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  // Handle image load error - fallback to placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  // If no images, show placeholder
  if (images.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.mainImageContainer}>
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📦</span>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div className={styles.container}>
      {/* Main Image */}
      <div
        ref={mainImageRef}
        className={styles.mainImageContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          className={styles.mainImage}
          loading="eager"
          onError={handleImageError}
        />

        {/* Image counter badge (mobile) */}
        {hasMultipleImages && (
          <div className={styles.imageCounter}>
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip - only show if multiple images */}
      {hasMultipleImages && (
        <div className={styles.thumbnailStrip}>
          {images.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${index === selectedIndex ? styles.thumbnailActive : ''}`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === selectedIndex ? 'true' : 'false'}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className={styles.thumbnailImage}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
