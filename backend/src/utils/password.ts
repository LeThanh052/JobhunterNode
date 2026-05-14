import { compareSync, genSaltSync, hashSync } from "bcryptjs";

export function getHashPassword(password: string) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}

export function isValidPassword(password: string, hash: string) {
  return compareSync(password, hash);
}
