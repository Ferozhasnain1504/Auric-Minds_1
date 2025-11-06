import API from "./axios";

// ✅ Get user data
export const getProfile = async () => {
  const res = await API.get("/users/me");
  return res.data;
};

// ✅ Update user profile
export const updateProfile = async (data) => {
  const res = await API.put("/users/me", data);
  return res.data;
};

// ✅ Delete account
export const deleteAccount = async () => {
  const res = await API.delete("/users/me");
  return res.data;
};
