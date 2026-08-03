# Grupo+ Platform

Monorepo for a Brazilian creator community portal. The public interface is in pt-BR; the codebase and technical documentation are in English.

## Applications

- `apps/web`: React, Vite, TypeScript, React Router, Framer Motion public portal and demonstration admin area.
- `apps/api`: Express, MongoDB/Mongoose and JWT REST API.

## Local setup

1. Install Node.js 20+ and MongoDB (or create a MongoDB Atlas cluster).
2. Run `npm install` from this directory.
3. Copy `apps/api/.env.example` to `apps/api/.env` and configure the values.
4. Optionally run `npm run seed --workspace=criadores-api` to create sample records.
5. In separate terminals, run `npm run dev:web` and `npm run dev:api`.

The web app is available at `http://localhost:5173`; the API runs on `http://localhost:4000`.

## API

Public resources are available under `/api/members`, `/api/projects`, `/api/articles`, `/api/events`, `/api/seasons`, `/api/players`, and `/api/battles`. Mutating routes require `Authorization: Bearer <JWT>`, obtained from `POST /auth/login`.

`POST /api/uploads` deliberately returns `501` until a storage provider (Cloudinary, S3, or Vercel Blob) is connected; no uploads are accepted into the application filesystem in production.

## Deployment

Deploy `apps/web` to Vercel with its build command set to `npm run build` and root directory set to `apps/web`. Deploy `apps/api` to Railway or Render with the start command `npm run start`, set its root directory to `apps/api`, and provide the environment values from `.env.example`. Configure MongoDB Atlas network access for the API deployment and set `CLIENT_ORIGIN` to the Vercel deployment URL.
