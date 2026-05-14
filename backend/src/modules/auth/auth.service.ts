import ms from "ms";
import { Response } from "express";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { RequestUser } from "../../types/express";
import { getHashPassword, isValidPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AuthenticatedUser } from "./auth.types";

const USER_ROLE = "NORMAL_USER";

function badRequest(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 400;
  return error;
}

function unauthorized(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 401;
  return error;
}

async function buildAuthenticatedUser(user: {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions?: Array<{
      permission: {
        id: string;
        name: string;
        apiPath: string;
        method: string;
        module: string;
      };
    }>;
  };
}): Promise<AuthenticatedUser> {
  const permissions =
    user.role.permissions?.map(({ permission }) => ({
      _id: permission.id,
      name: permission.name,
      apiPath: permission.apiPath,
      method: permission.method,
      module: permission.module
    })) ?? [];

  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: {
      _id: user.role.id,
      name: user.role.name
    },
    permissions
  };
}

function setRefreshTokenCookie(response: Response, refreshToken: string) {
  response.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    maxAge: ms(env.JWT_REFRESH_EXPIRE)
  });
}

export class AuthService {
  async register(input: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    address: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.email,
        deletedAt: null
      }
    });

    if (existingUser) {
      throw badRequest(`Email: ${input.email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`);
    }

    const userRole = await prisma.role.findFirst({
      where: {
        name: USER_ROLE,
        deletedAt: null
      }
    });

    if (!userRole) {
      throw badRequest("Role mặc định không tồn tại.");
    }

    const newUser = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: getHashPassword(input.password),
        age: input.age,
        gender: input.gender,
        address: input.address,
        roleId: userRole.id
      }
    });

    return {
      _id: newUser.id,
      createdAt: newUser.createdAt
    };
  }

  async validateUser(username: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: username,
        deletedAt: null
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw unauthorized("Username/password không hợp lệ!");
    }

    if (!isValidPassword(password, user.password)) {
      throw unauthorized("Username/password không hợp lệ!");
    }

    return buildAuthenticatedUser(user);
  }

  async login(user: AuthenticatedUser, response: Response) {
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const refreshToken = signRefreshToken(payload);
    await prisma.user.update({
      where: { id: user._id },
      data: { refreshToken }
    });

    setRefreshTokenCookie(response, refreshToken);

    return {
      access_token: signAccessToken(payload),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    };
  }

  async getAccount(user: RequestUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user._id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!dbUser || dbUser.deletedAt) {
      throw unauthorized("User không tồn tại.");
    }

    const authUser = await buildAuthenticatedUser(dbUser);

    return {
      user: authUser
    };
  }

  async refresh(refreshToken: string | undefined, response: Response) {
    if (!refreshToken) {
      throw badRequest("Refresh token không hợp lệ. Vui lòng login.");
    }

    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw badRequest("Refresh token không hợp lệ. Vui lòng login.");
    }

    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
        deletedAt: null
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw badRequest("Refresh token không hợp lệ. Vui lòng login.");
    }

    const authUser = await buildAuthenticatedUser(user);
    const payload = {
      _id: authUser._id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role
    };

    const nextRefreshToken = signRefreshToken(payload);

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        refreshToken: nextRefreshToken
      }
    });

    response.clearCookie("refresh_token");
    setRefreshTokenCookie(response, nextRefreshToken);

    return {
      access_token: signAccessToken(payload),
      user: authUser
    };
  }

  async logout(user: RequestUser, response: Response) {
    await prisma.user.update({
      where: { id: user._id },
      data: { refreshToken: "" }
    });

    response.clearCookie("refresh_token");
    return "ok";
  }

  async loadUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user || user.deletedAt) {
      return null;
    }

    return buildAuthenticatedUser(user);
  }
}

export const authService = new AuthService();
