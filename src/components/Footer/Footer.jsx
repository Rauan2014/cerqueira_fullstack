'use client';

import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Cerqueira Psicologia</h3>
          <p className={styles.slogan}>Acolhimento e cuidado para sua saúde mental.</p>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Links Rápidos</h3>
          <ul className={styles.footerLinks}>
            <li><a href="/">Início</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/especialidades">Especialidades</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Contato</h3>
          <p>Av. Nove de Julho, 561 - Centro, Poá - SP</p>
          <p>contato@cerqueirapsicologia.com.br</p>
          <div className={styles.socialIcons}>
            {/* Ícones sociais podem ser adicionados aqui */}
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>Todos os direitos reservados ©2025 Cerqueira Psicologia</p>
      </div>
    </footer>
  );
};

export default Footer;
