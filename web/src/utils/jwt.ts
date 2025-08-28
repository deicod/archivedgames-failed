export function parseJwt(token?: string | null): any | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base);
    return JSON.parse(json);
  } catch { return null; }
}

export function isAdminFromToken(token?: string | null): boolean {
  const p = parseJwt(token);
  const roles = (p?.realm_access?.roles as string[]|undefined) || [];
  return Array.isArray(roles) && roles.includes('admin');
}
