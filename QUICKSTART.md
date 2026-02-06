# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB of free disk space

## Starting the Project

1. **Clone/Navigate to the project directory**

2. **Start all services:**
```bash
docker compose up
```

This command will:
- Build the Next.js application
- Start Redis server
- Start the web server on port 3000
- Start the background worker for image processing

3. **Wait for services to be ready:**
   - The web service will initialize the database automatically
   - The worker will start processing image jobs
   - You'll see logs from all services

4. **Access the application:**
   - Open http://localhost:3000 in your browser
   - You should see the dashboard

## First Steps

1. **Navigate to Products:**
   - Click on "Каталог" in the sidebar
   - Click on "Товари"

2. **Create your first product:**
   - Click "+ Додати товар"
   - Fill in the form:
     - Title (required)
     - Short description (optional)
     - Description (optional)
     - Price (required)
     - Image (optional)
   - Click "Створити"

3. **View the product:**
   - You'll be redirected to the products list
   - The product should appear in the grid
   - Note: If you uploaded an image, it may take a few seconds to process

4. **Edit a product:**
   - Click on any product in the grid
   - Modify the form fields
   - Click "Оновити"

## Troubleshooting

### Services won't start
- Check if ports 3000 and 6379 are available
- Check Docker logs: `docker compose logs`

### Images not processing
- Ensure the worker service is running: `docker compose ps`
- Check worker logs: `docker compose logs worker`
- Verify Redis is running: `docker compose logs redis`

### Database errors
- The database is automatically initialized on first start
- If issues persist, remove the database file and restart:
  ```bash
  rm prisma/dev.db
  docker compose up
  ```

### Port conflicts
- Change ports in `docker-compose.yml` if needed
- Update the web service port mapping: `"3001:3000"` for example

## Stopping the Project

Press `Ctrl+C` in the terminal, or run:
```bash
docker compose down
```

To also remove volumes (including Redis data):
```bash
docker compose down -v
```

## Development Mode

For local development without Docker:

1. Install dependencies:
```bash
npm install
```

2. Start Redis (or use Docker):
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

3. Initialize database:
```bash
npx prisma generate
npx prisma db push
```

4. Start dev server:
```bash
npm run dev
```

5. In another terminal, start worker:
```bash
npm run worker
```
