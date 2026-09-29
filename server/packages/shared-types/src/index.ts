export enum TripStatus {
  PLANNING = 'PLANNING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER',
}

export interface UserProfile {
  id: string; // UUID from Supabase Auth
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
  createdAt: Date;
}

export interface Trip {
  id: string; // UUID
  ownerId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: TripStatus;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}
