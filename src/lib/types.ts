
export interface Waypoint {
  latitude: number;
  longitude: number;
  reason: string;
  name?: string; // Optional: name for the waypoint
  timestamp?: number; // Optional: for time-specific weather
}

export interface GearItem {
  id: string;
  name: string;
  weight: number; // in grams
  imageUrl?: string;
  notes?: string;
  itemType?: 'item' | 'container'; // New: To identify if it can act as a bag
  category?: string; // Category for the gear item (e.g., Sleeping, Cooking)
  'data-ai-hint'?: string;
}

export interface BikeModel {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  year?: string;
  imageUrl?: string;
  notes?: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  gpxData?: string; // Store raw GPX string
  parsedGpx?: { lat: number; lon: number }[]; // Parsed coordinates for map display
  weatherWaypoints?: Waypoint[];
  selectedGearIds: string[]; // IDs of ALL GearItems selected for THIS trip (includes containers)
  packedItems?: Record<string, string[]>; // New: Maps container item ID to array of contained item IDs for THIS trip
  bikeId?: string; // ID of the BikeModel used for THIS trip
  createdAt: Date;
  updatedAt: Date;
  status?: 'planned' | 'completed'; // New: Trip status
  durationDays?: number; // New: Duration of the trip in days
  dailyNotes?: Record<number, string>; // New: Notes for each day, e.g., { 1: "Note for day 1" }
}

// Represents a point in a GPX track
export interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number; // Optional elevation
  time?: string; // Optional time
}
