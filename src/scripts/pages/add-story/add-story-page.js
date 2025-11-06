import { addNewStory } from '../../data/api.js'; 

export default class AddStoryPage {
  #map = null;  
  #selectedLat = null;
  #selectedLon = null;
  #mapClickListener = null; 
  #mapMarker = null; 

  async render() {
    return `
      <section class="container">
        <h1>Bagikan Ceritamu </h1>
        <form id="add-story-form" novalidate>
          
          <div class="form-group">
            <label for="story-description">Deskripsi Cerita:</label>
            <textarea id="story-description" name="description" rows="4" required minlength="5"></textarea>
            <div class="input-error" id="description-error"></div>
          </div>

          <div class="form-group">
            <label for="story-photo">Foto Cerita:</label>
            <input type="file" id="story-photo" name="photo" accept="image/*" required>
            <img id="image-preview" src="#" alt="Pratinjau Gambar" style="display: none; max-width: 100%; height: auto; margin-top: 10px;"/>
            <div class="input-error" id="photo-error"></div>
          </div>

          <div class="form-group">
            <label>Pilih Lokasi (Opsional):</label>
            <div id="location-picker-map" style="height: 300px; width: 100%; margin-bottom: 10px;"></div>
            <p>Koordinat Terpilih: <span id="selected-coordinates">Belum dipilih</span></p>
            <input type="hidden" id="latitude" name="lat">
            <input type="hidden" id="longitude" name="lon">
            <button type="button" id="clear-location-button" style="display: none;">Hapus Lokasi</button>
             <div class="input-error" id="location-error"></div>
          </div>

          <button type="submit" id="submit-story-button">Kirim Cerita</button>
          
          <div id="loading-indicator-add" style="display: none; margin-top: 15px;">Mengirim cerita...</div>
          <div id="status-message" style="margin-top: 15px;"></div> 

        </form>
      </section>
    `;
  }

  async afterRender() {
    this._initLocationPickerMap(); 

    const form = document.querySelector('#add-story-form');
    const descriptionInput = document.querySelector('#story-description');
    const photoInput = document.querySelector('#story-photo');
    const latInput = document.querySelector('#latitude');
    const lonInput = document.querySelector('#longitude');
    const loadingIndicator = document.querySelector('#loading-indicator-add');
    const statusMessage = document.querySelector('#status-message');
    const submitButton = document.querySelector('#submit-story-button');
    const imagePreview = document.querySelector('#image-preview'); 
    const clearLocationButton = document.querySelector('#clear-location-button');

    // Event Listener untuk Preview Gambar
    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (file) {
            // Validasi ukuran file (misal maks 1MB)
            if (file.size > 1024 * 1024) {
                 this._showValidationError(photoInput, 'photo-error', 'Ukuran gambar maksimal 1MB.');
                 photoInput.value = ''; // Reset input file
                 imagePreview.style.display = 'none';
                 imagePreview.src = '#';
                 return;
            } else {
                 this._clearValidationError(photoInput, 'photo-error'); // Hapus error jika valid
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
             imagePreview.style.display = 'none';
             imagePreview.src = '#';
        }
    });

    // Event Listener untuk Hapus Lokasi
    clearLocationButton.addEventListener('click', () => {
        this.#selectedLat = null;
        this.#selectedLon = null;
        latInput.value = '';
        lonInput.value = '';
        document.querySelector('#selected-coordinates').textContent = 'Belum dipilih';
        if (this.#mapMarker) {
            this.#map.removeLayer(this.#mapMarker);
            this.#mapMarker = null;
        }
        clearLocationButton.style.display = 'none'; 
        this._clearValidationError(null, 'location-error'); // Hapus error lokasi jika ada
    });

    // Event Listener untuk Submit Form
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); 
      statusMessage.textContent = ''; 
      statusMessage.className = ''; 

      // Validasi Input Klien
      let isValid = true;
      isValid &= this._validateInput(descriptionInput, 'description-error', 'Deskripsi minimal 5 karakter.');
      isValid &= this._validateInput(photoInput, 'photo-error', 'Foto harus diunggah.');
      // Validasi file size lagi saat submit (jaga-jaga)
      if (photoInput.files[0] && photoInput.files[0].size > 1024 * 1024) {
          isValid &= this._showValidationError(photoInput, 'photo-error', 'Ukuran gambar maksimal 1MB.');
      }


      if (!isValid) {
        statusMessage.textContent = 'Harap perbaiki error pada form.';
        statusMessage.classList.add('error');
        return; 
      }

      // Persiapkan Data untuk API
      const storyData = {
        description: descriptionInput.value,
        photo: photoInput.files[0], 
        lat: this.#selectedLat, // Bisa jadi null jika tidak dipilih
        lon: this.#selectedLon, // Bisa jadi null jika tidak dipilih
      };

      // Kirim ke API
      loadingIndicator.style.display = 'block'; 
      submitButton.disabled = true; 

      try {
        const response = await addNewStory(storyData);
        statusMessage.textContent = response.message || 'Cerita berhasil ditambahkan!';
        statusMessage.classList.add('success');
        form.reset(); 
        imagePreview.style.display = 'none'; 
        imagePreview.src = '#';
        
        // Reset peta
        if (this.#mapMarker) {
            this.#map.removeLayer(this.#mapMarker);
            this.#mapMarker = null;
        }
        this.#selectedLat = null;
        this.#selectedLon = null;
        document.querySelector('#selected-coordinates').textContent = 'Belum dipilih';
        clearLocationButton.style.display = 'none';
        
        setTimeout(() => window.location.hash = '#/', 2000); 

      } catch (error) {
        statusMessage.textContent = `Gagal menambahkan cerita: ${error.message}`;
        statusMessage.classList.add('error');
      } finally {
        loadingIndicator.style.display = 'none'; 
        submitButton.disabled = false; 
      }
    });

    // Hapus pesan error saat pengguna mulai mengetik/memilih file lagi
    descriptionInput.addEventListener('input', () => this._clearValidationError(descriptionInput, 'description-error'));
    photoInput.addEventListener('input', () => this._clearValidationError(photoInput, 'photo-error'));
  }

  // Fungsi Inisialisasi Peta Pemilih Lokasi
  _initLocationPickerMap() {
     // Periksa jika Leaflet (L) ada
    if (typeof L === 'undefined') {
        console.error('Leaflet library (L) tidak ditemukan!');
        const locationError = document.querySelector('#location-error');
         if(locationError) {
             locationError.textContent = "Gagal memuat peta pemilih lokasi.";
         }
        return; // Hentikan inisialisasi
    }

    try {
      this.#map = L.map('location-picker-map').setView([-2.5489, 118.0149], 5); 

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap', // Keep attribution short
      }).addTo(this.#map);

      const latInput = document.querySelector('#latitude');
      const lonInput = document.querySelector('#longitude');
      const coordinatesDisplay = document.querySelector('#selected-coordinates');
      const clearLocationButton = document.querySelector('#clear-location-button');

      // Hapus listener lama jika ada
      if (this.#mapClickListener) {
          this.#map.off('click', this.#mapClickListener);
      }

      // Event Listener saat Peta Diklik
      this.#mapClickListener = (e) => {
        const { lat, lng } = e.latlng;
        this.#selectedLat = lat.toFixed(6); 
        this.#selectedLon = lng.toFixed(6);

        latInput.value = this.#selectedLat;
        lonInput.value = this.#selectedLon;
        coordinatesDisplay.textContent = `${this.#selectedLat}, ${this.#selectedLon}`;
        clearLocationButton.style.display = 'inline-block'; 
        this._clearValidationError(null, 'location-error'); // Hapus error lokasi

        if (this.#mapMarker) {
            this.#map.removeLayer(this.#mapMarker);
        }
        this.#mapMarker = L.marker([lat, lng]).addTo(this.#map);
        this.#map.panTo(e.latlng); 
      };
      
      this.#map.on('click', this.#mapClickListener);

    } catch (error) {
        console.error("Gagal menginisialisasi peta pemilih lokasi:", error);
        const locationError = document.querySelector('#location-error');
        if(locationError) {
             locationError.textContent = "Gagal memuat peta. Pastikan koneksi internet stabil.";
         }
    }
  }

  // Fungsi Validasi Input (Menampilkan Error)
  _validateInput(inputElement, errorElementId, errorMessage) {
    let isValid = true;
    const value = inputElement.value.trim();
    
    // Cek required
    if (inputElement.required) {
        if (inputElement.type === 'file' && inputElement.files.length === 0) {
            isValid = false;
        } else if (inputElement.type !== 'file' && value === '') {
             isValid = false;
             errorMessage = "Kolom ini wajib diisi."; // Pesan default required
        }
    }
     // Cek minlength (jika ada dan tidak kosong)
     if (isValid && inputElement.minLength > 0 && value.length < inputElement.minLength) {
         isValid = false;
         errorMessage = `Minimal ${inputElement.minLength} karakter.`; 
     }

    if (!isValid) {
        this._showValidationError(inputElement, errorElementId, errorMessage);
      return false;
    } else {
        this._clearValidationError(inputElement, errorElementId);
      return true;
    }
  }
  
  // Helper untuk menampilkan error
  _showValidationError(inputElement, errorElementId, message) {
      const errorContainer = document.getElementById(errorElementId);
      if (errorContainer) errorContainer.textContent = message;
      if (inputElement) inputElement.classList.add('input-invalid');
      return false; // Mengembalikan false untuk chaining validasi
  }
  
  // Helper untuk menghapus error
  _clearValidationError(inputElement, errorElementId) {
       const errorContainer = document.getElementById(errorElementId);
       if (errorContainer) errorContainer.textContent = ''; 
       if (inputElement) inputElement.classList.remove('input-invalid');
  }

}