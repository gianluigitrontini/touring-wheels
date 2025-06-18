"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapDisplay } from "@/components/map/map-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trip, Waypoint, GpxPoint, GearItem } from "@/lib/types";
import { getAIWeatherPoints, getTripAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, CloudDrizzle, ListChecks, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

// Basic GPX Parser (very simplified) - this should ideally be a shared utility
function parseGpxClient(gpxString: string): GpxPoint[] {
  const points: GpxPoint[] = [];
  if (!gpxString) return points;
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxString, "text/xml");
    const trackpoints = xmlDoc.getElementsByTagName("trkpt");
    for (let i = 0; i < trackpoints.length; i++) {
      const lat = trackpoints[i].getAttribute("lat");
      const lon = trackpoints[i].getAttribute("lon");
      if (lat && lon) {
        points.push({ lat: parseFloat(lat), lon: parseFloat(lon) });
      }
    }
  } catch (error) {
    console.error("Error parsing GPX on client:", error);
  }
  return points;
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [parsedGpx, setParsedGpx] = useState<GpxPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  // IMPORTANT: You need to set your Google Maps API key here.
  // It's recommended to use an environment variable for this.
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""; 
  // If NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set, the map will show an error.
  // Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY" to a .env.local file in your project root.

  useEffect(() => {
    if (tripId) {
      const fetchTripData = async () => {
        setIsLoading(true);
        try {
          const fetchedTrip = await getTripAction(tripId); // Using server action
          if (fetchedTrip) {
            setTrip(fetchedTrip);
            if (fetchedTrip.gpxData) {
              setParsedGpx(parseGpxClient(fetchedTrip.gpxData));
            }
          } else {
            toast({ title: "Trip not found", variant: "destructive" });
            router.push("/trips");
          }
        } catch (error) {
          console.error("Failed to fetch trip:", error);
          toast({ title: "Error fetching trip", description: "Could not load trip data.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchTripData();
    }
  }, [tripId, router, toast]);

  const handleFetchWeatherPoints = async () => {
    if (!trip?.gpxData) {
      toast({ title: "No GPX data", description: "Cannot fetch weather points without a route.", variant: "destructive" });
      return;
    }
    setIsLoadingWeather(true);
    try {
      const waypoints = await getAIWeatherPoints(trip.gpxData, trip.description);
      setTrip(prevTrip => prevTrip ? { ...prevTrip, weatherWaypoints: waypoints } : null);
      toast({ title: "Weather Points Loaded", description: `${waypoints.length} relevant points identified by AI.` });
    } catch (error) {
      console.error("Failed to fetch AI weather points:", error);
      toast({ title: "Error fetching weather points", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-destructive">Trip Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested trip could not be loaded.</p>
        <Button asChild className="mt-4">
          <Link href="/trips">Back to Trips List</Link>
        </Button>
      </div>
    );
  }
  
  // Mock gear list for display
  const mockGear: GearItem[] = [
    { id: "g1", name: "Tent", weight: 2000, imageUrl: "https://placehold.co/100x100.png?text=Tent" , notes: "2-person, 3-season"},
    { id: "g2", name: "Sleeping Bag", weight: 1000, imageUrl: "https://placehold.co/100x100.png?text=Bag", notes: "Comfort -5°C"},
    { id: "g3", name: "Bike Repair Kit", weight: 500, notes: "Includes patches, pump, multi-tool"},
  ];


  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="icon" asChild>
                <Link href="/trips">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Trips</span>
                </Link>
            </Button>
            <h1 className="text-3xl font-bold text-primary font-headline">{trip.name}</h1>
          </div>
          <p className="text-muted-foreground ml-12 sm:ml-0">{trip.description || "No description provided."}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/trips/${trip.id}/edit`}> {/* Assuming an edit page route */}
            <Edit className="mr-2 h-4 w-4" /> Edit Trip
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="map" className="text-base py-2.5"><MapPin className="mr-2 h-5 w-5" />Route & Map</TabsTrigger>
          <TabsTrigger value="weather" className="text-base py-2.5"><CloudDrizzle className="mr-2 h-5 w-5" />Weather</TabsTrigger>
          <TabsTrigger value="gear" className="text-base py-2.5"><ListChecks className="mr-2 h-5 w-5" />Gear List</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Route Map</CardTitle>
              <CardDescription>Visualize your planned route. GPX data provided: {trip.gpxData ? 'Yes' : 'No'}</CardDescription>
            </CardHeader>
            <CardContent>
              {parsedGpx.length > 0 ? (
                 <MapDisplay 
                    gpxPoints={parsedGpx} 
                    weatherWaypoints={trip.weatherWaypoints} 
                    apiKey={GOOGLE_MAPS_API_KEY} 
                />
              ) : (
                <p className="text-muted-foreground p-4 border rounded-md text-center">
                  No GPX data available to display the map for this trip, or the API key is missing/invalid.
                  {!GOOGLE_MAPS_API_KEY && <span className="text-destructive block mt-2">Google Maps API Key is not configured.</span>}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Weather Along Route</CardTitle>
              <CardDescription>Get AI-suggested weather checkpoints and forecasts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleFetchWeatherPoints} disabled={isLoadingWeather || !trip.gpxData} className="mb-6">
                {isLoadingWeather && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {trip.weatherWaypoints && trip.weatherWaypoints.length > 0 ? "Refresh AI Weather Points" : "Get AI Weather Points"}
              </Button>
              {trip.weatherWaypoints && trip.weatherWaypoints.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">The AI has identified {trip.weatherWaypoints.length} relevant points for weather checks. These are also visible on the map.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    {trip.weatherWaypoints.map((wp, idx) => (
                      <li key={idx} className="text-foreground/90">
                        <span className="font-semibold">{wp.name || `Point ${idx + 1}`}</span> (Lat: {wp.latitude.toFixed(4)}, Lon: {wp.longitude.toFixed(4)})
                        <p className="text-xs text-muted-foreground ml-2">- Reason: {wp.reason}</p>
                        {/* Placeholder for actual weather data display */}
                        <p className="text-xs text-accent ml-2">- Weather: Forecast unavailable (placeholder)</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {isLoadingWeather ? "Analyzing route..." : "Click the button above to let AI identify key weather checkpoints on your route."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gear">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Gear List</CardTitle>
              <CardDescription>Manage the equipment for this trip.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for GearList component */}
              <p className="text-muted-foreground mb-4">Gear list functionality coming soon. Here's a sample view:</p>
              <div className="space-y-3">
                {mockGear.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            {item.imageUrl ? 
                                <img src={item.imageUrl} alt={item.name} data-ai-hint="bicycle gear" className="h-12 w-12 rounded object-cover"/> :
                                <div className="h-12 w-12 rounded bg-secondary flex items-center justify-center">
                                    <ListChecks className="h-6 w-6 text-secondary-foreground"/>
                                </div>
                            }
                            <div>
                                <p className="font-medium text-primary">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.weight}g {item.notes ? `| ${item.notes}` : ''}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Details</Button>
                    </div>
                ))}
              </div>
               <Button variant="outline" className="mt-6">Manage Full Gear List</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
