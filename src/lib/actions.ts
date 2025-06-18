"use server";

import { extractRelevantWeatherPoints, type ExtractRelevantWeatherPointsInput } from "@/ai/flows/extract-relevant-weather-points";
import type { Trip, Waypoint } from "./types";

// Basic GPX Parser (very simplified) to get coordinates for AI.
// This is duplicated from MapDisplay for server-side use; consider centralizing.
function parseGpxForAI(gpxString: string): { lat: number; lon: number }[] {
  const points: { lat: number; lon: number }[] = [];
  if (!gpxString) return points;

  try {
    // A more robust XML parser might be needed for complex GPX files on server.
    // For now, using regex as a simple server-side alternative to DOMParser.
    const pointRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"/g;
    let match;
    while ((match = pointRegex.exec(gpxString)) !== null) {
      points.push({ lat: parseFloat(match[1]), lon: parseFloat(match[2]) });
    }
  } catch (error) {
    console.error("Error parsing GPX for AI:", error);
  }
  return points;
}


export async function getAIWeatherPoints(gpxData: string, tripDescription?: string): Promise<Waypoint[]> {
  if (!gpxData) {
    throw new Error("GPX data is required to extract weather points.");
  }

  // The AI flow expects the full GPX data string.
  const input: ExtractRelevantWeatherPointsInput = {
    gpxData,
    tripDescription: tripDescription || "A bicycle trip.",
  };

  try {
    const waypoints = await extractRelevantWeatherPoints(input);
    return waypoints.map(wp => ({ ...wp, name: `AI Point: ${wp.reason.substring(0,20)}...` }));
  } catch (error) {
    console.error("Error getting AI weather points:", error);
    // Depending on the error, you might want to return a specific error message or an empty array.
    throw new Error("Failed to fetch weather points from AI.");
  }
}


// Mock function for saving a trip. In a real app, this would interact with a database.
// This is simplified and assumes client-side state management or redirection after save.
// For full persistence, you'd use Firestore or another DB.
const MOCK_DB = {
    trips: new Map<string, Trip>()
};

export async function saveTripAction(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    console.log("Server Action: Saving trip", tripData.name);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate DB latency
    
    const id = Math.random().toString(36).substring(2, 15);
    const now = new Date();
    const newTrip: Trip = {
        ...tripData,
        id,
        createdAt: now,
        updatedAt: now,
    };
    MOCK_DB.trips.set(id, newTrip);
    console.log("Trip saved with ID:", id);
    return newTrip;
}

export async function getTripAction(tripId: string): Promise<Trip | null> {
    console.log("Server Action: Getting trip", tripId);
    await new Promise(resolve => setTimeout(resolve, 200));
    const trip = MOCK_DB.trips.get(tripId);
    return trip || null;
}

export async function getTripsAction(): Promise<Trip[]> {
    console.log("Server Action: Getting all trips");
    await new Promise(resolve => setTimeout(resolve, 200));
    return Array.from(MOCK_DB.trips.values());
}

// Initialize with some mock data for trips list page
if (MOCK_DB.trips.size === 0) {
    saveTripAction({ name: "Coastal Cruise California", description: "A scenic ride along the Pacific Coast Highway.", gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"34.0522\" lon=\"-118.2437\"></trkpt><trkpt lat=\"34.0520\" lon=\"-118.2430\"></trkpt></trkseg></trk></gpx>" });
    saveTripAction({ name: "Rocky Mountain Challenge", description: "High altitude cycling through Colorado's Rockies.", gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"39.7392\" lon=\"-104.9903\"></trkpt><trkpt lat=\"39.7400\" lon=\"-104.9910\"></trkpt></trkseg></trk></gpx>" });
}
