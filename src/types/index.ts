// src/types/index.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'employee' | 'admin';
  favorites: string[];
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  _id: string;
  title: string;
  type: 'book' | 'movie' | 'music';
  author: string;
  year: number;
  available: boolean;
  description?: string;
  category?: Category;
  tags: Tag[];
  imageUrl?: string;
  reviews: Review[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Borrow {
  _id: string;
  user: User;
  media: Media;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  media: {
    total: number;
    byType: {
      book: number;
      movie: number;
      music: number;
    };
  };
  borrows: {
    active: number;
    overdue: number;
    returned: number;
    total: number;
  };
  topBorrowedMedia: Array<{
    _id: string;
    title: string;
    type: string;
    author: string;
    borrowCount: number;
  }>;
  recentBorrows: Borrow[];
  mostActiveUsers: Array<{
    _id: string;
    name: string;
    email: string;
    borrowCount: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'info' | 'error';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  overdueDetails: Array<{
    _id: string;
    user: {
      name: string;
      email: string;
    };
    media: {
      title: string;
    };
    dueDate: string;
    daysOverdue: number;
  }>;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  token?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

// ✅ Filtres pour la recherche de médias SANS favorites
export interface MediaFilters {
  page?: number;
  limit?: number;
  type?: 'book' | 'movie' | 'music';
  category?: string;
  tags?: string;
  search?: string;
}
