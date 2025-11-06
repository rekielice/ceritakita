export function showFormattedDate(date, locale = 'id-ID', options = {}) { 
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  try {
      return new Date(date).toLocaleDateString(locale, {
        ...defaultOptions,
        ...options,
      });
  } catch (error) {
      console.error("Error formatting date:", date, error);
      return "Tanggal tidak valid"; 
  }
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}