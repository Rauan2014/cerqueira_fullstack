import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CerqueiraPsicologia from './homepage.jsx'
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Jaldi:wght@400;700&family=Jost:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet"
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Jost:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet"
  />
</head>;


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CerqueiraPsicologia />
  </StrictMode>,
)
