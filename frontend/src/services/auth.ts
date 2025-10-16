// src/services/auth.ts
import { fetchData } from "./api";

// Fungsi untuk login user;
export async function loginUser(email: string, password: string, role: string) {
  return fetchData("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}
// Fungsi untuk register user
export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: string
) {
  return fetchData("auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}
