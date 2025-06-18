
"use server";

import { extractRelevantWeatherPoints, type ExtractRelevantWeatherPointsInput } from "@/ai/flows/extract-relevant-weather-points";
import type { Trip, Waypoint } from "./types";

// Define a type for our global mock DB
interface GlobalMockDB {
  trips: Map<string, Trip>;
  // We can extend this for other mock data if needed, e.g., gearItems
}

// Custom type for globalThis to include our MOCK_DB_INSTANCE
declare global {
  // eslint-disable-next-line no-var
  var MOCK_DB_INSTANCE: GlobalMockDB | undefined;
}

// Access or initialize MOCK_DB on globalThis
const getMockDB = (): GlobalMockDB => {
  if (!globalThis.MOCK_DB_INSTANCE) {
    console.log("Initializing MOCK_DB_INSTANCE on globalThis");
    globalThis.MOCK_DB_INSTANCE = {
      trips: new Map<string, Trip>(),
    };
    
    // Initialize with some mock data ONLY if the map is truly empty after creation
    const db = globalThis.MOCK_DB_INSTANCE;
    // This check is a bit redundant now as it's initialized empty above, 
    // but kept for clarity or if initialization logic changes.
    if (db.trips.size === 0) {
        console.log("Seeding initial mock trips into MOCK_DB_INSTANCE");
        const now = new Date();
        const trip1Id = "mockId1";
        db.trips.set(trip1Id, {
            id: trip1Id,
            name: "Coastal Cruise California",
            description: "A scenic ride along the Pacific Coast Highway.",
            gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"34.0522\" lon=\"-118.2437\"></trkpt><trkpt lat=\"34.0520\" lon=\"-118.2430\"></trkpt></trkseg></trk></gpx>",
            createdAt: new Date(now.setDate(now.getDate() - 2)), // Ensure different creation dates
            updatedAt: new Date(now.setDate(now.getDate() - 2)),
            parsedGpx: [], weatherWaypoints: [], gearList: [],
        });
        const trip2Id = "mockId2";
        db.trips.set(trip2Id, {
            id: trip2Id,
            name: "Rocky Mountain Challenge",
            description: "High altitude cycling through Colorado's Rockies.",
            gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"39.7392\" lon=\"-104.9903\"></trkpt><trkpt lat=\"39.7400\" lon=\"-104.9910\"></trkseg></trk></gpx>",
            createdAt: new Date(now.setDate(now.getDate() - 1)),
            updatedAt: new Date(now.setDate(now.getDate() - 1)),
            parsedGpx: [], weatherWaypoints: [], gearList: [],
        });
        console.log("Initial mock trips seeded. Count:", db.trips.size);
    }
  }
  return globalThis.MOCK_DB_INSTANCE;
};


export async function getAIWeatherPoints(gpxData: string, tripDescription?: string): Promise<Waypoint[]> {
  if (!gpxData) {
    throw new Error("GPX data is required to extract weather points.");
  }

  const input: ExtractRelevantWeatherPointsInput = {
    gpxData,
    tripDescription: tripDescription || "A bicycle trip.",
  };

  try {
    const waypoints = await extractRelevantWeatherPoints(input);
    return waypoints.map(wp => ({ ...wp, name: `AI Point: ${wp.reason.substring(0,20)}...` }));
  } catch (error) {
    console.error("Error getting AI weather points:", error);
    throw new Error("Failed to fetch weather points from AI.");
  }
}


export async function saveTripAction(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Saving trip", tripData.name);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate DB latency
    
    // Improved ID generation for more uniqueness, especially with HMR
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const now = new Date();
    const newTrip: Trip = {
        ...tripData,
        id,
        createdAt: now,
        updatedAt: now,
    };
    MOCK_DB.trips.set(id, newTrip);
    console.log("Trip saved with ID:", id, "Total trips in MOCK_DB:", MOCK_DB.trips.size);
    return newTrip;
}

export async function getTripAction(tripId: string): Promise<Trip | null> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Getting trip by ID:", tripId, ". Available IDs:", Array.from(MOCK_DB.trips.keys()));
    await new Promise(resolve => setTimeout(resolve, 100));
    const trip = MOCK_DB.trips.get(tripId);
    if (trip) {
        console.log("Trip found:", trip.name);
        return { ...trip }; // Return a copy to avoid direct mutation issues if any
    }
    console.log("Trip not found with ID:", tripId);
    return null;
}

export async function getTripsAction(): Promise<Trip[]> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Getting all trips. Count:", MOCK_DB.trips.size);
    await new Promise(resolve => setTimeout(resolve, 100));
    const tripsArray = Array.from(MOCK_DB.trips.values());
    // Sort by creation date, newest first
    return tripsArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Ensure MOCK_DB is initialized when the module loads for the first time.
getMockDB();
