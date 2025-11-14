export type Category = 'tourism' | 'culinary' | 'hotel' | 'event';

export type BaseItem = {
  id: string;
  category: Category;
  name: string;
  district: string;
  rating: number;
  description: string;
  latitude: number;
  longitude: number;
  image: string;
  images?: string[]; // Multiple images for slider
  priceRange?: string;
  operatingHours?: string;
};

export type EventItem = BaseItem & {
  startDate?: string;
  endDate?: string;
  venue?: string;
};

export type TourismItem = BaseItem & {
  admissionFee?: string;
};

export type CulinaryItem = BaseItem & {
  cuisineType?: string;
  priceRange: string;
};

export type HotelItem = BaseItem & {
  starRating?: number;
  priceRange: string;
  amenities?: string[];
};

export type Item = TourismItem | CulinaryItem | HotelItem | EventItem;

export type FilterOptions = {
  district?: string;
  minRating?: number;
  priceRange?: string;
};

export type FavoriteItem = {
  id: string;
  category: Category;
  addedAt: string;
};

export type AdminAuth = {
  isAuthenticated: boolean;
  pin: string;
};

export type LocalEdit = {
  id: string;
  action: 'create' | 'update' | 'delete';
  data?: Item;
  category?: Category; // Required for delete action
  timestamp: string;
};

export type Checkpoint = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'landmark' | 'restaurant' | 'accommodation';
  order: number;
  estimatedTime: number;
  notes?: string;
};

export type Transport = {
  id: string;
  name: string;
  type: 'boat' | 'bus' | 'taxi' | 'car';
  description: string;
  price: string;
  schedule: string[];
  duration: string;
  bookingUrl?: string;
  departurePoint: string;
  arrivalPoint: string;
};

export type TourRoute = {
  id: string;
  destinationId: string;
  destinationName: string;
  checkpoints: Checkpoint[];
  transports: Transport[];
  totalEstimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
};

export type TourProgress = {
  tourId: string;
  startTime: Date;
  endTime?: Date;
  currentCheckpointIndex: number;
  completedCheckpoints: string[];
  status: 'active' | 'paused' | 'completed';
};

