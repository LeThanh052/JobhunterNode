# Backend Migration Plan

## Scope

Migrate `beNest/` from:

- NestJS
- MongoDB + Mongoose

to:

- Express + TypeScript
- PostgreSQL + Prisma

Primary constraint:

- Keep the frontend-compatible API behavior as close as possible to the current NestJS backend.

## Current API Contract

Base behavior from NestJS:

- Global prefix: `/api`
- Versioning: `/v1`
- Response wrapper:

```json
{
  "statusCode": 200,
  "message": "Response message",
  "data": {}
}
```

- Auth:
  - Access token in response body
  - Refresh token in `refresh_token` httpOnly cookie
- Authorization:
  - Route permission matched by `method + apiPath`

## Express Target Structure

```txt
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── prisma.ts
│   ├── constants/
│   │   └── auth.ts
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── types/
│   └── modules/
└── package.json
```

## Data Modeling Strategy

MongoDB currently mixes:

- true relations
- denormalized snapshots
- audit objects
- embedded arrays

For PostgreSQL, use this rule:

- Normalize real entities into tables
- Keep volatile snapshots in `Json`
- Replace Mongo soft delete with nullable `deletedAt`

### Keep as relations

- `User -> Role`
- `Role <-> Permission`
- `Resume -> User`
- `Resume -> Company`
- `Resume -> Job`

### Keep as JSON

- `user.company`
- `job.company`
- `createdBy`
- `updatedBy`
- `deletedBy`
- `resume.history`

This is the safest first migration because it preserves the current API shape with less transformation risk.

## Proposed Prisma Models

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  age           Int
  gender        String
  address       String
  company       Json?
  refreshToken  String?
  roleId        String
  role          Role      @relation(fields: [roleId], references: [id])
  resumes       Resume[]
  createdBy     Json?
  updatedBy     Json?
  deletedBy     Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
}

model Role {
  id            String           @id @default(cuid())
  name          String           @unique
  description   String
  isActive      Boolean
  users         User[]
  permissions   RolePermission[]
  createdBy     Json?
  updatedBy     Json?
  deletedBy     Json?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  deletedAt     DateTime?
}

model Permission {
  id            String           @id @default(cuid())
  name          String
  apiPath       String
  method        String
  module        String
  roles         RolePermission[]
  createdBy     Json?
  updatedBy     Json?
  deletedBy     Json?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  deletedAt     DateTime?

  @@unique([apiPath, method])
}

model RolePermission {
  roleId        String
  permissionId  String
  role          Role        @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission    Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model Company {
  id            String    @id @default(cuid())
  name          String
  address       String
  description   String
  logo          String
  resumes       Resume[]
  createdBy     Json?
  updatedBy     Json?
  deletedBy     Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
}

model Job {
  id            String    @id @default(cuid())
  name          String
  skills        String[]
  company       Json
  location      String
  salary        Int
  quantity      Int
  level         String
  description   String
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean
  resumes       Resume[]
  createdBy     Json?
  updatedBy     Json?
  deletedBy     Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
}

model Resume {
  id            String    @id @default(cuid())
  email         String
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  url           String
  status        String
  companyId     String
  company       Company   @relation(fields: [companyId], references: [id])
  jobId         String
  job           Job       @relation(fields: [jobId], references: [id])
  history       Json
  createdBy     Json?
  updatedBy     Json?
  deletedBy     Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
}

model Subscriber {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  skills        String[]
  createdBy     Json?
  updatedBy     Json?
  deletedBy     Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
}
```

## Why This Schema

This schema intentionally does not fully normalize `job.company` and `user.company`.

Reason:

- The current frontend/backend contract sends and stores company snapshots directly.
- Forcing a hard relation immediately would require more API reshaping and migration logic.
- A later phase can replace snapshot `Json` with `companyId` if needed.

## Route Mapping

These routes should be preserved exactly for compatibility:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/account`
- `GET /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/users`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users`
- `DELETE /api/v1/users/:id`
- `POST /api/v1/companies`
- `GET /api/v1/companies`
- `GET /api/v1/companies/:id`
- `PATCH /api/v1/companies/:id`
- `DELETE /api/v1/companies/:id`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:id`
- `PATCH /api/v1/jobs/:id`
- `DELETE /api/v1/jobs/:id`
- `POST /api/v1/permissions`
- `GET /api/v1/permissions`
- `GET /api/v1/permissions/:id`
- `PATCH /api/v1/permissions/:id`
- `DELETE /api/v1/permissions/:id`
- `POST /api/v1/roles`
- `GET /api/v1/roles`
- `GET /api/v1/roles/:id`
- `PATCH /api/v1/roles/:id`
- `DELETE /api/v1/roles/:id`
- `POST /api/v1/resumes`
- `POST /api/v1/resumes/by-user`
- `GET /api/v1/resumes`
- `GET /api/v1/resumes/:id`
- `PATCH /api/v1/resumes/:id`
- `DELETE /api/v1/resumes/:id`
- `POST /api/v1/subscribers`
- `POST /api/v1/subscribers/skills`
- `GET /api/v1/subscribers`
- `GET /api/v1/subscribers/:id`
- `PATCH /api/v1/subscribers`
- `DELETE /api/v1/subscribers/:id`
- `POST /api/v1/files/upload`
- `GET /api/v1/health`
- `GET /api/v1/mail`

## Middleware Plan

### Authentication middleware

- Read bearer token from `Authorization`
- Verify access token
- Load user role and permissions
- Attach `req.user`

### Permission middleware

- Skip when route is public
- Skip when route has `skipPermission`
- Match current route pattern against stored permission `apiPath`
- Allow all `/api/v1/auth/*` after successful auth, matching the current NestJS behavior

### Response middleware

Wrap successful responses as:

```json
{
  "statusCode": 200,
  "message": "Fetch user with paginate",
  "data": {}
}
```

## Validation Migration

Replace Nest `class-validator` DTOs with Express validators.

Recommended:

- `zod`

Reason:

- Good TypeScript inference
- Easier schema composition
- Simpler than recreating Nest DTO patterns

## Query Parsing

Current Nest code relies on `api-query-params`.

To reduce frontend regressions:

- Keep using `api-query-params` in Express for the first migration
- Reproduce:
  - filter
  - sort
  - select/projection
  - pagination

## Soft Delete Strategy

Replace Mongoose soft delete plugin with:

- `deletedAt: DateTime?`

Application rule:

- all reads exclude `deletedAt != null`
- deletes become updates setting:
  - `deletedAt`
  - `deletedBy`

## Seed Strategy

Recreate NestJS init data in Prisma seed:

- permissions from `beNest/src/databases/sample.ts`
- roles:
  - `SUPER_ADMIN`
  - `NORMAL_USER`
- users:
  - `admin@gmail.com`
  - `hoidanit@gmail.com`
  - `user@gmail.com`

## Known Compatibility Risks

1. NestJS currently uses Mongo ObjectId semantics in DTO validation.
2. Permission records currently store route patterns like `/api/v1/users/:id`, but some controllers actually update via `PATCH /users`.
3. `job.company` and `user.company` are snapshots, not strict foreign keys.
4. `resume.history` is append-only embedded data and should not be flattened too early.

## Recommended Build Order

1. Create `package.json`, `tsconfig.json`, Prisma setup, and env loader.
2. Create Prisma schema and initial migration.
3. Implement shared middleware:
   - auth
   - permission
   - response wrapper
   - error handler
4. Implement auth module.
5. Implement roles and permissions.
6. Implement users.
7. Implement companies and jobs.
8. Implement resumes and subscribers.
9. Implement file upload and health.
10. Implement seed script and verify API compatibility.

## Immediate Next Step

Generate the initial `backend/prisma/schema.prisma` and scaffold the Express app around this migration plan.
