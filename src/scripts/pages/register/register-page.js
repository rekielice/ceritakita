import { registerUser } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    // == Tambahkan Form HTML Lengkap ==
    return `
      <section class="container">
        <h1>Register Akun Baru</h1>
        <form id="register-form" novalidate>
           <div class="form-group">
            <label for="name">Nama:</label>
            <input type="text" id="name" name="name" required minlength="3" autocomplete="name"> 
            <div class="input-error" id="name-error"></div>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required autocomplete="email">
            <div class="input-error" id="email-error"></div>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="8" autocomplete="new-password"> 
            <div class="input-error" id="password-error"></div>
          </div>
          <button type="submit" id="register-submit-button">Register</button>
          <div id="register-loading-indicator" style="display: none; margin-top: 15px;">Mendaftarkan...</div>
          <div id="register-status-message" style="margin-top: 15px;"></div> 
          <p style="margin-top: 15px;">Sudah punya akun? <a href="#/login">Login di sini</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // == Tambahkan Logika Submit Lengkap ==
    const registerForm = document.querySelector('#register-form');
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const submitButton = document.querySelector('#register-submit-button');
    const loadingIndicator = document.querySelector('#register-loading-indicator');
    const statusMessage = document.querySelector('#register-status-message');

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      statusMessage.textContent = '';
      statusMessage.className = '';

      let isValid = true;
       isValid &= this._validateInput(nameInput, 'name-error', 'Nama minimal 3 karakter.', 'text');
      isValid &= this._validateInput(emailInput, 'email-error', 'Format email tidak valid.', 'email');
      isValid &= this._validateInput(passwordInput, 'password-error', 'Password minimal 8 karakter.', 'password');

       if (!isValid) {
          statusMessage.textContent = 'Harap perbaiki error pada form.';
          statusMessage.classList.add('error');
          return;
      }

      const registerData = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
      };

      loadingIndicator.style.display = 'block';
      submitButton.disabled = true;

      try {
        console.log("Mencoba register dengan data:", registerData); 
        const registerResponse = await registerUser(registerData); 
        console.log("Respons API Register:", registerResponse); 
        
         if (registerResponse.error) {
           throw new Error(registerResponse.message || 'Registrasi gagal dari server.');
        }

        statusMessage.textContent = registerResponse.message || 'Registrasi berhasil! Silakan login.';
        statusMessage.classList.add('success');
        registerForm.reset();

        setTimeout(() => { window.location.hash = '#/login'; }, 2000); 
        
      } catch (error) { 
        console.error("Register Error:", error); 
        statusMessage.textContent = `Registrasi gagal: ${error.message}`;
        statusMessage.classList.add('error');
      } finally {
        loadingIndicator.style.display = 'none';
        submitButton.disabled = false;
      }
    });

    nameInput.addEventListener('input', () => this._clearValidationError(nameInput, 'name-error'));
    emailInput.addEventListener('input', () => this._clearValidationError(emailInput, 'email-error'));
    passwordInput.addEventListener('input', () => this._clearValidationError(passwordInput, 'password-error'));
  }
  
  // == Fungsi Validasi & Helper (Sama seperti di login-page) ==
  _validateInput(inputElement, errorElementId, errorMessage, type = 'text') {
    const errorContainer = document.getElementById(errorElementId);
    let isValid = true;
    const value = inputElement.value.trim();

    if (inputElement.required && value === '') {
        isValid = false;
        errorMessage = "Kolom ini wajib diisi.";
    } else if (type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
         isValid = false;
    } else if ((type === 'password' || type === 'text') && inputElement.minLength > 0 && value.length < inputElement.minLength) {
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

  _showValidationError(inputElement, errorElementId, message) {
      const errorContainer = document.getElementById(errorElementId);
      if (errorContainer) errorContainer.textContent = message;
      if (inputElement) inputElement.classList.add('input-invalid');
      return false; 
  }
  
  _clearValidationError(inputElement, errorElementId) {
       const errorContainer = document.getElementById(errorElementId);
       if (errorContainer) errorContainer.textContent = ''; 
       if (inputElement) inputElement.classList.remove('input-invalid');
  }
}