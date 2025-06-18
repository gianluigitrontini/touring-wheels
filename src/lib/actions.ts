
"use server";

import { extractRelevantWeatherPoints, type ExtractRelevantWeatherPointsInput } from "@/ai/flows/extract-relevant-weather-points";
import type { Trip, Waypoint, BikeModel, GearItem } from "./types";

// Define a type for our global mock DB
interface GlobalMockDB {
  trips: Map<string, Trip>;
  bikeModels: Map<string, BikeModel>;
  gearItems: Map<string, GearItem>;
}

// Custom type for globalThis to include our MOCK_DB_INSTANCE
declare global {
  // eslint-disable-next-line no-var
  var MOCK_DB_INSTANCE: GlobalMockDB | undefined;
}

const initialMockGearData: GearItem[] = [
  { id: "g1", name: "2-Person Tent", weight: 2200, imageUrl: "https://placehold.co/150x150.png?text=Tent", notes: "MSR Hubba Hubba NX", "data-ai-hint": "tent camping", itemType: "item", category: "Sleeping" },
  { id: "g2", name: "Down Sleeping Bag (-5C)", weight: 950, imageUrl: "https://placehold.co/150x150.png?text=Bag", notes: "Rab Ascent 500", "data-ai-hint": "sleeping bag", itemType: "item", category: "Sleeping" },
  { id: "g3", name: "Bike Multi-tool", weight: 180, notes: "Crankbrothers M19", "data-ai-hint": "bike tool", itemType: "item", category: "Tools" },
  { id: "g4", name: "Water Filter", weight: 300, imageUrl: "https://placehold.co/150x150.png?text=Filter", notes: "Sawyer Squeeze", "data-ai-hint": "water filter", itemType: "item", category: "Cooking" },
  { id: "g5", name: "Front Panniers (Set)", weight: 1500, notes: "Ortlieb Sport Roller Classic", "data-ai-hint": "bike pannier", itemType: "container", category: "Bags" },
  { id: "g6", name: "Rear Panniers (Set)", weight: 1700, notes: "Ortlieb Back Roller Classic", "data-ai-hint": "bike pannier", itemType: "container", category: "Bags" },
  { id: "g7", name: "Handlebar Bag", weight: 700, notes: "Ortlieb Ultimate Six", "data-ai-hint": "handlebar bag", itemType: "container", category: "Bags" },
  { id: "g8", name: "Camping Stove", weight: 350, notes: "MSR PocketRocket 2", "data-ai-hint": "camping stove", itemType: "item", category: "Cooking" },
  { id: "g9", name: "Fuel Canister (230g)", weight: 380, notes: "Isobutane/Propane Mix", "data-ai-hint": "fuel canister", itemType: "item", category: "Cooking" },
  { id: "g10", name: "Cooking Pot", weight: 250, notes: "Titanium 1L Pot", "data-ai-hint": "cooking pot", itemType: "item", category: "Cooking" },
  { id: "g11", name: "Spork", weight: 20, notes: "Titanium Spork", "data-ai-hint": "utensil spork", itemType: "item", category: "Cooking" },
  { id: "g12", name: "Headlamp", weight: 90, notes: "Petzl Actik Core", "data-ai-hint": "headlamp light", itemType: "item", category: "Electronics" },
  { id: "g13", name: "First Aid Kit", weight: 400, notes: "Adventure Medical Kits Ultralight", "data-ai-hint": "first aid", itemType: "item", category: "Safety" },
  { id: "g14", name: "Rain Jacket", weight: 300, notes: "Gore-Tex Paclite", "data-ai-hint": "rain jacket", itemType: "item", category: "Clothing" },
  { id: "g15", name: "Rain Pants", weight: 250, notes: "Waterproof breathable", "data-ai-hint": "rain pants", itemType: "item", category: "Clothing" },
  { id: "g16", name: "Sleeping Pad", weight: 450, notes: "Therm-a-Rest NeoAir XLite", "data-ai-hint": "sleeping pad", itemType: "item", category: "Sleeping" },
  { id: "g17", name: "Patch Kit", weight: 50, notes: "Tyre levers and patches", "data-ai-hint": "bike repair", itemType: "item", category: "Tools" },
];


// Access or initialize MOCK_DB on globalThis
const getMockDB = (): GlobalMockDB => {
  if (!globalThis.MOCK_DB_INSTANCE) {
    console.log("Initializing MOCK_DB_INSTANCE on globalThis (full setup)");
    globalThis.MOCK_DB_INSTANCE = {
      trips: new Map<string, Trip>(),
      bikeModels: new Map<string, BikeModel>(),
      gearItems: new Map<string, GearItem>(),
    };
  }

  const db = globalThis.MOCK_DB_INSTANCE;

  // Ensure individual maps exist
  if (!db.trips) {
    console.warn("MOCK_DB_INSTANCE.trips was missing. Initializing trips Map.");
    db.trips = new Map<string, Trip>();
  }
  if (!db.bikeModels) {
    console.warn("MOCK_DB_INSTANCE.bikeModels was missing. Initializing bikeModels Map.");
    db.bikeModels = new Map<string, BikeModel>();
  }
  if (!db.gearItems) {
    console.warn("MOCK_DB_INSTANCE.gearItems was missing. Initializing gearItems Map.");
    db.gearItems = new Map<string, GearItem>();
  }

  // Seeding logic
  if (db.trips.size === 0) {
    console.log("Seeding initial mock trips into MOCK_DB_INSTANCE.");
    const baseDate = new Date(); // Current date as a starting point for mock data

    const trip1Date = new Date(baseDate); // Create a new Date object for trip1
    trip1Date.setDate(baseDate.getDate() - 2); // Set trip1Date two days ago
    const trip1Id = "mockId1";
    db.trips.set(trip1Id, {
        id: trip1Id,
        name: "Coastal Cruise California",
        description: "A scenic ride along the Pacific Coast Highway.",
        gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"34.0522\" lon=\"-118.2437\"></trkpt><trkpt lat=\"34.0520\" lon=\"-118.2430\"></trkseg></trk></gpx>",
        createdAt: trip1Date,
        updatedAt: trip1Date,
        parsedGpx: [], weatherWaypoints: [], selectedGearIds: ["g1", "g2", "g5", "g8"], packedItems: {"g5": ["g8"]},
        bikeId: "b1"
    });

    const trip2Date = new Date(baseDate); // Create a new Date object for trip2
    trip2Date.setDate(baseDate.getDate() - 1); // Set trip2Date one day ago
    const trip2Id = "mockId2";
    db.trips.set(trip2Id, {
        id: trip2Id,
        name: "Rocky Mountain Challenge",
        description: "High altitude cycling through Colorado's Rockies.",
        gpxData: "<?xml version=\"1.0\"?><gpx><trk><trkseg><trkpt lat=\"39.7392\" lon=\"-104.9903\"></trkpt><trkpt lat=\"39.7400\" lon=\"-104.9910\"></trkseg></trk></gpx>",
        createdAt: trip2Date,
        updatedAt: trip2Date,
        parsedGpx: [], weatherWaypoints: [], selectedGearIds: ["g1", "g3", "g6", "g12", "g13"], packedItems: {"g6": ["g12", "g13"]},
        bikeId: "b2"
    });
    console.log("Initial mock trips seeded. Count:", db.trips.size);
  }

  if (db.gearItems.size === 0 && initialMockGearData.length > 0) {
    console.log("Seeding initial mock gear items into MOCK_DB_INSTANCE.gearItems");
    initialMockGearData.forEach(item => db.gearItems.set(item.id, {
        ...item, 
        itemType: item.itemType || 'item',
        category: item.category || 'Miscellaneous' // Ensure category is set
    }));
    console.log("Initial mock gear items seeded. Count:", db.gearItems.size);
  }

  return db;
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
        packedItems: tripData.packedItems || {},
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
            packedItems: trip.packedItems || {},
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
        packedItems: trip.packedItems || {},
        bikeId: trip.bikeId || undefined,
    }));
    return tripsArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// --- GearItem Actions ---
export async function getGearItemsAction(): Promise<GearItem[]> {
    const MOCK_DB = getMockDB();
    console.log("Server Action: Getting all gear items. Count:", MOCK_DB.gearItems.size);
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(MOCK_DB.gearItems.values()).sort((a,b) => a.name.localeCompare(b.name));
}

export async function addGearItemAction(itemData: Omit<GearItem, 'id'>): Promise<GearItem> {
  const MOCK_DB = getMockDB();
  const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const newItem: GearItem = {
    ...itemData,
    id,
    itemType: itemData.itemType || 'item',
    category: itemData.category || 'Miscellaneous',
    'data-ai-hint': itemData['data-ai-hint'] || `${itemData.name.toLowerCase().split(' ').slice(0,2).join(' ')}`
  };
  MOCK_DB.gearItems.set(id, newItem);
  console.log("Gear item added:", newItem.name, "ID:", id, "Category:", newItem.category);
  return newItem;
}

export async function updateGearItemAction(itemId: string, updates: Partial<Omit<GearItem, 'id'>>): Promise<GearItem | null> {
  const MOCK_DB = getMockDB();
  const existingItem = MOCK_DB.gearItems.get(itemId);
  if (!existingItem) return null;
  const updatedItem: GearItem = {
    ...existingItem,
    ...updates,
    itemType: updates.itemType || existingItem.itemType || 'item',
    category: updates.category || existingItem.category || 'Miscellaneous'
  };
  MOCK_DB.gearItems.set(itemId, updatedItem);
  console.log("Gear item updated:", updatedItem.name, "Category:", updatedItem.category);
  return updatedItem;
}

export async function deleteGearItemAction(itemId: string): Promise<boolean> {
  const MOCK_DB = getMockDB();
  const deleted = MOCK_DB.gearItems.delete(itemId);
  console.log(deleted ? `Gear item deleted: ${itemId}` : `Gear item not found for deletion: ${itemId}`);
  return deleted;
}

// Ensure MOCK_DB is initialized when the module loads for the first time.
getMockDB();
