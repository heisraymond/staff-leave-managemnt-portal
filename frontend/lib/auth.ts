export function setSession(data: any) {
  localStorage.setItem("token", data.access);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}