import CONFIG from '../config.js';
import AuthUtils from '../utils/auth-utils.js'; 

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`, 
  LOGIN: `${CONFIG.BASE_URL}/login`,       
  GET_STORIES: `${CONFIG.BASE_URL}/stories`, 
  GET_STORIES_WITH_LOCATION: `${CONFIG.BASE_URL}/stories?location=1`, 
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`, 
  GET_STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  DELETE_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

async function _fetchWithAuth(url, options = {}, requiresAuth = false) {
    const headers = { ...options.headers }; 
    let body = options.body;

    if (requiresAuth) {
        const token = AuthUtils.getToken();
        if (!token) {
            throw new Error('Missing authentication');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(body instanceof FormData) && body && typeof body === 'object') { 
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body); 
    } 
    
    try {
        const response = await fetch(url, { 
            ...options, 
            headers, 
            body 
        });
        
        const responseJson = await response.json();

        if (!response.ok) { 
            throw new Error(responseJson.message || `Request failed with status ${response.status}`);
        }
        
        return responseJson;

    } catch (error) {
        // Lempar error agar bisa ditangkap di halaman yang memanggil
        throw error; 
    }
}

export async function registerUser(userData) {
    return _fetchWithAuth(ENDPOINTS.REGISTER, {
        method: 'POST',
        body: userData, 
    });
}

export async function loginUser(credentials) {
     const response = await _fetchWithAuth(ENDPOINTS.LOGIN, {
        method: 'POST',
        body: credentials,
    });
    if (!response.loginResult || !response.loginResult.token) {
        throw new Error("Respons login tidak valid.");
    }
    return response; 
}

export async function getStories() {
  // requiresAuth = true karena endpoint ini butuh token
  const response = await _fetchWithAuth(ENDPOINTS.GET_STORIES, {}, true); 
  return response.listStory || []; 
}

export async function getStoriesWithLocation() {
  const response = await _fetchWithAuth(ENDPOINTS.GET_STORIES_WITH_LOCATION, {}, true); 
  return response.listStory || []; 
}

export async function addNewStory(storyData) {
  const formData = new FormData();
  formData.append('description', storyData.description);
  formData.append('photo', storyData.photo); 
  if (storyData.lat != null && storyData.lon != null) { 
      formData.append('lat', storyData.lat);
      formData.append('lon', storyData.lon);
  }

  // Fetch akan otomatis set Content-Type multipart/form-data dengan boundary yang benar
  return _fetchWithAuth(ENDPOINTS.ADD_NEW_STORY, {
      method: 'POST',
      body: formData, 
  }, true); 
}

export async function getStoryDetail(id) { 
   if (!id) throw new Error("ID cerita diperlukan.");
   const response = await _fetchWithAuth(ENDPOINTS.GET_STORY_DETAIL(id), {}, true); 
   return response.story; 
}

export async function deleteStory(id) { 
   if (!id) throw new Error("ID cerita diperlukan.");
   return _fetchWithAuth(ENDPOINTS.DELETE_STORY(id), {
       method: 'DELETE', 
   }, true); 
}