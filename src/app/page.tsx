'use client';

import React from 'react';
import styles from './page.module.css';
import HomePage from '../components/HomePage/HomePage';

export default function Home() {
  return (
    <div className={styles.container}>
      <HomePage />
    </div>
  );
}
