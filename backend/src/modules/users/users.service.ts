import { prisma } from "../../config/prisma";
import { RequestUser } from "../../types/express";
import { buildAuditUser } from "../../utils/audit";
import { getHashPassword } from "../../utils/password";
import { parsePagination } from "../../utils/pagination";

function badRequest(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 400;
  return error;
}

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  address: string;
  company: unknown;
  role?: { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    gender: user.gender,
    address: user.address,
    company: user.company,
    role: user.role
      ? {
          _id: user.role.id,
          name: user.role.name
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export class UsersService {
  async create(
    input: {
      name: string;
      email: string;
      password: string;
      age: number;
      gender: string;
      address: string;
      role: string;
      company: {
        _id: string;
        name: string;
      };
    },
    actor: RequestUser
  ) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.email,
        deletedAt: null
      }
    });

    if (existingUser) {
      throw badRequest(`Email: ${input.email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`);
    }

    const newUser = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: getHashPassword(input.password),
        age: input.age,
        gender: input.gender,
        address: input.address,
        roleId: input.role,
        company: input.company,
        createdBy: buildAuditUser(actor)
      }
    });

    return {
      _id: newUser.id,
      createdAt: newUser.createdAt
    };
  }

  async findAll(query: Record<string, unknown>) {
    const { currentPage, limit, skip, sort, filter } = parsePagination(query);

    const where = {
      deletedAt: null,
      ...buildUserWhere(filter)
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          role: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ]);

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: Math.ceil(total / limit),
        total
      },
      result: users.map((user) => sanitizeUser(user))
    };
  }

  async findOne(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return "not found user";
    }

    return sanitizeUser(user);
  }

  async update(
    input: {
      _id: string;
      name: string;
      email: string;
      age: number;
      gender: string;
      address: string;
      role: string;
      company: {
        _id: string;
        name: string;
      };
    },
    actor: RequestUser
  ) {
    const result = await prisma.user.updateMany({
      where: {
        id: input._id,
        deletedAt: null
      },
      data: {
        name: input.name,
        email: input.email,
        age: input.age,
        gender: input.gender,
        address: input.address,
        roleId: input.role,
        company: input.company,
        updatedBy: buildAuditUser(actor)
      }
    });

    return result;
  }

  async remove(id: string, actor: RequestUser) {
    const foundUser = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!foundUser) {
      return "not found user";
    }

    if (foundUser.email === "admin@gmail.com") {
      throw badRequest("Không thể xóa tài khoản admin@gmail.com");
    }

    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: buildAuditUser(actor)
      }
    });
  }
}

function buildUserWhere(filter: Record<string, unknown>) {
  const where: Record<string, unknown> = {};

  if (typeof filter.email === "string") {
    where.email = filter.email;
  }

  if (typeof filter.gender === "string") {
    where.gender = filter.gender;
  }

  if (typeof filter.name === "string") {
    where.name = {
      contains: filter.name,
      mode: "insensitive"
    };
  }

  if (typeof filter.roleId === "string") {
    where.roleId = filter.roleId;
  }

  return where;
}

export const usersService = new UsersService();
