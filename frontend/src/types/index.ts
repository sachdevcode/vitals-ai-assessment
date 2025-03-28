export interface User {
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

export interface Organization {
  id: number;
  name: string;
  _count?: {
    users: number;
  };
  createdAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}

export interface OrganizationStats {
  id: number;
  name: string;
  totalUsers: number;
  users: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface ApiError {
  error: string;
}

export interface SyncResponse {
  message: string;
  total: number;
}
