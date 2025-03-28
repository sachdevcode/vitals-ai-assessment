import axios, { AxiosError } from "axios";
import {
  User,
  Organization,
  UsersResponse,
  OrganizationStats,
  SyncResponse,
  ApiError,
} from "@/types";

// API Configuration
const API_KEY = import.meta.env.VITE_API_KEY;
if (!API_KEY) {
  console.error("API Key is not set in environment variables");
}

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
};

// Create axios instance with configuration
const api = axios.create(API_CONFIG);

// Add request interceptor to ensure headers are set for every request
api.interceptors.request.use((config) => {
  if (!config.headers["X-API-Key"]) {
    config.headers["X-API-Key"] = API_KEY;
  }
  return config;
});

// Error handling
const handleError = (error: AxiosError<ApiError>) => {
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw error;
};

export const userService = {
  getUsers: async (
    page = 1,
    limit = 10,
    search?: string,
    organizationId?: number
  ): Promise<UsersResponse> => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(organizationId && { organizationId: String(organizationId) }),
      });

      const response = await api.get<UsersResponse>(`/users?${params}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },

  syncUsers: async (): Promise<SyncResponse> => {
    try {
      const response = await api.post<SyncResponse>("/users/sync");
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
};

export const organizationService = {
  getOrganizations: async (): Promise<Organization[]> => {
    try {
      const response = await api.get<Organization[]>("/organizations");
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },

  getOrganizationUsers: async (id: number): Promise<User[]> => {
    try {
      const response = await api.get<User[]>(`/organizations/${id}/users`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },

  getOrganizationStats: async (id: number): Promise<OrganizationStats> => {
    try {
      const response = await api.get<OrganizationStats>(
        `/organizations/${id}/stats`
      );
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },

  createOrganization: async (
    data: Pick<Organization, "name">
  ): Promise<Organization> => {
    try {
      const response = await api.post<Organization>("/organizations", data);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },

  updateOrganization: async (
    id: number,
    data: Pick<Organization, "name">
  ): Promise<Organization> => {
    try {
      const response = await api.put<Organization>(
        `/organizations/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },

  deleteOrganization: async (id: number): Promise<void> => {
    try {
      await api.delete(`/organizations/${id}`);
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
};
