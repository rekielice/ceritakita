import { getStoryDetail, deleteStory } from '../../data/api.js'; 
import { showFormattedDate } from '../../utils/utils.js'; 
import AuthUtils from '../../utils/auth-utils.js'; 
import FavoriteStoryDB from '../../utils/db-helper.js';

export default class StoryDetailPage {
  #urlSegments = null; 
  #storyData = null; 

  setUrlSegments(segments) {
      this.#urlSegments = segments;
  }

  async render() {
    return `
      <section class="container" id="story-detail-container" aria-live="polite"> 
        <button id="favorite-button" class="favorite-button" aria-label="Tambahkan ke favorit" disabled>❤️</button>
        
        <h1>Detail Cerita</h1>
        <div id="loading-indicator-detail" style="display: block;">Memuat detail cerita...</div>
        <div id="error-message-detail" style="display: none; color: red;"></div>
        <article id="story-content-detail" style="display: none;"></article>
        
        {/* Tombol Hapus */}
        <div id="delete-button-container-detail" style="margin-top: 20px; display: none;"> 
             <button id="delete-story-button-detail" class="button-danger">Hapus Cerita Ini</button>
             <div id="delete-status-message-detail" style="margin-top: 10px;"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyId = this.#urlSegments?.id; 
    const contentContainer = document.querySelector('#story-content-detail');
    const loadingIndicator = document.querySelector('#loading-indicator-detail');
    const errorMessage = document.querySelector('#error-message-detail');
    const detailContainer = document.querySelector('#story-detail-container');
    const deleteButtonContainer = document.querySelector('#delete-button-container-detail');
    const deleteButton = document.querySelector('#delete-story-button-detail');
    const favoriteButton = document.querySelector('#favorite-button');

    if(detailContainer) detailContainer.focus();

    if (!storyId) {
      loadingIndicator.style.display = 'none';
      errorMessage.innerText = 'ID cerita tidak ditemukan.';
      errorMessage.style.display = 'block';
      return; 
    }

    try {
      // Cek status favorit awal (dari IndexedDB)
      await this._checkFavoriteStatus(storyId);

      const story = await getStoryDetail(storyId);
      this.#storyData = story; 

      if (story) {
        if (favoriteButton) {
            favoriteButton.disabled = false; 
            favoriteButton.addEventListener('click', () => this._toggleFavorite(storyId));
        }

        // Render Konten
        contentContainer.innerHTML = `
          <h2>${story.name || 'Pengguna'}</h2> 
          <img src="${story.photoUrl}" alt="Foto cerita ${story.name}" style="max-width: 100%; height: auto; margin-bottom: 15px; border-radius: 8px;">
          <p><strong>Deskripsi:</strong></p>
          <p>${story.description || '-'}</p>
          <p><small>Diposting: ${showFormattedDate(story.createdAt)}</small></p>
          ${story.lat && story.lon ? `<p><small>Lokasi: ${story.lat}, ${story.lon}</small></p>` : ''}
        `;
        contentContainer.style.display = 'block'; 

        // Cek kepemilikan untuk tombol hapus
        const userInfo = AuthUtils.getUserInfo();
        if (userInfo && userInfo.name === story.name) { 
             if(deleteButtonContainer) deleteButtonContainer.style.display = 'block';
             if(deleteButton) deleteButton.addEventListener('click', () => this._handleDeleteStory(storyId));
        }

      } else {
        throw new Error('Data cerita tidak ditemukan.');
      }

    } catch (error) {
      console.error(error);
      errorMessage.innerText = `Gagal memuat: ${error.message}`;
      errorMessage.style.display = 'block';
    } finally {
      loadingIndicator.style.display = 'none'; 
    }
  }

  async _checkFavoriteStatus(id) {
    const favoriteButton = document.querySelector('#favorite-button');
    if (!favoriteButton) return;
    const isFavorited = await FavoriteStoryDB.getStory(id);
    if (isFavorited) {
      favoriteButton.classList.add('favorited');
      favoriteButton.setAttribute('aria-label', 'Hapus dari favorit');
    } else {
      favoriteButton.classList.remove('favorited');
      favoriteButton.setAttribute('aria-label', 'Tambahkan ke favorit');
    }
  }

  async _toggleFavorite(id) {
    if (!this.#storyData) return; 
    const isFavorited = await FavoriteStoryDB.getStory(id);
    if (isFavorited) {
      await FavoriteStoryDB.deleteStory(id);
    } else {
      await FavoriteStoryDB.putStory(this.#storyData);
    }
    await this._checkFavoriteStatus(id);
  }

  async _handleDeleteStory(storyId) {
      const deleteButton = document.querySelector('#delete-story-button-detail');
      const deleteStatusMessage = document.querySelector('#delete-status-message-detail');
      if (!deleteButton || !deleteStatusMessage) return; 

      if (!confirm('Hapus cerita ini?')) return; 

      deleteStatusMessage.textContent = 'Menghapus...';
      deleteButton.disabled = true;

      try {
          await deleteStory(storyId); 
          await FavoriteStoryDB.deleteStory(storyId); 
          
          deleteStatusMessage.textContent = 'Berhasil dihapus!';
          deleteStatusMessage.className = 'success'; 
          setTimeout(() => { window.location.hash = '#/'; }, 1000);
      } catch (error) {
          deleteStatusMessage.textContent = `Gagal: ${error.message}`;
          deleteButton.disabled = false; 
      }
  }
}