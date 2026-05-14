# Git Workflow

## Goal

Do not push directly to `main`.

Use this flow instead:

1. Create a feature branch
2. Push code to that branch
3. Let GitHub Actions run CI
4. Merge feature branch into `develop` for staging deploy
5. Verify staging
6. Open or merge into `main`
7. Deploy production after `main` is updated

## Branch Naming

Recommended patterns:

- `feature/auth-prisma`
- `feature/users-module`
- `fix/login-refresh-token`
- `chore/docker-ci`

## Local Commands

Create a new branch:

```bash
git checkout -b feature/my-change
```

Push branch to remote:

```bash
git push -u origin feature/my-change
```

Open a PR into `main` after CI passes.
Recommended release flow:

```bash
feature/* -> develop -> main
```

## CI Behavior

Configured in:

- `.github/workflows/backend-ci.yml`
- `.github/workflows/backend-cd.yml`

What CI does:

1. Install dependencies in `backend/`
2. Generate Prisma client
3. Start PostgreSQL service in GitHub Actions
4. Run `prisma db push`
5. Run lint
6. Run TypeScript build
7. Run test command

What CD does:

1. On push to `develop`, deploy to staging server
2. On push to `main`, deploy to production server
3. Both deploy jobs update the repo on the server and restart Docker Compose

## Required GitHub Setting

In GitHub repository settings, enable branch protection for `main`:

1. Go to `Settings`
2. Open `Branches`
3. Add a protection rule for `main`
4. Enable:
   - `Require a pull request before merging`
   - `Require status checks to pass before merging`
5. Select the check:
   - `Validate Backend`

This is the step that prevents direct pushes to `main`.

## Required GitHub Secrets

For staging:

- `STAGING_HOST`
- `STAGING_USER`
- `STAGING_SSH_KEY`
- `STAGING_PORT`
- `STAGING_APP_PATH`

For production:

- `PRODUCTION_HOST`
- `PRODUCTION_USER`
- `PRODUCTION_SSH_KEY`
- `PRODUCTION_PORT`
- `PRODUCTION_APP_PATH`

## Recommended Branch Protection

For `develop`:

- require status checks before merge

For `main`:

- require pull request before merge
- require status checks before merge
- require branches to be up to date before merging
- optionally restrict direct pushes
