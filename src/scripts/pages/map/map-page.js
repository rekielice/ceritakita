import { getStoriesWithLocation } from '../../data/api.js'; 
import { showFormattedDate } from '../../utils/utils.js'; 

export default class MapPage {
  #map = null; 
  #markers = {}; 

  async render() {
    return `
      <section class="container">
        <h1>Peta Cerita 🗺️</h1>
        <div class="map-layout">
          
          <div id="map-container">
            <div id="map" style="height: 500px; width: 100%;"></div>
          </div>

          <div id="story-list-map-container">
            <h2>Daftar Cerita Berlokasi</h2>
            <div id="loading-indicator-map-list" style="display: none;">Memuat daftar...</div>
            <div id="error-message-map-list" style="display: none; color: red;"></div>
            <ul id="story-list-map"> {/* Gunakan <ul> untuk daftar */}
              {/* Item daftar akan dimuat di sini */}
            </ul>
          </div>

        </div> 
        <div id="error-message-map" style="display: none; color: red; margin-top: 10px;"></div>
      </section>
    `;
  }

  async afterRender() {
    // Ambil elemen DOM
    const mapContainer = document.querySelector('#map');
    const storyListElement = document.querySelector('#story-list-map');
    const loadingIndicatorList = document.querySelector('#loading-indicator-map-list');
    const errorMessageList = document.querySelector('#error-message-map-list');
    const errorMessageMap = document.querySelector('#error-message-map'); 

    // Validasi dasar
    if (!mapContainer || !storyListElement) { return; }
    if (typeof L === 'undefined') { return; }

    // Tampilkan loading untuk list
    loadingIndicatorList.style.display = 'block';
    errorMessageList.style.display = 'none';
    errorMessageMap.style.display = 'none';
    storyListElement.innerHTML = ''; 
    this.#markers = {}; 

    try {
      // 1. Inisialisasi Peta Leaflet (Sama seperti sebelumnya)
      this.#map = L.map('map').setView([-2.5489, 118.0149], 5); 
      const openStreetMapTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', 
      });

      const satelliteTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community', 
      });
      
      openStreetMapTile.addTo(this.#map);
      const baseMaps = { "OpenStreetMap": openStreetMapTile, "Satellite": satelliteTile };
      L.control.layers(baseMaps).addTo(this.#map);

      // 2. Ambil Data Cerita dengan Lokasi (Sama seperti sebelumnya)
      const stories = await getStoriesWithLocation();

      // 3. Proses Data -> Buat List Item & Marker + Tambah Listener
      if (stories && stories.length > 0) {
        stories.forEach((story) => {
          if (story.lat != null && story.lon != null) { 
            
            // A. Buat Marker & Popup (Sama)
            const marker = L.marker([story.lat, story.lon]).addTo(this.#map);
            this.#markers[story.id] = marker; 
            
            const popupContent = `
              <div class="story-popup">
                <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name || 'pengguna'}" style="width:100%; max-height: 150px; object-fit: cover;">
                <h3>${story.name || 'Nama Tidak Tersedia'}</h3> 
                <p>${story.description ? story.description.substring(0, 50) + '...' : 'Tidak ada deskripsi.'}</p> 
                <small>Dibuat: ${story.createdAt ? showFormattedDate(story.createdAt) : 'Tanggal tidak diketahui'}</small> 
              </div>
            `;
            marker.bindPopup(popupContent);

            // B. Buat List Item
            const listItem = document.createElement('li');
            listItem.classList.add('story-list-map-item');
            listItem.dataset.storyId = story.id; 
            const imageHTML = story.photoUrl 
              ? `<img src="${story.photoUrl}" alt="Miniatur cerita dari ${story.name || 'pengguna'}" class="story-list-map-image" loading="lazy">` 
              : '';   

            listItem.innerHTML = `
              ${imageHTML} 
              <div class="story-list-map-text">
                <h3>${story.name || 'Nama Tidak Tersedia'}</h3> 
                <p>${story.description ? story.description.substring(0, 70) + '...' : ''}</p>
              </div>
            `;
            storyListElement.appendChild(listItem);

            // C. Tambah Listener: Klik List Item -> Fokus Peta & Buka Popup
            listItem.addEventListener('click', () => {
              document.querySelectorAll('.story-list-map-item.highlighted')
                      .forEach(item => item.classList.remove('highlighted'));
              listItem.classList.add('highlighted');
              
              this.#map.flyTo([story.lat, story.lon], 15); 
              marker.openPopup();
            });

            // D. Tambah Listener: Klik Marker -> Highlight List Item
            marker.on('click', () => {
                 document.querySelectorAll('.story-list-map-item.highlighted')
                         .forEach(item => item.classList.remove('highlighted'));
                 listItem.classList.add('highlighted');
                 listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
            
          }
        }); 
      } else {
        errorMessageList.innerText = 'Tidak ada cerita dengan lokasi ditemukan.';
        errorMessageList.style.display = 'block';
      }

    } catch (error) { 
      console.error('Gagal memuat peta atau daftar cerita:', error);
      const errorText = `Gagal memuat data. Error: ${error.message}`;
      errorMessageMap.innerText = errorText;
      errorMessageMap.style.display = 'block';
      errorMessageList.innerText = errorText;
      errorMessageList.style.display = 'block';
      if (error.message.toLowerCase().includes('authentication')) {
         const loginLink = ' Silakan <a href="#/login">login</a>.';
         errorMessageMap.innerHTML += loginLink;
         errorMessageList.innerHTML += loginLink;
      }
    } finally {
      loadingIndicatorList.style.display = 'none'; 
    }
  }
}