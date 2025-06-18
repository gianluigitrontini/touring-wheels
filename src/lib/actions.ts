
"use server";

import { extractRelevantWeatherPoints, type ExtractRelevantWeatherPointsInput } from "@/ai/flows/extract-relevant-weather-points";
import type { Trip, Waypoint, BikeModel, GearItem } from "./types";

// Define a type for our global mock DB
interface GlobalMockDB {
  trips: Map<string, Trip>;
  bikeModels: Map<string, BikeModel>;
  gearItems: Map<string, GearItem>; // Added gearItems
}

// Custom type for globalThis to include our MOCK_DB_INSTANCE
declare global {
  // eslint-disable-next-line no-var
  var MOCK_DB_INSTANCE: GlobalMockDB | undefined;
}

const initialMockGearData: GearItem[] = [
  { id: "g1", name: "2-Person Tent", weight: 2200, imageUrl: "https://placehold.co/150x150.png?text=Tent", notes: "MSR Hubba Hubba NX" },
  { id: "g2", name: "Down Sleeping Bag (-5C)", weight: 950, imageUrl: "https://placehold.co/150x150.png?text=Bag", notes: "Rab Ascent 500" },
  { id: "g3", name: "Bike Multi-tool", weight: 180, notes: "Crankbrothers M19" },
  { id: "g4", name: "Water Filter", weight: 300, imageUrl: "https://placehold.co/150x150.png?text=Filter", notes: "Sawyer Squeeze" },
  { id: "g5", name: "Front Panniers (Set)", weight: 1500, notes: "Ortlieb Sport Roller Classic" },
  { id: "g6", name: "Rear Panniers (Set)", weight: 1700, notes: "Ortlieb Back Roller Classic" },
  { id: "g7", name: "Handlebar Bag", weight: 700, notes: "Ortlieb Ultimate Six" },
  { id: "g8", name: "Camping Stove", weight: 350, notes: "MSR PocketRocket 2" },
  { id: "g9", name: "Fuel Canister (230g)", weight: 380, notes: "Isobutane/Propane Mix" },
  { id: "g10", name: "Cooking Pot", weight: 250, notes: "Titanium 1L Pot" },
  { id: "g11", name: "Spork", weight: 20, notes: "Titanium Spork" },
  { id: "g12", name: "Headlamp", weight: 90, notes: "Petzl Actik Core" },
  { id: "g13", name: "First Aid Kit", weight: 400, notes: "Adventure Medical Kits Ultralight" },
  { id: "g14", name: "Rain Jacket", weight: 300, notes: "Gore-Tex Paclite" },
  { id: "g15", name: "Rain Pants", weight: 250, notes: "Waterproof breathable" },
];


// Access or initialize MOCK_DB on globalThis
const getMockDB = (): GlobalMockDB => {
  if (!globalThis.MOCK_DB_INSTANCE) {
    console.log("Initializing MOCK_DB_INSTANCE on globalThis");
    globalThis.MOCK_DB_INSTANCE = {
      trips: new Map<string, Trip>(),
      bikeModels: new Map<string, BikeModel>(),
      gearItems: new Map<string, GearItem>(),
    };
    
    const db = globalThis.MOCK_DB_INSTANCE;
    if (db.trips.size === 0) {
        console.log("Seeding initial mock trips into MOCK_DB_INSTANCE");
        const now = new Date();
        const trip1Id = "mockId1";
        db.trips.set(trip1Id, {
            id: trip1Id,
            name: "Coastal Cruise California",
            description: "A scenic ride along the Pacific Coast Highway.",
            gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"34.0522\" lon=\"-118.2437\"></trkpt><trkpt lat=\"34.0520\" lon=\"-118.2430\"></trkseg></trk></gpx>",
            createdAt: new Date(now.setDate(now.getDate() - 2)),
            updatedAt: new Date(now.setDate(now.getDate() - 2)),
            parsedGpx: [], weatherWaypoints: [], selectedGearIds: ["g1", "g2", "g8"],
        });
        const trip2Id = "mockId2";
        db.trips.set(trip2Id, {
            id: trip2Id,
            name: "Rocky Mountain Challenge",
            description: "High altitude cycling through Colorado's Rockies.",
            gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"39.7392\" lon=\"-104.9903\"></trkpt><trkpt lat=\"39.7400\" lon=\"-104.9910\"></trkseg></trk></gpx>",
            createdAt: new Date(now.setDate(now.getDate() - 1)),
            updatedAt: new Date(now.setDate(now.getDate() - 1)),
            parsedGpx: [], weatherWaypoints: [], selectedGearIds: ["g1", "g3", "g12", "g13"],
        });
        console.log("Initial mock trips seeded. Count:", db.trips.size);
    }
    if (db.gearItems.size === 0) {
        console.log("Seeding initial mock gear items into MOCK_DB_INSTANCE");
        initialMockGearData.forEach(item => db.gearItems.set(item.id, item));
        console.log("Initial mock gear items seeded. Count:", db.gearItems.size);
    }
    // Could seed mock bikes here too if desired
    // if (db.bikeModels.size === 0) { ... }
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
    await new Promise(resolve => setTimeout(resolve, 100)); 
    
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const now = new Date();
    const newTrip: Trip = {
        name: tripData.name,
        description: tripData.description,
        gpxData: tripData.gpxData,
        parsedGpx: tripData.parsedGpx || [],
        weatherWaypoints: tripData.weatherWaypoints || [],
        selectedGearIds: tripData.selectedGearIds || [], 
        bikeId: tripData.bikeId || undefined,
        id,
        createdAt: now,
        updatedAt: now,
    };
    MOCK_DB.trips.set(id, newTrip);
    console.log("Trip saved with ID:", id, "Total trips in MOCK_DB:", MOCK_DB.trips.size);
    return newTrip;
}

export async function updateTripAction(tripId: string, updates: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Trip | null> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Updating trip", tripId, "with updates:", updates);
    await new Promise(resolve => setTimeout(resolve, 100));

    const existingTrip = MOCK_DB.trips.get(tripId);
    if (!existingTrip) {
        console.log("Trip not found for update:", tripId);
        return null;
    }

    const updatedTrip: Trip = {
        ...existingTrip,
        ...updates,
        updatedAt: new Date(),
    };

    MOCK_DB.trips.set(tripId, updatedTrip);
    console.log("Trip updated:", updatedTrip.name);
    return updatedTrip;
}


export async function getTripAction(tripId: string): Promise<Trip | null> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Getting trip by ID:", tripId, ". Available IDs:", Array.from(MOCK_DB.trips.keys()));
    await new Promise(resolve => setTimeout(resolve, 100));
    const trip = MOCK_DB.trips.get(tripId);
    if (trip) {
        console.log("Trip found:", trip.name);
        return { 
            ...trip,
            selectedGearIds: trip.selectedGearIds || [],
            bikeId: trip.bikeId || undefined,
        }; 
    }
    console.log("Trip not found with ID:", tripId);
    return null;
}

export async function getTripsAction(): Promise<Trip[]> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Getting all trips. Count:", MOCK_DB.trips.size);
    await new Promise(resolve => setTimeout(resolve, 100));
    const tripsArray = Array.from(MOCK_DB.trips.values()).map(trip => ({
        ...trip,
        selectedGearIds: trip.selectedGearIds || [],
        bikeId: trip.bikeId || undefined,
    }));
    return tripsArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getGearItemsAction(): Promise<GearItem[]> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Getting all gear items. Count:", MOCK_DB.gearItems.size);
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(MOCK_DB.gearItems.values()).sort((a,b) => a.name.localeCompare(b.name));
}

// Ensure MOCK_DB is initialized when the module loads for the first time.
getMockDB();
