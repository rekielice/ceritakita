import { loginUser } from '../../data/api.js'; 
import AuthUtils from '../../utils/auth-utils.js'; 

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login</h1>
        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required autocomplete="email"> 
            <div class="input-error" id="email-error"></div>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="8" autocomplete="current-password"> 
            <div class="input-error" id="password-error"></div>
          </div>
          <button type="submit" id="login-submit-button">Login</button>
          <div id="login-loading-indicator" style="display: none; margin-top: 15px;">Logging in...</div>
          <div id="login-status-message" style="margin-top: 15px;"></div> 
          <p style="margin-top: 15px;">Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.querySelector('#login-form');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const submitButton = document.querySelector('#login-submit-button');
    const loadingIndicator = document.querySelector('#login-loading-indicator');
    const statusMessage = document.querySelector('#login-status-message');

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      statusMessage.textContent = '';
      statusMessage.className = '';

      // Validasi Klien (tetap sama)
      let isValid = true;
      isValid &= this._validateInput(emailInput, 'email-error', 'Format email tidak valid.', 'email');
      isValid &= this._validateInput(passwordInput, 'password-error', 'Password minimal 8 karakter.', 'password');

      if (!isValid) {  return; }

      const loginData = {
        email: emailInput.value,
        password: passwordInput.value,
      };

      loadingIndicator.style.display = 'block';
      submitButton.disabled = true;

      try {
        console.log("Mencoba login dengan data:", loginData); 
        const loginResponse = await loginUser(loginData); 
        console.log("Respons API Login:", loginResponse); 

        if (loginResponse.error) {
           throw new Error(loginResponse.message || 'Login gagal dari server.');
        }

        if (loginResponse.loginResult && loginResponse.loginResult.token) {
            AuthUtils.saveToken(loginResponse.loginResult.token); 
            AuthUtils.saveUserInfo({ 
                userId: loginResponse.loginResult.userId,
                name: loginResponse.loginResult.name,
            }); 

            statusMessage.textContent = 'Login berhasil! Mengalihkan ke Beranda...';
            statusMessage.classList.add('success');
            window.dispatchEvent(new Event('auth-change')); 
            setTimeout(() => { window.location.hash = '#/'; }, 1500); 
        } else {
            
             throw new Error("Respons login dari server tidak valid (tidak ada token).");
        }
        // ===== AKHIR BAGIAN YANG DIGANTI =====

      } catch (error) { 
        console.error("Login Error:", error); 
        statusMessage.textContent = `Login gagal: ${error.message}`;
        statusMessage.classList.add('error');
      } finally {
        loadingIndicator.style.display = 'none';
        submitButton.disabled = false;
      }
    });

      emailInput.addEventListener('input', () => this._clearValidationError(emailInput, 'email-error'));
      passwordInput.addEventListener('input', () => this._clearValidationError(passwordInput, 'password-error'));
  }
  
    _validateInput(inputElement, errorElementId, errorMessage, type = 'text') {
        const errorContainer = document.getElementById(errorElementId);
        let isValid = true;
        const value = inputElement.value.trim();

        if (inputElement.required && value === '') {
            isValid = false;
            errorMessage = "Kolom ini wajib diisi.";
        } else if (type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { 
             isValid = false;
             // errorMessage sudah di-pass
        } else if (type === 'password' && inputElement.minLength > 0 && value.length < inputElement.minLength) {
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