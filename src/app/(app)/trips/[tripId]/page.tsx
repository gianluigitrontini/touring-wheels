
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapDisplay } from "@/components/map/map-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trip, Waypoint, GearItem } from "@/lib/types";
import { getAIWeatherPoints, getTripAction, getGearItemsAction, updateTripAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, CloudDrizzle, ListChecks, ArrowLeft, Edit, Save, Settings2, Weight, Package, PackagePlus, XCircle, Tag } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  const [allGearLibrary, setAllGearLibrary] = useState<GearItem[]>([]);
  const [currentSelectedGearIds, setCurrentSelectedGearIds] = useState<string[]>([]);
  const [currentPackedItems, setCurrentPackedItems] = useState<Record<string, string[]>>({});
  
  const [isLoadingGear, setIsLoadingGear] = useState(false);
  const [isSavingGear, setIsSavingGear] = useState(false);
  
  useEffect(() => {
    if (tripId) {
      const fetchTripData = async () => {
        setIsLoading(true);
        try {
          const fetchedTrip = await getTripAction(tripId); 
          if (fetchedTrip) {
            setTrip(fetchedTrip);
            setCurrentSelectedGearIds(fetchedTrip.selectedGearIds || []);
            setCurrentPackedItems(fetchedTrip.packedItems || {});
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
        setAllGearLibrary(gear);
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

  const handleToggleGearItemSelection = (gearId: string) => {
    setCurrentSelectedGearIds(prev => {
      const newSelection = prev.includes(gearId) ? prev.filter(id => id !== gearId) : [...prev, gearId];
      // If item is deselected, also remove it from any packedItems structure
      if (!newSelection.includes(gearId)) {
        setCurrentPackedItems(prevPacked => {
          const newPacked = { ...prevPacked };
          // Remove the item if it's a container
          delete newPacked[gearId];
          // Remove the item if it's packed in another container
          for (const containerId in newPacked) {
            newPacked[containerId] = newPacked[containerId].filter(id => id !== gearId);
          }
          return newPacked;
        });
      }
      return newSelection;
    });
  };

  const handlePackItem = (itemIdToPack: string, containerId: string) => {
    setCurrentPackedItems(prevPacked => {
      const newPacked = { ...prevPacked };
      // Ensure the item to pack is selected
      if (!currentSelectedGearIds.includes(itemIdToPack)) return prevPacked;
       // Ensure the container is selected and is a container type
      const containerItem = allGearLibrary.find(item => item.id === containerId);
      if (!containerItem || containerItem.itemType !== 'container' || !currentSelectedGearIds.includes(containerId)) return prevPacked;


      // Remove item from any other container it might be in
      for (const cId in newPacked) {
        newPacked[cId] = newPacked[cId].filter(id => id !== itemIdToPack);
      }
      
      // Add to the new container
      if (!newPacked[containerId]) {
        newPacked[containerId] = [];
      }
      if (!newPacked[containerId].includes(itemIdToPack)) {
        newPacked[containerId] = [...newPacked[containerId], itemIdToPack];
      }
      return newPacked;
    });
  };
  
  const handleUnpackItem = (itemIdToUnpack: string, containerId?: string) => {
     setCurrentPackedItems(prevPacked => {
      const newPacked = { ...prevPacked };
      if (containerId && newPacked[containerId]) {
        newPacked[containerId] = newPacked[containerId].filter(id => id !== itemIdToUnpack);
      }
      // If containerId is not provided, it means we are unpacking from a "loose" state, which doesn't change currentPackedItems directly
      // The item simply remains selected but not in any specific container.
      return newPacked;
    });
  };


  const handleSaveGearSelections = async () => {
    if (!trip) return;
    setIsSavingGear(true);
    try {
      const updatedTripData = await updateTripAction(trip.id, { 
        selectedGearIds: currentSelectedGearIds,
        packedItems: currentPackedItems 
      });
      if (updatedTripData) {
        setTrip(updatedTripData); 
        setCurrentSelectedGearIds(updatedTripData.selectedGearIds || []); 
        setCurrentPackedItems(updatedTripData.packedItems || {});
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

  const selectedGearDetails = useMemo(() => {
    return allGearLibrary.filter(item => currentSelectedGearIds.includes(item.id));
  }, [allGearLibrary, currentSelectedGearIds]);

  const totalSelectedGearWeight = useMemo(() => {
    return selectedGearDetails.reduce((total, item) => total + item.weight, 0);
  }, [selectedGearDetails]);

  const gearSelectionChanged = useMemo(() => {
    if (!trip) return false;
    const originalSelectedSet = new Set(trip.selectedGearIds || []);
    const currentSelectedSet = new Set(currentSelectedGearIds);
    if (originalSelectedSet.size !== currentSelectedSet.size) return true;
    for (const id of originalSelectedSet) {
      if (!currentSelectedSet.has(id)) return true;
    }
    for (const id of currentSelectedSet) {
      if(!originalSelectedSet.has(id)) return true;
    }


    const originalPacked = JSON.stringify(trip.packedItems || {});
    const currentPacked = JSON.stringify(currentPackedItems); // currentPackedItems is already initialized
    if (originalPacked !== currentPacked) return true;
    
    return false;
  }, [trip, currentSelectedGearIds, currentPackedItems]);

  const { topLevelSelectedItems, looseSelectedItems } = useMemo(() => {
    const packedItemIds = new Set(Object.values(currentPackedItems).flat());
    const topLevelItems = selectedGearDetails.filter(item => !packedItemIds.has(item.id) || item.itemType === 'container');
    const looseItems = topLevelItems.filter(item => item.itemType !== 'container'); // Loose items cannot be containers themselves
    return { topLevelSelectedItems: topLevelItems, looseSelectedItems: looseItems };
  }, [selectedGearDetails, currentPackedItems]);

  const groupedAvailableGear = useMemo(() => {
    const groups: Record<string, GearItem[]> = {};
    allGearLibrary.forEach(item => {
      const category = item.category || "Miscellaneous";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    for (const category in groups) {
      groups[category].sort((a, b) => a.name.localeCompare(b.name));
    }
    return groups;
  }, [allGearLibrary]);

  const sortedAvailableCategories = useMemo(() => {
    return Object.keys(groupedAvailableGear).sort((a,b) => {
      if (a === "Miscellaneous") return 1;
      if (b === "Miscellaneous") return -1;
      return a.localeCompare(b);
    });
  }, [groupedAvailableGear]);


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
          <Link href={`/trips/${trip.id}/edit`}>
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
              {trip.gpxData || (trip.weatherWaypoints && trip.weatherWaypoints.length > 0) ? (
                 <MapDisplay 
                    gpxData={trip.gpxData} 
                    weatherWaypoints={trip.weatherWaypoints}
                />
              ) : (
                <p className="text-muted-foreground p-4 border rounded-md text-center">
                  No GPX data or weather waypoints available to display the map for this trip.
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
                <CardDescription>Select and manage equipment for this trip. Total weight of selected gear: {(totalSelectedGearWeight / 1000).toFixed(2)} kg</CardDescription>
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
              ) : allGearLibrary.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No gear items available in your library. <Link href="/gear" className="text-accent hover:underline">Add gear to your library</Link> to select for this trip.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center"><Settings2 className="mr-2 h-5 w-5"/>Available Gear Library</h3>
                    <ScrollArea className="h-[500px] border rounded-md p-1 bg-muted/20">
                     <Accordion type="multiple" defaultValue={sortedAvailableCategories} className="w-full space-y-2 p-2">
                        {sortedAvailableCategories.map(category => (
                          <AccordionItem value={category} key={`available-${category}`} className="border bg-background rounded-md shadow-sm">
                            <AccordionTrigger className="px-4 py-3 text-base font-medium text-primary hover:no-underline">
                              <div className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                {category} ({groupedAvailableGear[category].length})
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 pt-1">
                              <div className="space-y-2">
                                {groupedAvailableGear[category].map(item => (
                                  <div key={item.id} className="flex items-center space-x-3 p-2 bg-card rounded-md shadow-sm hover:bg-card/80">
                                    <Checkbox
                                      id={`gear-select-${item.id}`}
                                      checked={currentSelectedGearIds.includes(item.id)}
                                      onCheckedChange={() => handleToggleGearItemSelection(item.id)}
                                      aria-label={`Select ${item.name}`}
                                    />
                                    <div className="flex-shrink-0 w-10 h-10">
                                      {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} data-ai-hint={item['data-ai-hint'] || "gear"} width={40} height={40} className="rounded object-cover" />
                                      ) : (
                                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                                          {item.itemType === 'container' ? <Package className="h-5 w-5 text-secondary-foreground" /> : <ListChecks className="h-5 w-5 text-secondary-foreground" />}
                                        </div>
                                      )}
                                    </div>
                                    <Label htmlFor={`gear-select-${item.id}`} className="flex-grow cursor-pointer">
                                      <span className="font-medium text-foreground">{item.name} {item.itemType === 'container' && '(Bag)'}</span>
                                      <span className="text-xs text-muted-foreground block">{item.weight}g - {item.notes || "No notes"}</span>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Selected for this Trip ({selectedGearDetails.length})</h3>
                     <ScrollArea className="h-[500px] border rounded-md p-1">
                      {selectedGearDetails.length === 0 ? (
                        <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                          <p className="text-muted-foreground text-center">No gear selected yet. <br/>Check items from the "Available Gear" list.</p>
                        </div>
                      ) : (
                        <Accordion type="multiple" className="w-full" 
                          defaultValue={
                            topLevelSelectedItems.filter(i=>i.itemType === 'container').map(i=>i.id)
                            .concat(looseSelectedItems.length > 0 ? ["loose-items"] : [])
                          }
                        >
                          {topLevelSelectedItems.filter(item => item.itemType === 'container').map(containerItem => (
                            <AccordionItem value={containerItem.id} key={`container-${containerItem.id}`} className="border-b-0 mb-1">
                              <Card className="shadow-sm bg-card/50">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                  <div className="flex items-center gap-3 w-full">
                                    <Package className="h-5 w-5 text-primary"/>
                                    <span className="font-semibold text-primary">{containerItem.name}</span>
                                    <span className="text-xs text-muted-foreground ml-auto mr-2">({(currentPackedItems[containerItem.id]?.length || 0)} items / {(currentPackedItems[containerItem.id]?.reduce((acc, packedId) => acc + (allGearLibrary.find(g => g.id === packedId)?.weight || 0), 0) || 0)}g)</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-3 pt-1">
                                  <div className="space-y-2 ml-2 border-l pl-4 py-2">
                                  {(currentPackedItems[containerItem.id] || []).map(packedItemId => {
                                    const packedItem = allGearLibrary.find(g => g.id === packedItemId);
                                    if (!packedItem) return null;
                                    return (
                                      <div key={packedItemId} className="flex items-center justify-between text-sm p-1.5 rounded bg-background/70 hover:bg-background">
                                        <span className="text-foreground">{packedItem.name} <span className="text-xs text-muted-foreground">({packedItem.weight}g)</span></span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleUnpackItem(packedItemId, containerItem.id)}>
                                          <XCircle size={16}/> <span className="sr-only">Unpack</span>
                                        </Button>
                                      </div>
                                    );
                                  })}
                                  {(!currentPackedItems[containerItem.id] || currentPackedItems[containerItem.id].length === 0) && (
                                      <p className="text-xs text-muted-foreground italic py-1">This bag is empty. Pack items using the dropdown on loose items.</p>
                                  )}
                                  </div>
                                </AccordionContent>
                              </Card>
                            </AccordionItem>
                          ))}

                          {looseSelectedItems.length > 0 && (
                            <AccordionItem value="loose-items" className="border-b-0">
                               <Card className="shadow-sm mt-2">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/30 rounded-t-md">
                                    <div className="flex items-center gap-3 w-full">
                                        <ListChecks className="h-5 w-5 text-muted-foreground"/>
                                        <span className="font-semibold text-muted-foreground">Loose / Unpacked Items</span>
                                        <span className="text-xs text-muted-foreground ml-auto mr-2">({looseSelectedItems.length} items)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-3 pt-2">
                                  <div className="space-y-2">
                                    {looseSelectedItems.map(item => (
                                      <Card key={`loose-${item.id}`} className="p-3 shadow-none bg-background/50">
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-2">
                                            {item.imageUrl ? 
                                                <Image src={item.imageUrl} alt={item.name} data-ai-hint={item['data-ai-hint'] || "bicycle gear"} width={32} height={32} className="rounded object-cover"/> :
                                                <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                                                    <ListChecks className="h-4 w-4 text-secondary-foreground"/>
                                                </div>
                                            }
                                            <div>
                                                <p className="font-medium text-primary text-sm">{item.name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center"><Weight className="mr-1 h-3 w-3"/>{item.weight}g</p>
                                            </div>
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="outline" size="sm" className="h-8 px-2">
                                                <PackagePlus size={16} className="mr-1.5"/> Pack In...
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              {selectedGearDetails.filter(g => g.itemType === 'container' && g.id !== item.id).length > 0 ?
                                                selectedGearDetails.filter(g => g.itemType === 'container' && g.id !== item.id).map(container => (
                                                  <DropdownMenuItem key={`pack-into-${container.id}`} onClick={() => handlePackItem(item.id, container.id)}>
                                                    <Package size={14} className="mr-2"/> {container.name}
                                                  </DropdownMenuItem>
                                                )) :
                                                <DropdownMenuItem disabled>No available bags selected</DropdownMenuItem>
                                              }
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                </AccordionContent>
                               </Card>
                            </AccordionItem>
                          )}
                        </Accordion>
                      )}
                    </ScrollArea>
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
