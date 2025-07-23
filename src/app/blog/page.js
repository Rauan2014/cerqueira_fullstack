'use client';

import React from 'react';
import styles from './page.module.css';
import BlogPage from '../../components/BlogPage/BlogPage';

export default function Blog() {
  return (
    <div className={styles.container}>
      <BlogPage />
    </div>
  );
}
