import routes from '../routes/routes.js';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser.js';
import AuthUtils from '../utils/auth-utils.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this._initialAppShellSetup();
    this._setupDrawer();
  }

  _initialAppShellSetup() {
     this.#content.setAttribute('tabindex', '-1');
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
      this._updateAriaExpanded();
    });

    document.body.addEventListener('click', (event) => {
      if (this.#navigationDrawer.classList.contains('open') &&
          !this.#navigationDrawer.contains(event.target) &&
          !this.#drawerButton.contains(event.target)) {
        this.closeDrawer();
      }
    });

    this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => this.closeDrawer());
    });

    // Aksesibilitas keyboard (tombol Escape)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.#navigationDrawer.classList.contains('open')) {
            this.closeDrawer();
            this.#drawerButton.focus();
        }
    });
  }

  closeDrawer() {
      this.#navigationDrawer.classList.remove('open');
      this._updateAriaExpanded();
  }

  _updateAriaExpanded() {
      const isExpanded = this.#navigationDrawer.classList.contains('open');
      this.#drawerButton.setAttribute('aria-expanded', isExpanded);
  }

  async renderPage() {
    const isViewTransitionSupported = Boolean(document.startViewTransition);

    // Fungsi untuk melakukan update DOM
    const updateDOM = async () => {
      const routePattern = getActiveRoute();
      const urlSegments = parseActivePathname();
      let page = routes[routePattern];

      // Fallback routing
      if (!page && urlSegments.resource && !urlSegments.id) { page = routes[`/${urlSegments.resource}`]; }
      if (!page && !urlSegments.resource && !urlSegments.id) { page = routes['/']; }

      // Proteksi Rute
      const protectedRoutes = ['/add-story', '/map'];
      if (protectedRoutes.includes(routePattern) && !AuthUtils.isLoggedIn()) {
          // Redirect jika belum login
          window.location.hash = '#/login';
          return;
      }

      // Handle Logout
      if (routePattern === '/logout') {
          AuthUtils.logout();
          window.location.hash = '#/login';
          return;
      }

      // Render Halaman
      if (page) {
          try {
              if (typeof page.setUrlSegments === 'function') {
                  page.setUrlSegments(urlSegments);
              }
              this.#content.innerHTML = await page.render();
              await page.afterRender();
          } catch (error) {
              console.error("Error rendering page:", error);
              this.#content.innerHTML = `<section class="container"><h1 class="error">Gagal Memuat Halaman</h1><p>${error.message}</p></section>`;
          }
      } else {
          // 404 Not Found
          this.#content.innerHTML = '<section class="container"><h1>404 - Halaman Tidak Ditemukan</h1></section>';
      }
      
      // Fokuskan ke konten utama setelah render selesai (untuk aksesibilitas)
      this.#content.focus();
    };

    // Gunakan View Transition jika didukung
    if (!isViewTransitionSupported) {
      await updateDOM();
    } else {
      document.startViewTransition(async () => {
        await updateDOM();
      });
    }
  }
}

export default App;