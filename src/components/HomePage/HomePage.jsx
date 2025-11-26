'use client';

import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ImageCarousel from '../ImageCarousel/ImageCarousel';
import Map from '../Map/Map';
import SocialLinks from '../SocialLinks/SocialLinks';
import styles from './HomePage.module.css';

const HomePage = () => {
  // Imagens para o carrossel
  const carouselImages = [
    '/images/consultorio1.png',
    '/images/consultorio2.png',
    '/images/consultorio3.png',
  ];

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1 className={styles.title}>Bem-vindo ao meu espaço de acolhimento!</h1>
            <p className={styles.description}>
              Como psicólogo especializado, ofereço um espaço seguro para sua jornada emocional.
              Atuo com abordagens personalizadas para ansiedade, estresse, relacionamentos e
              desenvolvimento pessoal. Utilizo métodos comprovados e técnicas eficazes para
              promover equilíbrio e bem-estar. Sua jornada é única, vamos caminhar juntos.
            </p>
            <p className={styles.signature}>Dr. Marcos</p>
            <a href="https://wa.me/5511965759830" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
              Agendar Consulta
            </a>
          </div>

          <div className={styles.carouselWrapper}>
            <ImageCarousel images={carouselImages} />
          </div>
        </section>

        <section className={styles.locationSection}>
          <h2 className={styles.sectionTitle}>Unidade de Poá:</h2>
          <div className={styles.mapWrapper}>
            <Map location="Poá, SP, Brasil" zoom={15} />
          </div>
          <h2 className={styles.sectionTitle}>Av. Nove de Julho, 561 - Centro de, Poá - SP, 08550-100</h2>
          <div className={styles.contactInfo}>
            <SocialLinks />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
