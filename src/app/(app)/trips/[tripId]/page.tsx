
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapDisplay } from "@/components/map/map-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trip, Waypoint, GpxPoint, GearItem } from "@/lib/types";
import { getAIWeatherPoints, getTripAction, getGearItemsAction, updateTripAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, CloudDrizzle, ListChecks, ArrowLeft, Edit, Save, Settings2, Weight } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const [availableGear, setAvailableGear] = useState<GearItem[]>([]);
  const [currentSelectedGearIds, setCurrentSelectedGearIds] = useState<string[]>([]);
  const [isLoadingGear, setIsLoadingGear] = useState(false);
  const [isSavingGear, setIsSavingGear] = useState(false);
  
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""; 

  useEffect(() => {
    if (tripId) {
      const fetchTripData = async () => {
        setIsLoading(true);
        try {
          const fetchedTrip = await getTripAction(tripId); 
          if (fetchedTrip) {
            setTrip(fetchedTrip);
            setCurrentSelectedGearIds(fetchedTrip.selectedGearIds || []);
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

  useEffect(() => {
    const fetchGearItems = async () => {
      setIsLoadingGear(true);
      try {
        const gear = await getGearItemsAction();
        setAvailableGear(gear);
      } catch (error) {
        console.error("Failed to fetch gear items:", error);
        toast({ title: "Error fetching gear", description: "Could not load available gear items.", variant: "destructive" });
      } finally {
        setIsLoadingGear(false);
      }
    };
    fetchGearItems();
  }, [toast]);


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

  const handleToggleGearItem = (gearId: string) => {
    setCurrentSelectedGearIds(prev =>
      prev.includes(gearId) ? prev.filter(id => id !== gearId) : [...prev, gearId]
    );
  };

  const handleSaveGearSelections = async () => {
    if (!trip) return;
    setIsSavingGear(true);
    try {
      const updatedTrip = await updateTripAction(trip.id, { selectedGearIds: currentSelectedGearIds });
      if (updatedTrip) {
        setTrip(updatedTrip); // Update local trip state with the full updated trip from server
        setCurrentSelectedGearIds(updatedTrip.selectedGearIds); // Ensure currentSelectedGearIds is also in sync
        toast({ title: "Gear Selections Saved", description: "Your gear list for this trip has been updated." });
      } else {
        toast({ title: "Error Saving Gear", description: "Could not save gear selections.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save gear selections:", error);
      toast({ title: "Error Saving Gear", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSavingGear(false);
    }
  };

  const selectedGearItems = useMemo(() => {
    return availableGear.filter(item => currentSelectedGearIds.includes(item.id));
  }, [availableGear, currentSelectedGearIds]);

  const totalSelectedGearWeight = useMemo(() => {
    return selectedGearItems.reduce((total, item) => total + item.weight, 0);
  }, [selectedGearItems]);

  const gearSelectionChanged = useMemo(() => {
    if (!trip) return false;
    const originalSet = new Set(trip.selectedGearIds || []);
    const currentSet = new Set(currentSelectedGearIds);
    if (originalSet.size !== currentSet.size) return true;
    for (const id of originalSet) {
      if (!currentSet.has(id)) return true;
    }
    return false;
  }, [trip, currentSelectedGearIds]);


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
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Gear List for {trip.name}</CardTitle>
                <CardDescription>Select and manage equipment for this trip. Total weight: {(totalSelectedGearWeight / 1000).toFixed(2)} kg</CardDescription>
              </div>
              {gearSelectionChanged && (
                <Button onClick={handleSaveGearSelections} disabled={isSavingGear}>
                  {isSavingGear && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Gear Changes
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingGear ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Loading available gear...</p>
                </div>
              ) : availableGear.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No gear items available in your library. <Link href="/gear" className="text-accent hover:underline">Add gear to your library</Link> to select for this trip.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center"><Settings2 className="mr-2 h-5 w-5"/>Available Gear Items</h3>
                    <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted/20">
                      <div className="space-y-3">
                        {availableGear.map(item => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 bg-background rounded-md shadow-sm hover:bg-muted/50">
                            <Checkbox
                              id={`gear-${item.id}`}
                              checked={currentSelectedGearIds.includes(item.id)}
                              onCheckedChange={() => handleToggleGearItem(item.id)}
                              aria-label={`Select ${item.name}`}
                            />
                             <div className="flex-shrink-0 w-10 h-10">
                              {item.imageUrl ? (
                                <Image src={item.imageUrl} alt={item.name} data-ai-hint="gear" width={40} height={40} className="rounded object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                                  <ListChecks className="h-5 w-5 text-secondary-foreground" />
                                </div>
                              )}
                            </div>
                            <Label htmlFor={`gear-${item.id}`} className="flex-grow cursor-pointer">
                              <span className="font-medium text-foreground">{item.name}</span>
                              <span className="text-xs text-muted-foreground block">{item.weight}g - {item.notes || "No notes"}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Selected for this Trip ({selectedGearItems.length})</h3>
                    {selectedGearItems.length > 0 ? (
                      <ScrollArea className="h-[400px] border rounded-md p-4">
                        <div className="space-y-2">
                          {selectedGearItems.map(item => (
                            <Card key={`selected-${item.id}`} className="p-3 shadow-sm">
                              <div className="flex items-center gap-3">
                                 <div className="flex-shrink-0 w-12 h-12">
                                {item.imageUrl ? 
                                    <Image src={item.imageUrl} alt={item.name} data-ai-hint="bicycle gear" width={48} height={48} className="rounded object-cover"/> :
                                    <div className="h-12 w-12 rounded bg-secondary flex items-center justify-center">
                                        <ListChecks className="h-6 w-6 text-secondary-foreground"/>
                                    </div>
                                }
                                </div>
                                <div>
                                    <p className="font-medium text-primary">{item.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center"><Weight className="mr-1 h-3 w-3"/>{item.weight}g</p>
                                    {item.notes && <p className="text-xs text-foreground/70 mt-0.5">{item.notes}</p>}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="h-[400px] border rounded-md p-4 flex items-center justify-center bg-muted/20">
                        <p className="text-muted-foreground text-center">No gear selected for this trip yet. <br/>Check items from the "Available Gear" list.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
