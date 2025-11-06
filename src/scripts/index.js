import '../styles/styles.css';

import App from './pages/app.js';
import AuthUtils from './utils/auth-utils'; 

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  // Fungsi untuk update tampilan navigasi berdasarkan status login
  const updateNav = () => {
    const isLoggedIn = AuthUtils.isLoggedIn();
    document.querySelector('#nav-add-story').style.display = isLoggedIn ? 'block' : 'none';
    document.querySelector('#nav-logout').style.display = isLoggedIn ? 'block' : 'none';
    document.querySelector('#nav-login').style.display = isLoggedIn ? 'none' : 'block';
    document.querySelector('#nav-register').style.display = isLoggedIn ? 'none' : 'block';
  };
  
  // Setup listener untuk logout
  const logoutLink = document.querySelector('#nav-logout a');
  if(logoutLink) {
      logoutLink.addEventListener('click', (event) => {
          event.preventDefault();
          AuthUtils.logout();
          updateNav(); 
          window.location.hash = '#/login'; 
      });
  }


  // Panggil updateNav saat pertama kali load
  updateNav();

  // Render halaman awal
  await app.renderPage();

  // Tambahkan listener hashchange untuk routing SPA
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    updateNav(); 
  });

  window.addEventListener('auth-change', () => {
       updateNav();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => { 
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
});