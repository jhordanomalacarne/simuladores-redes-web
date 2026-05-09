import React, { useState } from 'react';
import '../assets/footer.css';

export default function Footer() {
  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <footer className="global-footer">
      <div className="footer-content">
        
        {/* Lado Esquerdo: Imagens */}
        <div className="logos-area">
          <img src="/ifro-logo.png" alt="IFRO" className="footer-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <img src="/gtec-logo.png" alt="GTEC" className="footer-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <img src="/labZero-logo.png" alt="labZero" className="footer-logo" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>

        {/* Lado Direito: Menu Hambúrguer */}
        <div className="menu-area">
          <button className="menu-btn" onClick={toggleMenu} aria-label="Abrir Menu">
            {/* Ícone SVG de Hambúrguer ☰ */}
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Menu Suspenso (Dropdown) */}
          {menuAberto && (
            <div className="dropdown-menu">
              <ul>
                <li><a href="#">Site labZero</a></li>
                <li><a href="#">Reporte um problema</a></li>
                <li><a href="#">Sobre</a></li>
              </ul>
            </div>
          )}
        </div>
        
      </div>
    </footer>
  );
}
