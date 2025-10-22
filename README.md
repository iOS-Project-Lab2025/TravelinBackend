# TravelinAPI - Amadeus Points of Interest API

A RESTful API implementation of the Amadeus Points of Interest service using Node.js, Express, Sequelize, and SQLite.

## 🚀 Project Status

**Current Status**: Phase 8 Complete - Documentation & Configuration! ✅🎉

The API is fully functional with complete documentation and Swagger UI!

## 📋 Features

- ✅ **RESTful API** endpoints for Points of Interest
- ✅ **SQLite database** with Sequelize ORM
- ✅ **MVC architecture** pattern (Model-View-Controller)
- ✅ **Comprehensive validation** with custom error classes
- ✅ **Error handling** with Amadeus-compliant error codes
- ✅ **Security** middleware (Helmet, CORS)
- ✅ **Request logging** with Morgan
- ✅ **Swagger UI** documentation at `/api-docs`
- ✅ **Health check** endpoint
- ✅ **Graceful shutdown** handling
- ✅ **Geospatial search** with Haversine distance calculation
- ✅ **Pagination** with HATEOAS links
- ✅ **Category filtering** support

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **ORM**: Sequelize v6
- **Database**: SQLite3
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier
- **Development**: Nodemon

## 📦 Prerequisites

- Node.js 16+ 
- npm 8+

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TravelinAPI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration if needed
```

4. Run database migrations:
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---
You can also use Docker if want
---
## Docker Setup

### Prerequisites
- Docker installed (v20.10 or higher)
- Docker Compose installed (v2.0 or higher)

### Quick Start with Docker

#### 1. Build and run the production container:
```bash
docker-compose up -d api
```

The API will be available at `http://localhost:3000`

#### 2. Run in development mode (with hot reload):
```bash
docker-compose --profile dev up -d api-dev
```

The dev API will be available at `http://localhost:3001`

#### 3. View logs:
```bash
docker-compose logs -f api
```

#### 4. Stop containers:
```bash
docker-compose down
```

#### 5. Rebuild after changes:
```bash
docker-compose up -d --build
```

### Docker Commands

```bash
# Build the image
docker build -t travelinapi:latest .

# Run a single container
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -v $(pwd)/data:/app/data \
  travelinapi:latest

# Execute commands inside the container
docker-compose exec api npm run test
docker-compose exec api npx sequelize-cli db:migrate

# Clean up everything
docker-compose down -v  # Removes volumes too
```

### Database Persistence

The SQLite database is persisted in a Docker volume. To reset the database:

```bash
# Remove the volume
docker-compose down -v
# Restart (will create fresh database with migrations)
docker-compose up -d
```


## 🏃 Running the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### Testing:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality:
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```
Returns server health status, timestamp, and uptime.

### API Documentation 📚
**Swagger UI available at:** [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs)

Interactive API documentation with "Try it out" functionality for all endpoints.

### Points of Interest Endpoints ✅ LIVE

#### 1. Search by Radius
```bash
GET /v1/reference-data/locations/pois
```

**Query Parameters:**
- `latitude` (required): Center point latitude (-90 to 90)
- `longitude` (required): Center point longitude (-180 to 180)
- `radius` (optional): Search radius in km (0-20, default: 1)
- `categories` (optional): Filter by categories (comma-separated)
- `page[limit]` (optional): Results per page (1-100, default: 10)
- `page[offset]` (optional): Number of results to skip (default: 0)

**Example:**
```bash
curl "http://localhost:3000/v1/reference-data/locations/pois?latitude=41.397158&longitude=2.160873&radius=1"
```

**Response:**
```json
{
  "data": [
    {
      "id": "9CB40CB5D0",
      "self": {
        "href": "http://localhost:3000/v1/reference-data/locations/pois/9CB40CB5D0",
        "methods": ["GET"]
      },
      "type": "location",
      "subType": "POINT_OF_INTEREST",
      "name": "Casa Batlló",
      "geoCode": {
        "latitude": 41.39165,
        "longitude": 2.164772
      },
      "category": "SIGHTS",
      "rank": 5,
      "tags": ["sightseeing", "museum", "landmark"]
    }
  ],
  "meta": {
    "count": 10,
    "links": {
      "self": "...",
      "first": "...",
      "last": "...",
      "next": "...",
      "up": "..."
    }
  }
}
```

#### 2. Search by Bounding Box
```bash
GET /v1/reference-data/locations/pois/by-square
```

**Query Parameters:**
- `north` (required): North boundary latitude
- `south` (required): South boundary latitude
- `east` (required): East boundary longitude
- `west` (required): West boundary longitude
- `categories` (optional): Filter by categories
- `page[limit]` (optional): Results per page
- `page[offset]` (optional): Number of results to skip

**Example:**
```bash
curl "http://localhost:3000/v1/reference-data/locations/pois/by-square?north=41.40&south=41.38&east=2.17&west=2.15"
```

#### 3. Get POI by ID
```bash
GET /v1/reference-data/locations/pois/:poisId
```

**Example:**
```bash
curl "http://localhost:3000/v1/reference-data/locations/pois/9CB40CB5D0"
```

**Valid Categories:**
- `SIGHTS` - Tourist attractions, landmarks
- `BEACH_PARK` - Beaches and parks
- `HISTORICAL` - Historical sites
- `NIGHTLIFE` - Bars, clubs
- `RESTAURANT` - Restaurants and cafes
- `SHOPPING` - Shopping venues

## 🗂️ Project Structure

```
TravelinAPI/
├── src/
│   ├── config/
│   │   ├── database.js      # Sequelize database configuration
│   │   ├── sequelize.js     # Sequelize instance & connection
│   │   └── index.js         # Centralized app configuration
│   ├── controllers/
│   │   └── PoiController.js # POI endpoint handlers
│   ├── middleware/
│   │   ├── validation.js    # Input validation middleware
│   │   └── errorHandler.js  # Global error handler
│   ├── models/
│   │   ├── index.js         # Model exports
│   │   └── PointOfInterest.js # POI model with validations
│   ├── routes/
│   │   ├── index.js         # Main router with Swagger UI
│   │   └── poi.routes.js    # POI routes
│   ├── services/
│   │   └── PoiService.js    # Business logic & database queries
│   ├── utils/
│   │   ├── errors.js        # Custom error classes
│   │   ├── geospatial.js    # Haversine & geospatial calculations
│   │   └── responseFormatter.js # Response formatting utilities
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── migrations/
│   └── *-create-points-of-interest.js
├── seeders/
│   └── *-demo-barcelona-pois.js
├── spec/
│   └── PointOfInterest.json # Swagger 2.0 specification
├── tests/                   # Test files (Phase 7)
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── package.json             # Dependencies & scripts
└── README.md               # This file

```

## 🔐 Environment Variables

All environment variables are documented in `.env.example`. Copy it to `.env` and adjust as needed.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production/test) | development | No |
| `PORT` | Server port | 3000 | No |
| `BASE_URL` | Base URL for API responses | http://localhost:3000 | No |
| `DB_STORAGE` | SQLite database file path | ./database.sqlite | No |
| `DB_LOGGING` | Enable database query logging | true | No |
| `CORS_ORIGIN` | CORS allowed origins | * | No |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | debug (dev) / info (prod) | No |

## 🧪 Testing

The testing framework (Jest + Supertest) is configured and ready. Tests will be implemented in Phase 7.

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 📝 API Specification

The API follows the Amadeus Points of Interest specification located in `spec/PointOfInterest.json` (Swagger 2.0 format).

## 🤝 Development Workflow

1. All changes should follow the MVC pattern
2. Run linting before commits: `npm run lint`
3. Format code: `npm run format`
4. Write tests for new features
5. Update documentation as needed

## 📊 Development Phases

- [x] **Phase 1**: Project Setup & Infrastructure ✅
- [x] **Phase 2**: Database Schema & Models ✅
- [x] **Phase 3**: Core Business Logic (Services) ✅
- [x] **Phase 4**: Controllers (MVC Pattern) ✅
- [x] **Phase 5**: Validation & Middleware ✅
- [x] **Phase 6**: Routes ✅
- [ ] **Phase 7**: Testing (Skipped)
- [x] **Phase 8**: Documentation & Configuration ✅
- [ ] **Phase 9**: Polish & Production Readiness
- [ ] **Phase 10**: Final QA & Deployment Prep

See `Tasks.md` for detailed task breakdown and progress tracking.

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and has correct values

### Database connection errors
- Ensure SQLite3 is properly installed: `npm install sqlite3`
- Check DB_STORAGE path in `.env`
- Run migrations: `npx sequelize-cli db:migrate`
- Seed data: `npx sequelize-cli db:seed:all`

### API returns empty results
- Ensure database is seeded: `npx sequelize-cli db:seed:all`
- Check coordinates are within Barcelona area (lat: ~41.39, lon: ~2.16)
- Increase search radius parameter

### Swagger UI not loading
- Ensure server is running: `npm run dev`
- Access directly: `http://localhost:3000/api-docs`
- Check console for errors

## 📄 License

ISC

## 👥 Contributing

See `Tasks.md` for current development tasks and priorities.

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Phase**: 8 (Documentation Complete!)

---

## 🎉 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Run migrations & seed data
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 4. Start server
npm run dev

# 5. Open Swagger UI
open http://localhost:3000/api-docs

# 6. Test API
curl "http://localhost:3000/v1/reference-data/locations/pois?latitude=41.397158&longitude=2.160873&radius=1"
```

