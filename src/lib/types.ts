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

export interface Trip {
  id: string;
  name: string;
  description?: string;
  gpxData?: string; // Store raw GPX string
  parsedGpx?: { lat: number; lon: number }[]; // Parsed coordinates for map display
  weatherWaypoints?: Waypoint[];
  gearList?: GearItem[];
  createdAt: Date;
  updatedAt: Date;
  // For distinguishing past/upcoming sections, we might add:
  // currentProgressMarker?: { lat: number; lon: number }; 
  // or completedSegments?: { startIdx: number, endIdx: number }[];
}

// Represents a point in a GPX track
export interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number; // Optional elevation
  time?: string; // Optional time
}
