'use client';

import React from 'react';
import styles from './Header.module.css';
import Navigation from '../Navigation/Navigation';
import Image from 'next/image';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image 
          src="/images/logofundo.png" 
          alt="Cerqueira Psicologia Logo" 
          width={150} 
          height={50} 
          className={styles.logoImage}
        />
      </div>
      <Navigation />
    </header>
  );
};

export default Header;