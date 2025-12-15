# SBOM Component Browser

A web application for uploading, parsing, and exploring Software Bill of Materials (SBOMs).
The app extracts components from SBOM JSON files (CycloneDX / SPDX-style) and makes them searchable across projects.

Built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, and **Prisma**.

## Features

- Upload SBOM JSON files
- Parse and normalize components into a relational database
- Browse SBOMs by project
- Search SBOMs by component name
- View SBOM details and component lists
- Paginated component tables
- Delete SBOMs
- Authentication using **NextAuth (Credentials provider)**

## Tech Stack
### Frontend

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Next.js API Routes**
- **NextAuth / Auth.js**
- **Prisma ORM**
- **PostgreSQL**

### Tooling
- Prisma Migrate
- ESLint
- Prettier
- **Node.js 18+


## Getting Started (Local Development)
1️⃣ **Prerequisites**

- **Node.js** 20.19+
- **Docker** (recommended for PostgreSQL)
- npm or pnpm


2️⃣ **Clone the repository**

3️⃣ **Install dependencies**
```bash
npm install
```

## 🐳 Running PostgreSQL with Docker (Recommended)

This project includes a docker-compose.yml file to run PostgreSQL locally.

## Start the database
```bash
docker compose up -d
```

This starts a PostgreSQL 16 container with:

- Database: sbom_browser
- Username: postgres
- Password: postgres
- Port: 5432

## Stop the database
```bash
docker compose down
```

To stop and remove all data:
```bash
docker compose down -v
```

4️⃣ ***Configure environment variables***

Create a .env file in the root:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sbom_browser"
NEXTAUTH_SECRET="super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

5️⃣ ***Set up the database***

Run Prisma migrations and generate the client:
```bash
npx prisma migrate dev
npx prisma generate
```

(Optional) View the database:
```bash
npx prisma studio
```

6️⃣ ***Run the development server***
```bash
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

## Usage

1. Register a user account
2. Log in
3. Registered user will have a project called Default
4. Upload an SBOM JSON file
    - User has the option to create a project in the Upload modal
5. Browse and search components
6. View SBOM details and components
7. Delete SBOMs when no longer needed

## Supported SBOM Formats

The parser currently supports:

- CycloneDX-style JSON
- SPDX-style JSON (basic support)

Unsupported or malformed files will be rejected gracefully.


## Authentication

- Uses **NextAuth Credentials Provider**
- Passwords are hashed with **bcrypt**
- Session strategy: **JWT**

### Some Screenshots

Login page:
![Alt text for accessibility](docs/screenshots/login-modal.png)

Register page:
![Alt text for accessibility](docs/screenshots/register-modal.png)

Sbom Component Browser Empty Dashboard:
![Alt text for accessibility](docs/screenshots/empty-dashboard.png)

Upload Modal:
![Alt text for accessibility](docs/screenshots/upload-modal.png)

Sbom List:
![Alt text for accessibility](docs/screenshots/sbom-list.png)

Search Component Name:
![Alt text for accessibility](docs/screenshots/search-component-name.png)

Component Detail:
![Alt text for accessibility](docs/screenshots/component-detail.png)

