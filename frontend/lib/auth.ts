export type UserRole = "admin" | "supervisor" | "employee";

export type User = {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  leaveBalance?: number;
};

export type LoginResponse = {
  access: string;
  refresh?: string;
  user: User;
};

export function setSession(data: LoginResponse) {
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