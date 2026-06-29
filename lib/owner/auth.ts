export const OWNER_PIN = "7188";
export const OWNER_COOKIE = "owner_auth";
export const OWNER_NAME_KEY = "owner_name";
export const OWNER_AUTH_LOCAL_KEY = "owner_auth_local";

export function setOwnerSession(name: string): void {
  const trimmed = name.trim();
  localStorage.setItem(OWNER_NAME_KEY, trimmed);
  localStorage.setItem(OWNER_AUTH_LOCAL_KEY, "1");
  document.cookie = `${OWNER_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearOwnerSession(): void {
  localStorage.removeItem(OWNER_NAME_KEY);
  localStorage.removeItem(OWNER_AUTH_LOCAL_KEY);
  document.cookie = `${OWNER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getOwnerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(OWNER_NAME_KEY)?.trim() || "";
}

export function isOwnerPinValid(pin: string): boolean {
  return pin === OWNER_PIN;
}
