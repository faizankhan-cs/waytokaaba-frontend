// Types mirroring the Waytokaaba API DTOs (backend/src/Waytokaaba.Application).

export type City = "Makkah" | "Madinah";
export type PackageType = "Economy" | "Standard" | "Premium" | "Luxury";
export type InquiryType = "General" | "Package" | "Hotel";
export type InquiryStatus = "New" | "Contacted" | "Closed";

export const CITIES: City[] = ["Makkah", "Madinah"];
export const PACKAGE_TYPES: PackageType[] = ["Economy", "Standard", "Premium", "Luxury"];
export const INQUIRY_STATUSES: InquiryStatus[] = ["New", "Contacted", "Closed"];

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HotelSummary {
  id: number;
  slug: string;
  name: string;
  city: City;
  address: string;
  starRating: number;
  distanceFromHolyMosqueMeters: number | null;
  shortDescription: string;
  imageUrl: string;
  pricePerNight: number;
  currency: string;
  maxRoomCapacity: number;
  isFeatured: boolean;
  isActive: boolean;
  isDemoContent: boolean;
}

export interface HotelImage {
  id: number;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface Room {
  id: number;
  hotelId: number;
  name: string;
  description: string | null;
  capacity: number;
  bedConfiguration: string | null;
  pricePerNight: number;
  imageUrl: string | null;
}

export interface HotelDetail extends Omit<HotelSummary, "maxRoomCapacity"> {
  isDistanceVerified: boolean;
  description: string;
  amenities: string[];
  images: HotelImage[];
  rooms: Room[];
  createdAt: string;
  updatedAt: string;
}

export interface PackageHotelSummary {
  hotelId: number;
  hotelSlug: string;
  hotelName: string;
  city: City;
  starRating: number;
  nights: number;
}

export interface PackageSummary {
  id: number;
  slug: string;
  name: string;
  packageType: PackageType;
  durationInDays: number;
  makkahDays: number;
  madinahDays: number;
  price: number;
  currency: string;
  shortDescription: string;
  imageUrl: string;
  hotels: PackageHotelSummary[];
  isFeatured: boolean;
  isActive: boolean;
  isDemoContent: boolean;
}

export interface PackageHotel {
  hotelId: number;
  hotelSlug: string;
  hotelName: string;
  city: City;
  starRating: number;
  imageUrl: string;
  distanceFromHolyMosqueMeters: number | null;
  nights: number;
}

export interface PackageDetail extends Omit<PackageSummary, "hotels"> {
  description: string;
  images: { id: number; url: string; caption: string | null; sortOrder: number }[];
  hotels: PackageHotel[];
  services: { id: number; serviceName: string; description: string | null; sortOrder: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  inquiryType: InquiryType;
  packageId: number | null;
  packageName: string | null;
  hotelId: number | null;
  hotelName: string | null;
  hotelCity: City | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

/** RFC 7807 problem details returned by the API on errors. */
export interface ProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
