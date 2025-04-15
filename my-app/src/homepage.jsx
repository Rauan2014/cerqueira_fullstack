import React, { useState } from 'react';
// Assume these CSS files are imported in your main index.js or App.js
// import './styles/index.css';
import './home.css';
import logo from './assets/logo_psi.png';
import img_1 from './assets/images/img_1.png';
import img_2 from './assets/images/img_2.png';
import img_3 from './assets/images/img_3.png';
export default function CerqueiraPsicologia() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const images = [
    img_1,
    img_2,
    img_3 // Third slide placeholder
  ];
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="site-wrapper">
      {/* Header */}
      <header className="header">
        <div className="container header-container">
          <a href="#" className="logo">
            <img src={logo} alt="Cerqueira Psicologia Logo"  height={'auto'} width={'auto'}/>
          </a>

          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            ☰
          </button>

          <nav className={`main-nav ${mobileMenuOpen ? "active" : ""}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#">Início</a>
              </li>
              <li className="nav-item">
                <a href="#">Blog</a>
              </li>
              <li className="nav-item">
                <a href="#">Especialidades</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="container">
          <section className="welcome-section">
            <h1 className="welcome-heading">
              Bem-vindo a Cerqueira Psicologia!
            </h1>

            <p className="welcome-text">
              Espaço de acolhimento emocional com psicólogos especializados.
              Atuamos com abordagens personalizadas para ansiedade, estresse,
              relacionamentos e autoconhecimento, em um ambiente seguro e
              confidencial. Priorizamos escuta ativa e técnicas eficazes para
              promover equílibrio e bem-estar. Sua jornada é única: vamos
              caminhar juntos. Agende sua consulta!
            </p>
          </section>
{/* SVG Rectangle Background */}
<svg
    className="carousel-bg-rectangle"
    viewBox="0 0 100 150"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100%" height="100%" fill="#bbf7d0" />
  </svg>
          {/* Image carousel */}
          <div className="carousel-container">
            
            <img
              src={images[currentSlide]}
              alt="Cerqueira Psicologia"
              className="carousel-image"
            />

            <button
              onClick={prevSlide}
              className="carousel-button prev"
              aria-label="Previous slide"
            >
              ←
            </button>

            <button
              onClick={nextSlide}
              className="carousel-button next"
              aria-label="Next slide"
            >
              →
            </button>

            {/* Dots indicator */}
            <div className="carousel-dots">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`carousel-dot ${
                    currentSlide === index ? "active" : ""
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
 {/* Map and Contact Section */}
 <section className="location-section">
        <div className="container">
          <h2 className="location-heading">Unidade de Poá:</h2>
          
          <div className="location-content">
            <div className="map-container">
              <div className="map-placeholder">
                <span>MAPA</span>
              </div>
            </div>
            
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">@</span>
                <a href="mailto:www.exemplo@email.com" className="contact-text">www.exemplo@email.com</a>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" className="instagram-icon" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z"/>
                    <circle cx="18.406" cy="5.594" r="1.44"/>
                  </svg>
                </span>
                <a href="https://instagram.com/exeplo1234" className="contact-text">@exeplo1234</a>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" className="phone-icon" aria-hidden="true">
                    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>
                  </svg>
                </span>
                <a href="tel:+999999999999" className="contact-text">(99)99999-99999</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 Cerqueira Psicologia. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}