# Organization Manager Frontend

A modern React application for managing organizations and users, built with Vite, React, TypeScript, and Material-UI.

## Features

- 📊 Organization Management

  - View list of organizations with user counts
  - Create, edit, and delete organizations
  - View organization statistics and user details

- 👥 User Management

  - View paginated list of users
  - Filter users by organization
  - Search users by name or email
  - Sync users with Wealthbox

- 🎨 Modern UI/UX
  - Responsive design for all screen sizes
  - Material Design components
  - Clean and intuitive interface
  - Loading states and error handling

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Query
- **Form Handling**: Formik with Zod validation
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:3001`.

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── services/          # API services
├── schemas/           # Validation schemas
├── types/             # TypeScript types and interfaces
└── App.tsx           # Root component
```

## API Integration

### Endpoints

#### Users

- `GET /users` - Get paginated users list
  - Query params: page, limit, search, organizationId
- `POST /users/sync` - Sync users with Wealthbox

#### Organizations

- `GET /organizations` - Get all organizations
- `GET /organizations/:id/users` - Get organization users
- `GET /organizations/:id/stats` - Get organization statistics
- `POST /organizations` - Create organization
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

### Response Types

```typescript
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  organization: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  id: number;
  name: string;
  _count?: {
    users: number;
  };
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Create a new branch from `main`
2. Make your changes
3. Submit a pull request

## Error Handling

The application handles various HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error responses are displayed to users with appropriate messages and UI feedback.

## Browser Support

The application supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
