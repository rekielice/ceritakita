function extractPathnameSegments(path) {
  const splitUrl = path.split('/').filter(segment => segment); 
  return {
    resource: splitUrl[0] || null, 
    id: splitUrl[1] || null,       
  };
}

// Fungsi ini MEMBUAT KEMBALI pola rute dari segmen
function constructRoutePatternFromSegments(pathSegments) {
  let pattern = '';

  if (pathSegments.resource) {
    pattern = pattern.concat(`/${pathSegments.resource}`);
  }

  // Jika ada ID, GANTI ID asli dengan placeholder ':id'
  if (pathSegments.id) {
    pattern = pattern.concat('/:id'); 
  }

  return pattern || '/'; 
}

// Mendapatkan path aktif dari hash URL (tanpa '#')
export function getActivePathname() {
  // Ambil hash, hapus '#', hapus query string jika ada
  return location.hash.replace(/^#/, '').split('?')[0] || '/'; 
}

// == Fungsi Utama untuk Router (App.js) ==
// Mengembalikan POLA RUTE yang cocok (e.g., '/', '/story/:id')
export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRoutePatternFromSegments(urlSegments);
}

// == Fungsi untuk Halaman Detail ==
// Mengembalikan SEGMEN URL (termasuk ID asli)
export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

// (Fungsi getRoute dan parsePathname di bawah ini mungkin redundan jika hanya menggunakan yang _Active_)
export function getRoutePattern(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRoutePatternFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}