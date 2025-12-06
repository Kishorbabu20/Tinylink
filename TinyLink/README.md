# TinyLink

A simple URL shortener built with Next.js (App Router), MySQL, and basic CSS.

## Features

- Create short links with custom or auto-generated codes
- List all links in a dashboard
- View link statistics (clicks, timestamps)
- Delete links
- Automatic redirects with click tracking
- Clean, responsive UI

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MySQL database:**
   - Create a MySQL database named `tinylink`
   - Run the schema:
     ```bash
     mysql -u root -p tinylink < schema.sql
     ```
     Or using MySQL command line:
     ```sql
     CREATE DATABASE tinylink;
     USE tinylink;
     SOURCE schema.sql;
     ```

3. **Configure environment:**
   - Create a `.env.local` file in the project root
   - Set `DATABASE_URL` to your MySQL connection string:
     ```
     DATABASE_URL=mysql://username:password@localhost:3306/tinylink
     ```
     Or use individual environment variables:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=yourpassword
     DB_NAME=tinylink
     ```

4. **Run the application:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `POST /api/links` - Create a new short link
- `GET /api/links` - List all links
- `GET /api/links/:code` - Get link stats
- `DELETE /api/links/:code` - Delete a link
- `GET /healthz` - Health check

## Usage

- Visit the dashboard at `/` to create and manage links
- Short links redirect from `/:code`
- View stats at `/code/:code`

## Deployment

### Railway

See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) for detailed instructions on deploying to Railway.

Quick steps:
1. Push your code to GitHub
2. Create a new Railway project from GitHub
3. Add a MySQL database service
4. Configure environment variables (DATABASE_URL)
5. Run the database schema (from `schema.sql`)
6. Deploy!

## Technologies

- Next.js 14 (App Router)
- MySQL
- mysql2 (MySQL client)
- Basic CSS
