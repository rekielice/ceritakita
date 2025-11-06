import { getStories } from '../../data/api.js';
import { showFormattedDate } from '../../utils/utils.js';

export default class HomePage {
  #allStories = []; // Menyimpan semua data cerita untuk filtering

  async render() {
    return `
      <section class="container">
        <div class="header-section">
            <h1>Cerita Terbaru ✨</h1>
            <div class="search-container">
                <input type="text" id="search-input" placeholder="Cari cerita berdasarkan nama atau deskripsi..." aria-label="Cari cerita">
            </div>
        </div>

        <div id="loading-indicator" style="display: none;">Memuat cerita...</div>
        <div id="error-message" style="display: none; color: red;"></div>
        
        <div id="story-list" class="story-grid"> 
          {/* Cerita akan dimuat di sini */}
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyListContainer = document.querySelector('#story-list');
    const loadingIndicator = document.querySelector('#loading-indicator');
    const errorMessage = document.querySelector('#error-message');
    const searchInput = document.querySelector('#search-input'); // Ambil elemen input

    loadingIndicator.style.display = 'block'; 
    errorMessage.style.display = 'none';
    storyListContainer.innerHTML = ''; 

    try {
      const stories = await getStories(); 
      this.#allStories = stories; // Simpan semua cerita ke variabel private

      // Tampilkan semua cerita di awal
      this._displayStories(this.#allStories);

      // == 2. TAMBAH EVENT LISTENER PENCARIAN ==
      searchInput.addEventListener('input', (event) => {
          const keyword = event.target.value.toLowerCase();
          // Filter cerita berdasarkan nama ATAU deskripsi
          const filteredStories = this.#allStories.filter((story) => 
              story.name.toLowerCase().includes(keyword) || 
              story.description.toLowerCase().includes(keyword)
          );
          this._displayStories(filteredStories);
      });

    } catch (error) {
      console.error('Gagal memuat cerita:', error);
      errorMessage.innerText = `Gagal memuat cerita. Error: ${error.message}`;
      if (error.message.toLowerCase().includes('authentication')) {
          errorMessage.innerHTML += '<br>Silakan <a href="#/login">login</a> terlebih dahulu.';
      }
      errorMessage.style.display = 'block';
    } finally {
      loadingIndicator.style.display = 'none'; 
    }
  }

  // == 3. BUAT FUNGSI HELPER UNTUK MENAMPILKAN LIST ==
  _displayStories(stories) {
    const storyListContainer = document.querySelector('#story-list');
    storyListContainer.innerHTML = ''; // Bersihkan list sebelum render ulang

    if (stories && stories.length > 0) {
      stories.forEach((story) => {
        const storyElement = document.createElement('article');
        storyElement.classList.add('story-item'); 
        
        const storyImageHTML = story.photoUrl 
          ? `<img src="${story.photoUrl}" alt="Foto cerita dari ${story.name || 'pengguna'}" loading="lazy">` 
          : ''; 

        let snippet = story.description || '';
        if (snippet.length > 150) {
            snippet = snippet.substring(0, 150) + '...';
        }

        storyElement.innerHTML = `
          ${storyImageHTML} 
          <h2><a href="#/story/${story.id}">${story.name || 'Judul Tidak Tersedia'}</a></h2> 
          <p class="story-snippet">${snippet}</p> 
          <small>Diposting: ${story.createdAt ? showFormattedDate(story.createdAt) : 'Tanggal tidak diketahui'}</small>
        `;
        storyListContainer.appendChild(storyElement);
      });
    } else {
        storyListContainer.innerHTML = '<p class="empty-message">Tidak ada cerita yang ditemukan.</p>';
    }
  }
}