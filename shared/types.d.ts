/* AUTO-GENERATED FROM JSON SCHEMA. DO NOT EDIT BY HAND. */

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  email: string;
  name: string;
  password: string;
  role?: "admin" | "user";
}

export interface UserUpdate {
  email?: string;
  name?: string;
  password?: string;
  role?: "admin" | "user";
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

