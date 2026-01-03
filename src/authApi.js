import axios from "axios";

const AUTH_API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const signupUser = (data) => {
  return AUTH_API.post("/auth/signup", data);
};

export const loginUser = (data) => {
  return AUTH_API.post("/auth/login", data);
};
