import type { Studio } from "@/types/studio";
import { getTokenFromClient } from "../getTokenFromClient";

/**
 * Build request headers incl. the better-auth JWT when one is available.
 * Token fetching is lazy & non-fatal (see getTokenFromClient).
 */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getTokenFromClient();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchStudios(category?: string): Promise<Studio[]> {
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
  const endpoint = category
    ? `${baseURL}/studios?category=${encodeURIComponent(category)}`
    : `${baseURL}/studios`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Prevent aggressive caching so changes in category or listings are fresh
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch studios (${res.status} ${res.statusText})`,
    );
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    if (Array.isArray(data.studios)) return data.studios;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

/** Fetch all studios owned by the given host email. */
export async function fetchUserStudios(email: string): Promise<Studio[]> {
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
  const endpoint = `${baseURL}/studios/user/${encodeURIComponent(email)}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch your listings (${res.status} ${res.statusText})`,
    );
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    if (Array.isArray(data.studios)) return data.studios;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

/** Fetch the hero carousel image URL list (string[]). */
export async function fetchCarouselImages(): Promise<string[]> {
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
  const endpoint = `${baseURL}/studios-carousel`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch carousel images (${res.status} ${res.statusText})`,
    );
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is string => typeof item === "string" && !!item,
    );
  }
  if (data && typeof data === "object") {
    if (Array.isArray(data.images)) {
      return data.images.filter(
        (item: unknown): item is string => typeof item === "string" && !!item,
      );
    }
    if (Array.isArray(data.data)) {
      return data.data.filter(
        (item: unknown): item is string => typeof item === "string" && !!item,
      );
    }
  }
  return [];
}

/** Fetch top-rated studios for the homepage section. */
export async function fetchTopRatedStudios(): Promise<Studio[]> {
  const baseURL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const endpoint = `${baseURL}/top-rated-studios`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch top-rated studios (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    if (Array.isArray(data.studios)) return data.studios;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

/** Fetch a single studio by its id. */
export async function fetchStudioById(id: string): Promise<Studio> {
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
  const endpoint = `${baseURL}/studios/${encodeURIComponent(id)}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load studio (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  if (data && typeof data === "object") {
    if (data.data && typeof data.data === "object") return data.data as Studio;
    if (data.studio && typeof data.studio === "object")
      return data.studio as Studio;
  }
  return data as Studio;
}

/** Payload shape accepted by the studio create/update endpoints. */
export interface StudioPayload {
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  capacity: number;
  address: string;
  images: string[];
  amenities: string[];
  overview: string[];
  host: {
    name: string;
    phone: string;
    email: string;
  };
}

/** Create a new studio listing. */
export async function createStudio(payload: StudioPayload): Promise<void> {
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
  const endpoint = `${baseURL}/dashboard/add-studio`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Failed to create studio (${res.status} ${res.statusText})`;
    try {
      const body = await res.json();
      if (body?.message) message = String(body.message);
    } catch {
      /* keep status-text fallback */
    }
    throw new Error(message);
  }
}

/** Update an existing studio listing by id (partial payload). */
export async function updateStudio(
  id: string,
  payload: Partial<StudioPayload>,
): Promise<void> {
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
  const endpoint = `${baseURL}/studios/${encodeURIComponent(id)}`;
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Failed to update studio (${res.status} ${res.statusText})`;
    try {
      const body = await res.json();
      if (body?.message) message = String(body.message);
    } catch {
      /* keep status-text fallback */
    }
    throw new Error(message);
  }
}

/** Delete a studio listing by id. Throws with a readable message on failure. */
export async function deleteStudio(id: string): Promise<void> {
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
  const endpoint = `${baseURL}/studios/${encodeURIComponent(id)}`;

  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  if (!res.ok) {
    let message = `Failed to delete studio (${res.status} ${res.statusText})`;
    try {
      const body = await res.json();
      if (body?.message) message = String(body.message);
    } catch {
      /* keep status-text fallback */
    }
    throw new Error(message);
  }
}
