'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation}>
      <ul>
        <li>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
          >
            Início
          </Link>
        </li>
        <li>
          <Link 
            href="/blog" 
            className={`${styles.navLink} ${pathname === '/blog' ? styles.active : ''}`}
          >
            Blog
          </Link>
        </li>
        <li>
          <Link 
            href="/especialidades" 
            className={`${styles.navLink} ${pathname === '/especialidades' ? styles.active : ''}`}
          >
            Especialidades
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
