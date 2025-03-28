import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;

export const settingsSchema = z.object({
  baseUrl: z.string().min(1, "Base URL is required").url("Must be a valid URL"),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
