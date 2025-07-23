'use client';

import React from 'react';
import styles from './page.module.css';
import EspecialidadesPage from '../../components/EspecialidadesPage/EspecialidadesPage';

export default function Especialidades() {
  return (
    <div className={styles.container}>
      <EspecialidadesPage />
    </div>
  );
}
