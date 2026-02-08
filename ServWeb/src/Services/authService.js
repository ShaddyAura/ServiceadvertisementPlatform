import api from "../api/axios";

// export async function register(data) {
//   return await api.post("/Account/register", data);
// }

// export async function login(email, password) {
//   return await api.post("/Account/login", { email, password });
// }

// export async function logout() {
//   return await api.post("/Account/logout");
// }

export async function getCurrentUser() {
  try {
    const res = await api.get("/account/me", { withCredentials: true });
    return res.data; // { email, role}
  } catch {
    return null;
  }
}

export async function handleGoogleCallback() {
  return await getCurrentUser();
}
