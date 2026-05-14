import { PrismaClient } from "@prisma/client";
import { getHashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const ADMIN_ROLE = "SUPER_ADMIN";
const USER_ROLE = "NORMAL_USER";

const INIT_PERMISSIONS = [
  { name: "User Login", apiPath: "/api/v1/auth/login", method: "POST", module: "AUTH" },
  { name: "Register a new user", apiPath: "/api/v1/auth/register", method: "POST", module: "AUTH" },
  { name: "Get user information", apiPath: "/api/v1/auth/account", method: "GET", module: "AUTH" },
  { name: "Get User by refresh token", apiPath: "/api/v1/auth/refresh", method: "GET", module: "AUTH" },
  { name: "Logout User", apiPath: "/api/v1/auth/logout", method: "POST", module: "AUTH" },
  { name: "Create a new User", apiPath: "/api/v1/users", method: "POST", module: "USERS" },
  { name: "Fetch user with paginate", apiPath: "/api/v1/users", method: "GET", module: "USERS" },
  { name: "Fetch user by id", apiPath: "/api/v1/users/:id", method: "GET", module: "USERS" },
  { name: "Update a User", apiPath: "/api/v1/users/:id", method: "PATCH", module: "USERS" },
  { name: "Delete a User", apiPath: "/api/v1/users/:id", method: "DELETE", module: "USERS" }
];

async function main() {
  const systemAudit = {
    id: "system",
    email: "system@local"
  };

  const permissions = [];

  for (const permission of INIT_PERMISSIONS) {
    const permissionRecord = await prisma.permission.upsert({
      where: {
        apiPath_method: {
          apiPath: permission.apiPath,
          method: permission.method
        }
      },
      update: {
        name: permission.name,
        module: permission.module,
        deletedAt: null,
        updatedBy: systemAudit
      },
      create: {
        ...permission,
        createdBy: systemAudit
      }
    });

    permissions.push(permissionRecord);
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: ADMIN_ROLE },
    update: {
      description: "Admin full quyền",
      isActive: true,
      deletedAt: null,
      updatedBy: systemAudit
    },
    create: {
      name: ADMIN_ROLE,
      description: "Admin full quyền",
      isActive: true,
      createdBy: systemAudit
    }
  });

  const normalUserRole = await prisma.role.upsert({
    where: { name: USER_ROLE },
    update: {
      description: "Người dùng/Ứng viên sử dụng hệ thống",
      isActive: true,
      deletedAt: null,
      updatedBy: systemAudit
    },
    create: {
      name: USER_ROLE,
      description: "Người dùng/Ứng viên sử dụng hệ thống",
      isActive: true,
      createdBy: systemAudit
    }
  });

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: superAdminRole.id
    }
  });

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: superAdminRole.id,
      permissionId: permission.id
    })),
    skipDuplicates: true
  });

  const initPassword = process.env.INIT_PASSWORD || "123456";
  const hashedPassword = getHashPassword(initPassword);

  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      name: "I'm admin",
      password: hashedPassword,
      age: 69,
      gender: "MALE",
      address: "VietNam",
      roleId: superAdminRole.id,
      deletedAt: null,
      updatedBy: systemAudit
    },
    create: {
      name: "I'm admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      age: 69,
      gender: "MALE",
      address: "VietNam",
      roleId: superAdminRole.id,
      createdBy: systemAudit
    }
  });

  await prisma.user.upsert({
    where: { email: "hoidanit@gmail.com" },
    update: {
      name: "I'm Hoi Dan IT",
      password: hashedPassword,
      age: 96,
      gender: "MALE",
      address: "VietNam",
      roleId: superAdminRole.id,
      deletedAt: null,
      updatedBy: systemAudit
    },
    create: {
      name: "I'm Hoi Dan IT",
      email: "hoidanit@gmail.com",
      password: hashedPassword,
      age: 96,
      gender: "MALE",
      address: "VietNam",
      roleId: superAdminRole.id,
      createdBy: systemAudit
    }
  });

  await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {
      name: "I'm normal user",
      password: hashedPassword,
      age: 69,
      gender: "MALE",
      address: "VietNam",
      roleId: normalUserRole.id,
      deletedAt: null,
      updatedBy: systemAudit
    },
    create: {
      name: "I'm normal user",
      email: "user@gmail.com",
      password: hashedPassword,
      age: 69,
      gender: "MALE",
      address: "VietNam",
      roleId: normalUserRole.id,
      createdBy: systemAudit
    }
  });

  console.log("Seed completed:", {
    permissions: permissions.length,
    roles: [ADMIN_ROLE, USER_ROLE],
    users: ["admin@gmail.com", "hoidanit@gmail.com", "user@gmail.com"]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
