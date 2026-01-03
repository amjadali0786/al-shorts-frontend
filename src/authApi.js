import axios from "axios";

const AUTH_API = axios.create({
  baseURL: "https://al-shorts-backend.onrender.com",
});

export const signupUser = (data) => {
  return AUTH_API.post("/auth/signup", data);
};

export const loginUser = (data) => {
  return AUTH_API.post("/auth/login", data);
};
