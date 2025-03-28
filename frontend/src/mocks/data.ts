import { User, Organization, ApiSettings } from "@/types";

export const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", organizationId: "1" },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    organizationId: "1",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    organizationId: "2",
  },
];

export const mockOrganizations: Organization[] = [
  { id: "1", name: "Acme Corp", description: "A leading technology company" },
  { id: "2", name: "Globex Corp", description: "Global solutions provider" },
];

export const mockSettings: ApiSettings = {
  baseUrl: "https://api.example.com",
  apiKey: "mock-api-key",
  apiSecret: "mock-api-secret",
};
