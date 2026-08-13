const KEY = "unimpresa_admin_token";
const USER_KEY = "unimpresa_admin_user";

export function getAdminToken(): string {
  return localStorage.getItem(KEY) ?? "";
}
export function setAdminSession(token: string, username: string) {
  localStorage.setItem(KEY, token);
  localStorage.setItem(USER_KEY, username);
}
export function getAdminUser(): string {
  return localStorage.getItem(USER_KEY) ?? "admin";
}
export function clearAdminSession() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
}
