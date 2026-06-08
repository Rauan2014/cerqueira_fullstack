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
            <p className={styles.signature}>— Marcos</p>
            <a href="https://wa.me/5511965759830" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
              Agendar Consulta
            </a>
          </div>

          <div className={styles.carouselWrapper}>
            <ImageCarousel images={carouselImages} />
          </div>
        </section>

        <section className={styles.presentationSection}>
          <div className={styles.presentationContainer}>
            <div className={styles.introText}>
              <p className={styles.introParagraph}>
                Na Cerqueira Psicologia, cada atendimento é único e pensado para oferecer acolhimento,
                escuta qualificada e estratégias reais para promover saúde emocional e qualidade de vida.
                Os atendimentos são realizados de forma individualizada, com base na Terapia Cognitivo-Comportamental (TCC),
                abordagem reconhecida pela ciência por auxiliar no tratamento da ansiedade, depressão,
                autoestima, relacionamentos, dificuldades emocionais e desenvolvimento pessoal.
              </p>
              <p className={styles.introParagraph}>
                O processo terapêutico inicia-se por meio de uma entrevista inicial, permitindo compreender
                a história, as necessidades e os objetivos de cada pessoa, construindo um acompanhamento
                personalizado e humanizado.
              </p>
            </div>

            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard}>
                <span className={styles.cardIcon}>🛋️</span>
                <h3 className={styles.cardTitle}>Atendimento Presencial</h3>
                <p className={styles.cardDescription}>
                  O consultório foi preparado para oferecer um ambiente seguro, acolhedor, confortável
                  e reservado, proporcionando um espaço de confiança para o cuidado emocional. A
                  Terapia Cognitivo-Comportamental auxilia na compreensão dos pensamentos, emoções e
                  comportamentos, promovendo mudanças práticas e significativas no dia a dia.
                </p>
              </div>

              <div className={styles.serviceCard}>
                <span className={styles.cardIcon}>💻</span>
                <h3 className={styles.cardTitle}>Atendimento On-line</h3>
                <p className={styles.cardDescription}>
                  A psicoterapia on-line oferece a mesma qualidade, ética e acolhimento do atendimento
                  presencial, com praticidade e flexibilidade. As sessões são conduzidas de forma
                  estruturada, permitindo intervenções eficazes à distância, mantendo o cuidado, a
                  conexão terapêutica e o compromisso com o bem-estar emocional.
                </p>
              </div>
            </div>

            <div className={styles.quoteHighlight}>
              <p className={styles.quoteText}>
                ✨ Cuidar da saúde mental é um passo importante para viver com mais equilíbrio, leveza e qualidade de vida.
              </p>
            </div>
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
