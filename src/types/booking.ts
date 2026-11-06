import type { Studio } from "./studio";

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Renter {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

export interface BookedStudio {
  _id: Studio["_id"];
  title: string;
  hourlyRate: number;
  securityDeposit: number;
  location: string;
}

export interface BookingPayload {
  bookingDate: string;
  status: BookingStatus;
  renter: Renter;
  studio: BookedStudio;
}

/** A booking as returned by the API. */
export interface Booking {
  _id: string;
  bookingDate: string;
  status: BookingStatus;
  renter: Renter;
  studio: BookedStudio;
}
