import FavoriteStoryDB from '../../utils/db-helper.js'; 
import { showFormattedDate } from '../../utils/utils.js'; 

export default class FavoritePage {
  #allFavoriteStories = []; // Simpan data favorit

  async render() {
    return `
      <section class="container">
        <div class="header-section">
            <h1 id="favorite-heading">Cerita Favoritku 💖</h1>
            <div class="search-container">
                <input type="text" id="search-input-fav" placeholder="Cari favorit..." aria-label="Cari cerita favorit">
            </div>
        </div>

        <div id="loading-indicator-favorite" style="display: none;">Memuat favorit...</div>
        <div id="favorite-story-list" class="story-grid"></div>
        <div id="no-favorite-message" style="display: none; text-align: center; margin-top: 20px;">
            <p>Kamu belum punya cerita favorit.</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const loadingIndicator = document.querySelector('#loading-indicator-favorite');
    const noFavoriteMessage = document.querySelector('#no-favorite-message');
    const searchInput = document.querySelector('#search-input-fav');

    document.querySelector('#favorite-heading')?.focus();

    loadingIndicator.style.display = 'block';
    noFavoriteMessage.style.display = 'none';

    try {
      this.#allFavoriteStories = await FavoriteStoryDB.getAllStories();
      
      // Tampilkan awal
      this._displayFavoriteStories(this.#allFavoriteStories);

      // Event listener pencarian
      searchInput.addEventListener('input', (event) => {
          const keyword = event.target.value.toLowerCase();
          const filteredStories = this.#allFavoriteStories.filter((story) => 
              story.name.toLowerCase().includes(keyword) || 
              story.description.toLowerCase().includes(keyword)
          );
          this._displayFavoriteStories(filteredStories);
      });

    } catch (error) {
      console.error('Gagal memuat favorit:', error);
      document.querySelector('#favorite-story-list').innerHTML = '<p class="error">Gagal memuat data.</p>';
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }

  _displayFavoriteStories(stories) {
      const listContainer = document.querySelector('#favorite-story-list');
      const noFavoriteMessage = document.querySelector('#no-favorite-message');
      listContainer.innerHTML = '';

      if (stories.length > 0) {
        noFavoriteMessage.style.display = 'none';
        stories.forEach((story) => {
            listContainer.innerHTML += this._createStoryItemHTML(story);
        });
      } else {
         // Jika kosong karena filter, atau memang belum ada favorit
         if (this.#allFavoriteStories.length === 0) {
             noFavoriteMessage.style.display = 'block'; // Pesan "belum punya favorit" asli
         } else {
             listContainer.innerHTML = '<p class="empty-message">Tidak ada favorit yang cocok.</p>';
         }
      }
  }

  _createStoryItemHTML(story) {
    // ... (kode _createStoryItemHTML sama seperti sebelumnya) ...
    const storyImageHTML = story.photoUrl 
      ? `<img src="${story.photoUrl}" alt="Foto cerita dari ${story.name || 'pengguna'}" loading="lazy">` 
      : '';
    let snippet = story.description || '';
    if (snippet.length > 150) snippet = snippet.substring(0, 150) + '...';

    return `
      <article class="story-item">
        ${storyImageHTML}
        <h2><a href="#/story/${story.id}">${story.name || 'Judul Tidak Tersedia'}</a></h2>
        <p class="story-snippet">${snippet}</p>
        <small>Diposting: ${story.createdAt ? showFormattedDate(story.createdAt) : 'Tanggal tidak diketahui'}</small>
      </article>
    `;
  }
}