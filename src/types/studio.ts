export type StudioCategory =
  | "photo"
  | "video"
  | "lounge"
  | "music"
  | "workshop";

export interface StudioHost {
  name: string;
  phone?: string;
  email: string;
}

export interface StudioReview {
  name: string;
  designation: string;
  review: string;
}

export interface Studio {
  _id: string;
  title: string;
  category: StudioCategory;
  hourlyRate: number;
  securityDeposit: number;
  capacity: number;
  address: string;
  host: StudioHost;
  images: string[];
  amenities: string[];
  overview: string[];
  reviews?: StudioReview | StudioReview[];
  rating?: number;
}
