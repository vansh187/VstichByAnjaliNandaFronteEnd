import { post } from "./http";

export function signup(payload) {
  return post("/signup", payload);
}

export function login(payload) {
  return post("/login", payload);
}
