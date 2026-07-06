export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "customer";
  permissions: string[];
  avatarUrl?: string;
}

