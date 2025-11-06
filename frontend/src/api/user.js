// src/api/user.js
import API from "./axios";

/**
 * 🔑 Register new user
 * @param {Object} data { name, email, password, phone?, location? }
 */
export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);
  const { token, user } = res.data;
  if (token) localStorage.setItem("token", token);
  return user;
};

/**
 * 🔑 Login user
 * @param {Object} data { email, password }
 */
export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  const { token, user } = res.data;
  if (token) localStorage.setItem("token", token);
  return user;
};

/**
 * 🚪 Logout user (client-side only)
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
};

/**
 * 👤 Get user profile
 */
export const getProfile = async () => {
  const res = await API.get("/users/me");
  return res.data;
};

/**
 * ✏️ Update user profile
 */
export const updateProfile = async (data) => {
  const res = await API.put("/users/me", data);
  return res.data;
};

/**
 * 🗑 Delete account
 */
export const deleteAccount = async () => {
  const res = await API.delete("/users/me");
  return res.data;
};
