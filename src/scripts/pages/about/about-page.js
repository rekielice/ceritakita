import CONFIG from '../../config.js';
import { urlBase64ToUint8Array } from '../../utils/utils.js';

export default class AboutPage {
  #swRegistration = null;

  async render() {
    return `
      <section class="container" aria-labelledby="about-heading"> 
        <h1 id="about-heading">Tentang Aplikasi CeritaKita</h1> 
        <div class="about-content">
          <p>Selamat datang di <strong>CeritaKita</strong>! 👋</p>
          <p>Aplikasi ini adalah platform sederhana tempat Anda dapat berbagi cerita dan pengalaman Anda dengan dunia, lengkap dengan lokasi di mana cerita itu terjadi.</p>
          
          <h2>Fitur Utama:</h2>
          <ul>
            <li>✨ Lihat Cerita Terbaru: Jelajahi cerita-cerita yang baru saja dibagikan oleh pengguna lain di halaman Beranda.</li>
            <li>🗺️ Peta Cerita: Visualisasikan lokasi cerita-cerita di peta interaktif. Klik penanda untuk melihat ringkasan cerita.</li>
            <li>➕ Tambah Cerita Baru: Bagikan ceritamu sendiri! Tulis deskripsi, unggah foto pendukung, dan (opsional) tandai lokasinya di peta. (Membutuhkan Login)</li>
            <li>🔐 Autentikasi: Daftar dan login untuk dapat menambahkan cerita baru dan mengelola ceritamu.</li>
            <li>📱 Desain Responsif: Aplikasi dirancang agar nyaman digunakan di berbagai ukuran layar, dari ponsel hingga desktop.</li>
            <li>♿ Aksesibilitas: Kami berusaha membuat aplikasi ini dapat diakses oleh semua orang, termasuk fitur *skip-to-content* dan navigasi keyboard.</li>
          </ul>

          <h2>Teknologi yang Digunakan:</h2>
          <ul>
            <li>Vanilla JavaScript (ES6+)</li>
            <li>HTML5 Semantik</li>
            <li>CSS3 dengan Flexbox & Grid</li>
            <li>Webpack (Bundler & Dev Server)</li>
            <li>Babel (Transpiler JavaScript)</li>
            <li>Leaflet.js (Library Peta)</li>
            <li>Dicoding Story API (Backend)</li>
          </ul>

          <div class="push-notification-section" style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #ccc;">
            <h2>Notifikasi</h2>
            <p>Aktifkan notifikasi untuk mendapatkan info terbaru.</p>
            <button type="button" id="btnSubscribePush" disabled>Memeriksa...</button>
            <p id="push-status" style="margin-top: 10px;"></p>
          </div>

        </div>
      </section>
    `;
  }

  async afterRender() {
    const heading = document.querySelector('#about-heading');
    if (heading) heading.focus();

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            this.#swRegistration = await navigator.serviceWorker.ready;
            await this._updateSubscriptionButtonStatus(); 
        } catch (e) {
            console.error('SW ready failed', e);
        }
    } else {
         console.warn('Push notification not supported');
         const btn = document.querySelector('#btnSubscribePush');
         if (btn) {
             btn.innerText = 'Notifikasi Tidak Didukung';
             btn.disabled = true;
         }
    }

    this._setupPushSubscriptionButton();
  }

  _setupPushSubscriptionButton() {
    const subscribeButton = document.querySelector('#btnSubscribePush');
    if (!subscribeButton) return; 

    subscribeButton.addEventListener('click', async () => {
        await this._handleSubscriptionToggle();
    });
  }

  async _updateSubscriptionButtonStatus() {
    const subscribeButton = document.querySelector('#btnSubscribePush');
    if (!this.#swRegistration || !subscribeButton) return;

    const subscription = await this.#swRegistration.pushManager.getSubscription();
    
    if (subscription) {
      subscribeButton.innerText = 'Nonaktifkan Notifikasi';
      subscribeButton.classList.add('button-danger'); 
    } else {
      subscribeButton.innerText = 'Aktifkan Notifikasi';
      subscribeButton.classList.remove('button-danger'); 
    }
    subscribeButton.disabled = false;
  }

  async _handleSubscriptionToggle() {
      const statusEl = document.querySelector('#push-status');
      const subscribeButton = document.querySelector('#btnSubscribePush');
      if (!this.#swRegistration) return;

      subscribeButton.disabled = true; 
      
      try {
          const existingSubscription = await this.#swRegistration.pushManager.getSubscription();

          if (existingSubscription) {
              // Unsubscribe
              await existingSubscription.unsubscribe();
              if (statusEl) statusEl.innerText = 'Notifikasi dinonaktifkan.';
          } else {
              // Subscribe
              const permission = await Notification.requestPermission();
              if (permission !== 'granted') {
                  if (statusEl) statusEl.innerText = 'Izin notifikasi ditolak.';
                  return; 
              }
              await this.#swRegistration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
              });
              if (statusEl) statusEl.innerText = 'Berhasil mengaktifkan notifikasi!';
          }
      } catch (error) {
          console.error('Toggle subscription failed:', error);
          if (statusEl) statusEl.innerText = `Gagal: ${error.message}`;
      } finally {
           await this._updateSubscriptionButtonStatus();
      }
  }
}