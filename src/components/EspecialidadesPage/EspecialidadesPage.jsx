'use client';

import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './EspecialidadesPage.module.css';

const EspecialidadesPage = () => {
  const especialidades = [
    {
      id: 1,
      title: 'Clínica de psicologia com atendimento especializado para crianças, adolescentes e adultos.',
      description: 'Saúde emocional em todas as fases da vida.',
      imageSrc: './images/familia.jpg'
    },
    {
      id: 2,
      title: 'Acolhimento humanizado em todas as fases da vida.',
      description: 'Cuidamos da sua saúde emocional com atenção e respeito.',
      imageSrc: './images/consulta.jpg'
    },
    {
      id: 3,
      title: 'Profissionais capacitados, métodos comprovados e abordagem ética.',
      description: 'Seu bem-estar emocional em boas mãos.',
      imageSrc: './images/trabalho.jpg'
    }
  ];

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <section className={styles.especialidadesSection}>
          {especialidades.map((especialidade) => (
            <div key={especialidade.id} className={styles.card}>
              <div className={styles.cardText}>
                <h3>{especialidade.title}</h3>
                <p>{especialidade.description}</p>
              </div>
              <div className={styles.cardImage}>
                <img src={especialidade.imageSrc} alt={especialidade.title} />
              </div>
            </div>
          ))}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default EspecialidadesPage;
