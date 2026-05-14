import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "../config/env";

type JwtUserPayload = {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
};

export function signAccessToken(payload: JwtUserPayload) {
  return jwt.sign(
    {
      sub: "token login",
      iss: "from server",
      ...payload
    },
    env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: ms(env.JWT_ACCESS_EXPIRE) / 1000
    }
  );
}

export function signRefreshToken(payload: JwtUserPayload) {
  return jwt.sign(
    {
      sub: "token refresh",
      iss: "from server",
      ...payload
    },
    env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: ms(env.JWT_REFRESH_EXPIRE) / 1000
    }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET);
}
