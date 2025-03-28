# Wealthbox Integration Service

A production-grade backend service that integrates with the Wealthbox CRM API to manage user data and organization relationships. Implements real-time synchronization, webhook handling, and automated data consistency checks.

## Core Features

- Real-time data synchronization with Wealthbox CRM
- Organization and user management with relationship mapping
- Secure API endpoints with API key authentication
- Comprehensive logging and monitoring
- Automated daily synchronization
- Webhook support for real-time updates
- Advanced search and filtering capabilities
- Pagination support for large datasets
- Robust error handling with retry mechanisms
- PostgreSQL database with Prisma ORM

## Technology Stack

- **Runtime**: Node.js v14+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: API Key-based
- **Logging**: Winston
- **Scheduling**: node-cron
- **Type Safety**: TypeScript
- **API Integration**: Wealthbox CRM API

## Prerequisites

- Node.js v14 or higher
- PostgreSQL
- Wealthbox API credentials
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wealthbox-integration
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthbox_db?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development

# Wealthbox API Configuration
WEALTHBOX_API_URL=https://api.crmworkspace.com/v1
WEALTHBOX_API_KEY=your_wealthbox_api_key
WEALTHBOX_WEBHOOK_SECRET=your_webhook_secret

# API Authentication
API_KEY=your_api_key

# Logging Configuration
LOG_LEVEL=debug
```

5. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
```

## Running the Application

### Development
```bash
npm run dev
```
This command uses `ts-node-dev` to run the TypeScript code directly with hot reloading.

### Production
```bash
# Build TypeScript to JavaScript
npm run build

# Start the compiled JavaScript
npm start
```
The build process compiles TypeScript files from `src/` to JavaScript in `dist/` directory.

## API Documentation

### Authentication
Only the sync endpoint requires API key authentication:
```typescript
headers: {
  'x-api-key': 'your_api_key'
}
```

### Endpoints

#### Users

1. **Sync Users with Wealthbox** (Protected)
```typescript
POST /api/users/sync
Headers: {
  'x-api-key': string
}
Response: {
  message: string;
  total: number;
}
```

2. **Get All Users** (Public)
```typescript
GET /api/users
Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 10)
- search?: string
- organizationId?: number
```

#### Organizations

1. **Get All Organizations** (Public)
```typescript
GET /api/organizations
```

2. **Get Organization Users** (Public)
```typescript
GET /api/organizations/:id/users
```

3. **Get Organization Stats** (Public)
```typescript
GET /api/organizations/:id/stats
```

#### Webhooks
```typescript
POST /api/webhooks/wealthbox
Headers: {
  'x-wealthbox-signature': string
}
```

## Data Synchronization

The service implements a dual-sync strategy:

1. **Real-time Updates (Webhooks)**
   - Handles immediate updates from Wealthbox
   - Processes contact creation, updates, and deletions
   - Ensures data consistency

2. **Scheduled Sync**
   - Executes daily at midnight
   - Provides data consistency verification
   - Handles missed webhook events

## Project Structure

```
/src
├── config            # Configuration files
├── controllers       # Express route handlers
├── services         # Business logic and API integrations
├── repositories     # Data access layer
├── models          # Prisma schema and database-related logic
├── routes          # Route definitions
├── middleware      # Express middlewares
├── utils           # Utility functions
├── logs            # Log files
├── tests           # Unit and integration tests
├── app.ts          # Express app configuration
└── server.ts       # Main server entry point
```

## Error Handling

The application implements comprehensive error handling:
- Structured API error responses with appropriate status codes
- Database error handling and logging
- Global error handler for unhandled exceptions
- API call retry mechanism with exponential backoff
- Rate limiting implementation

## Logging

Logging is implemented using Winston:
- Development: Colored console output
- Production: JSON-formatted logs for parsing
- Environment-based log levels
- Structured logging for debugging

## Security

- API key authentication for protected endpoints
- Webhook signature verification
- Secure environment variable management
- Rate limiting implementation
- Input validation using Zod
- Production error message sanitization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 