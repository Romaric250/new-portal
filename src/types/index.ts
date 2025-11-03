// Common types for the application

export type ApiError = {
  message: string;
  code?: string;
  statusCode?: number;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// User types
export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role?: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

