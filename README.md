# E-commerce Admin Demo

Fullstack e-commerce admin panel built with Next.js (App Router), TypeScript, Prisma, and BullMQ.

## Features

- **Product Management**: Create, view, and edit products
- **Image Processing**: Automatic image resizing with background workers
- **Queue System**: Background job processing using BullMQ and Redis
- **Database**: SQLite with Prisma ORM
- **Form Validation**: React Hook Form with Zod validation

## Architecture Overview

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form + Zod for form validation
- Server Components for data fetching

### Backend
- Next.js API Routes (App Router)
- Prisma ORM with SQLite
- BullMQ for job queue management
- Sharp for image processing
- Separate worker process for background tasks

### Infrastructure
- Docker Compose for orchestration
- Redis for queue backend
- SQLite for database (local file)

## Project Structure

```
/app
  /api/products          # Product API endpoints
  /products              # Product pages (list, new, edit)
  /page.tsx              # Dashboard
  /layout.tsx            # Root layout with sidebar

/components
  /Sidebar.tsx           # Navigation sidebar
  /ProductForm.tsx      # Product creation/editing form

/lib
  /prisma.ts            # Prisma client singleton
  /queue.ts             # BullMQ queue setup
  /image.ts             # Image processing utilities

/worker
  /worker.ts            # Background worker for image processing

/prisma
  /schema.prisma        # Database schema
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Running with Docker Compose

1. Clone the repository and navigate to the project directory

2. Start all services:
```bash
docker compose up
```

This will start:
- **web**: Next.js application on http://localhost:3000
- **redis**: Redis server for queue management
- **worker**: Background worker for image processing

3. Access the application at http://localhost:3000

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Start Redis (if not using Docker):
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

4. Set up environment variables:
```bash
cp .env.example .env
```

5. Start the development server:
```bash
npm run dev
```

6. In a separate terminal, start the worker:
```bash
npm run worker
```

## How Image Processing Works

1. **Upload**: When a product image is uploaded via the form, it's saved to `/public/uploads/original/`

2. **Queue Job**: The API endpoint enqueues an image processing job to BullMQ

3. **Background Processing**: The worker process:
   - Listens for image processing jobs
   - Resizes the image to three sizes (small: 200px, medium: 500px, large: 1000px)
   - Saves resized images to respective directories
   - Updates the product record with image paths

4. **Display**: The frontend displays:
   - Small images in the product grid
   - Medium/Large images on the product detail page

### Image Sizes
- **Small**: 200px (for product grid)
- **Medium**: 500px (for product detail page)
- **Large**: 1000px (for product detail page)

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/[id]` - Update a product

All endpoints accept `multipart/form-data` for image uploads.

## Database Schema

### Product Model

```prisma
model Product {
  id            String   @id @default(cuid())
  title         String
  shortDescription String?
  description   String?
  price         Float
  imageOriginal String?
  imageSmall    String?
  imageMedium   String?
  imageLarge    String?
  createdAt     DateTime @default(now())
}
```

## What Was Intentionally Simplified

1. **Authentication**: No user authentication or authorization implemented
2. **Error Handling**: Basic error handling - production should have more robust error handling
3. **Image Cleanup**: Old images are not automatically deleted when products are updated
4. **Validation**: Basic validation - production should have more comprehensive validation
5. **Pagination**: Product list doesn't have pagination
6. **Search/Filter**: No search or filtering capabilities
7. **Order Management**: Order pages are placeholders only
8. **Categories/Collections**: Navigation items exist but pages are not implemented
9. **File Upload Limits**: No file size or type restrictions enforced
10. **Queue Retry Logic**: Basic retry - production should have more sophisticated retry strategies

## TODO Comments

The codebase contains TODO comments indicating where additional logic should be implemented:
- Dashboard statistics (product count, order count, revenue)
- Image cleanup on product update
- More comprehensive error handling
- Additional validation rules

## Development Notes

- The project uses SQLite for simplicity - production should use PostgreSQL or MySQL
- Image processing happens asynchronously - products may not show images immediately after creation
- The worker process must be running for images to be processed
- Database file is stored in `/prisma/dev.db` (gitignored)

## Troubleshooting

### Images not processing
- Ensure the worker service is running
- Check Redis connection
- Verify upload directories have write permissions

### Database errors
- Run `npx prisma db push` to sync schema
- Ensure database file has correct permissions

### Docker issues
- Ensure ports 3000 and 6379 are not in use
- Check Docker logs: `docker compose logs`

## License

MIT
