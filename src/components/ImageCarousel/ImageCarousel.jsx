'use client';

import React from 'react';
import styles from './ImageCarousel.module.css';
import { useState, useEffect } from 'react';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, [currentIndex]);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.leftArrow} onClick={goToPrevious}>
        &#10094;
      </div>
      <div className={styles.rightArrow} onClick={goToNext}>
        &#10095;
      </div>
      <div 
        className={styles.slide} 
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      ></div>
      <div className={styles.dotsContainer}>
        {images.map((_, slideIndex) => (
          <div
            key={slideIndex}
            className={`${styles.dot} ${slideIndex === currentIndex ? styles.activeDot : ''}`}
            onClick={() => goToSlide(slideIndex)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
