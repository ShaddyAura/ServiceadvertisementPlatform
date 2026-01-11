import { jwtDecode } from 'jwt-decode';

export function getToken() {
  return localStorage.getItem('token'); // ✅ same key used
}

export function getUserRole() {
  try {
    const token = getToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  return user?.role === "Admin";
}

