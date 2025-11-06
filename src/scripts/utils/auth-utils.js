const TOKEN_KEY = 'authToken';
const USER_INFO_KEY = 'userInfo';

const AuthUtils = {
  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getToken(); 
  },

  saveUserInfo(userInfo) {
     localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  getUserInfo() {
      const userInfo = localStorage.getItem(USER_INFO_KEY);
      try {
          return userInfo ? JSON.parse(userInfo) : null;
      } catch (e) {
          return null;
      }
  },

  removeUserInfo() {
      localStorage.removeItem(USER_INFO_KEY);
  },

  logout() {
    this.removeToken();
    this.removeUserInfo(); 
  },
};

export default AuthUtils;