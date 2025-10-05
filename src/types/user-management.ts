export interface UserSubscription {
  id: string;
  packageId: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  startsAt: string;
  expiresAt: string;
  autoRenew: boolean;
  price: number;
  currency: string;
  paymentReference: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  package: {
    id: string;
    name: string;
    description: string;
    price?: number;
    currency?: string;
    durationDays?: number;
  };
}

export interface UserDetail {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  phoneE164: string | null;
  phoneVerifiedAt: string | null;
  role: 'admin' | 'member' | 'premium';
  isActive: boolean;
  referredById: string | null;
  createdAt: string;
  updatedAt: string;
  userSubscriptions: UserSubscription[];
  virtualPortfolios?: any[];
  referralCodes?: any[];
  commissions?: any[];
}

export interface UserListItem {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  phoneE164: string | null;
  phoneVerifiedAt: string | null;
  role: 'admin' | 'member' | 'premium';
  isActive: boolean;
  referredById: string | null;
  createdAt: string;
  updatedAt: string;
  userSubscriptions: UserSubscription[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  premiumUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'member' | 'premium';
  isActive?: boolean;
  sortBy?: 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserListResponse {
  data: UserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssignSubscriptionRequest {
  packageId: string;
  startsAt?: string;
  durationDays?: number;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionRequest {
  status?: 'active' | 'expired' | 'cancelled' | 'suspended';
  expiresAt?: string;
  autoRenew?: boolean;
  cancellationReason?: string;
}

export interface UpdateRoleRequest {
  role: 'admin' | 'member' | 'premium';
}

export interface CancelSubscriptionRequest {
  reason: string;
}

export interface UserActionResponse {
  message: string;
  user?: UserDetail;
  subscription?: UserSubscription;
}

