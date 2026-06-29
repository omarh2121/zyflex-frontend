export const VALID_PIN = "2121";
export const AUTH_COOKIE = "odense_auth";
export const DRIVER_NAME_KEY = "odense_driver_name";
export const AUTH_LOCAL_KEY = "odense_auth_local";

export function setAuthSession(name: string): void {
  const trimmed = name.trim();
  localStorage.setItem(DRIVER_NAME_KEY, trimmed);
  localStorage.setItem(AUTH_LOCAL_KEY, "1");
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  localStorage.removeItem(DRIVER_NAME_KEY);
  localStorage.removeItem(AUTH_LOCAL_KEY);
  localStorage.removeItem("odense_driver_id");
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getDriverName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(DRIVER_NAME_KEY)?.trim() || "";
}

export function isPinValid(pin: string): boolean {
  return pin === VALID_PIN;
}
