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
          <h1 className={styles.title}>Bem-vindo à Cerqueira Psicologia!</h1>
          <p className={styles.description}>
            Espaço de acolhimento emocional com psicólogos especializados. Atuamos com 
            abordagens personalizadas para ansiedade, estresse, relacionamentos e 
            desenvolvimento pessoal. Nossos profissionais utilizam métodos comprovados e 
            técnicas eficazes para promover equilíbrio e bem-estar. Sua jornada é única, vamos 
            caminhar juntos. Agende sua consulta!
          </p>
          
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
