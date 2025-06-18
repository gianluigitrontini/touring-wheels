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
  // gearList?: GearItem[]; // This was a bit ambiguous; selectedGearIds is the source of truth for trip-specific gear.
  selectedGearIds: string[]; // IDs of GearItems specifically selected for THIS trip
  bikeId?: string; // ID of the BikeModel used for THIS trip
  createdAt: Date;
  updatedAt: Date;
}

// Represents a point in a GPX track
export interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number; // Optional elevation
  time?: string; // Optional time
}
