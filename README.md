# PetCare Platform

Simple MERN CRUD application for managing pet posts, marketplace listings, store products, services, and user profiles.

## Prerequisites

- Node.js 18+
- MongoDB instance (local or hosted)

## Backend Setup

1. Copy `server/.env.example` to `server/.env` and update the Mongo connection string.
2. Install dependencies (already installed if you ran the automation):
   ```bash
   cd server
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. The API runs on `http://localhost:5000` by default and exposes:
   - `GET|POST|PUT|DELETE /api/posts`
   - `GET|POST|PUT|DELETE /api/listings`
   - `GET|POST|PUT|DELETE /api/products`
   - `GET|POST|PUT|DELETE /api/services`
   - `GET|POST|PUT|DELETE /api/users`
   - `POST` routes accept `multipart/form-data` for image uploads and store files in `server/uploads`.

## Frontend Setup

1. Copy `client/.env.example` to `client/.env` if you need to point to a different API URL.
2. Install dependencies:
   ```bash
   cd client
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the Vite URL shown in the console (usually `http://localhost:5173`).

The UI offers CRUD pages for each module with simple forms and lists. Image uploads use native file inputs and interact with the `/uploads` static directory served by the backend.
