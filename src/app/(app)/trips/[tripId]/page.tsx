
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trip, Waypoint, GearItem } from "@/lib/types";
import {
  getAIWeatherPoints,
  getTripAction,
  getGearItemsAction,
  updateTripAction,
} from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  MapPin,
  CloudDrizzle,
  ListChecks,
  ArrowLeft,
  Edit,
  Save,
  Settings2,
  Weight,
  Package,
  PackagePlus,
  XCircle,
  Tag,
  PackageCheck,
  CalendarClock,
  BookOpen,
  CheckCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const MapDisplay = dynamic(
  () => import("@/components/map/map-display").then((mod) => mod.MapDisplay),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full flex items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

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
  const [currentSelectedGearIds, setCurrentSelectedGearIds] = useState<
    string[]
  >([]);
  const [currentPackedItems, setCurrentPackedItems] = useState<
    Record<string, string[]>
  >({});
  const [currentDailyNotes, setCurrentDailyNotes] = useState<
    Record<number, string>
  >({});

  const [isLoadingGear, setIsLoadingGear] = useState(false);
  const [isSavingGear, setIsSavingGear] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isAddGearModalOpen, setIsAddGearModalOpen] = useState(false);

  const isMobile = useIsMobile();
  const [mobileShowDiary, setMobileShowDiary] = useState(false);

  const loadTripData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTrip = await getTripAction(tripId);
      if (fetchedTrip) {
        setTrip(fetchedTrip);
        setCurrentSelectedGearIds(fetchedTrip.selectedGearIds || []);
        setCurrentPackedItems(fetchedTrip.packedItems || {});
        setCurrentDailyNotes(fetchedTrip.dailyNotes || {});
      } else {
        toast({ title: "Trip not found", variant: "destructive" });
        router.push("/trips");
      }
    } catch (error) {
      console.error("Failed to fetch trip:", error);
      toast({
        title: "Error fetching trip",
        description: "Could not load trip data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, router, toast]);

  useEffect(() => {
    if (tripId) {
      loadTripData();
    }
  }, [tripId, loadTripData]);

  useEffect(() => {
    const fetchGearItems = async () => {
      setIsLoadingGear(true);
      try {
        const gear = await getGearItemsAction();
        setAllGearLibrary(gear);
      } catch (error) {
        console.error("Failed to fetch gear items:", error);
        toast({
          title: "Error fetching gear",
          description: "Could not load available gear items.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingGear(false);
      }
    };
    fetchGearItems();
  }, [toast]);

  const handleFetchWeatherPoints = async () => {
    if (!trip?.gpxData) {
      toast({
        title: "No GPX data",
        description: "Cannot fetch weather points without a route.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingWeather(true);
    try {
      const waypoints = await getAIWeatherPoints(
        trip.gpxData,
        trip.description
      );
      setTrip((prevTrip) =>
        prevTrip ? { ...prevTrip, weatherWaypoints: waypoints } : null
      );
      await updateTripAction(trip.id, { weatherWaypoints: waypoints });
      toast({
        title: "Weather Points Loaded & Saved",
        description: `${waypoints.length} relevant points identified by AI.`,
      });
    } catch (error) {
      console.error("Failed to fetch AI weather points:", error);
      toast({
        title: "Error fetching weather points",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleToggleGearItemSelection = (gearId: string) => {
    setCurrentSelectedGearIds((prev) => {
      const newSelection = prev.includes(gearId)
        ? prev.filter((id) => id !== gearId)
        : [...prev, gearId];
      if (!newSelection.includes(gearId)) {
        setCurrentPackedItems((prevPacked) => {
          const newPacked = { ...prevPacked };
          delete newPacked[gearId];
          for (const containerId in newPacked) {
            newPacked[containerId] = newPacked[containerId].filter(
              (id) => id !== gearId
            );
          }
          return newPacked;
        });
      }
      return newSelection;
    });
  };

  const handlePackItem = (itemIdToPack: string, containerId: string) => {
    setCurrentPackedItems((prevPacked) => {
      const newPacked = { ...prevPacked };
      if (!currentSelectedGearIds.includes(itemIdToPack)) return prevPacked;
      const containerItem = allGearLibrary.find(
        (item) => item.id === containerId
      );
      if (
        !containerItem ||
        containerItem.itemType !== "container" ||
        !currentSelectedGearIds.includes(containerId)
      )
        return prevPacked;

      for (const cId in newPacked) {
        newPacked[cId] = newPacked[cId].filter((id) => id !== itemIdToPack);
      }

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
    setCurrentPackedItems((prevPacked) => {
      const newPacked = { ...prevPacked };
      if (containerId && newPacked[containerId]) {
        newPacked[containerId] = newPacked[containerId].filter(
          (id) => id !== itemIdToUnpack
        );
      }
      return newPacked;
    });
  };

  const handleSaveGearSelections = async () => {
    if (!trip) return;
    setIsSavingGear(true);
    try {
      const updatedTripData = await updateTripAction(trip.id, {
        selectedGearIds: currentSelectedGearIds,
        packedItems: currentPackedItems,
      });
      if (updatedTripData) {
        setTrip(updatedTripData);
        setCurrentSelectedGearIds(updatedTripData.selectedGearIds || []);
        setCurrentPackedItems(updatedTripData.packedItems || {});
        toast({
          title: "Gear Selections Saved",
          description: "Your gear list for this trip has been updated.",
        });
      } else {
        toast({
          title: "Error Saving Gear",
          description: "Could not save gear selections.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save gear selections:", error);
      toast({
        title: "Error Saving Gear",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSavingGear(false);
    }
  };

  const selectedGearDetails = useMemo(() => {
    return allGearLibrary.filter((item) =>
      currentSelectedGearIds.includes(item.id)
    );
  }, [allGearLibrary, currentSelectedGearIds]);

  const totalSelectedGearWeight = useMemo(() => {
    return selectedGearDetails.reduce((total, item) => total + item.weight, 0);
  }, [selectedGearDetails]);

  const gearSelectionChanged = useMemo(() => {
    if (!trip) return false;
    const originalSelectedSet = new Set(trip.selectedGearIds || []);
    const currentSelectedSet = new Set(currentSelectedGearIds);
    if (
      originalSelectedSet.size !== currentSelectedSet.size ||
      !Array.from(originalSelectedSet).every((id) =>
        currentSelectedSet.has(id)
      ) ||
      !Array.from(currentSelectedSet).every((id) => originalSelectedSet.has(id))
    )
      return true;

    const originalPacked = JSON.stringify(trip.packedItems || {});
    const currentPacked = JSON.stringify(currentPackedItems);
    return originalPacked !== currentPacked;
  }, [trip, currentSelectedGearIds, currentPackedItems]);

  const { topLevelSelectedItems, looseSelectedItems } = useMemo(() => {
    const packedItemIds = new Set(Object.values(currentPackedItems).flat());
    const topLevelItems = selectedGearDetails.filter(
      (item) => !packedItemIds.has(item.id) || item.itemType === "container"
    );
    const looseItems = topLevelItems.filter(
      (item) => item.itemType !== "container"
    );
    return {
      topLevelSelectedItems: topLevelItems,
      looseSelectedItems: looseItems,
    };
  }, [selectedGearDetails, currentPackedItems]);

  const groupedAvailableGear = useMemo(() => {
    const groups: Record<string, GearItem[]> = {};
    allGearLibrary.forEach((item) => {
      const category = item.category || "Miscellaneous";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    for (const category in groups)
      groups[category].sort((a, b) => a.name.localeCompare(b.name));
    return groups;
  }, [allGearLibrary]);

  const sortedAvailableCategories = useMemo(() => {
    return Object.keys(groupedAvailableGear).sort((a, b) => {
      if (a === "Miscellaneous") return 1;
      if (b === "Miscellaneous") return -1;
      return a.localeCompare(b);
    });
  }, [groupedAvailableGear]);

  const handleDailyNoteChange = (day: number, note: string) => {
    setCurrentDailyNotes((prev) => ({ ...prev, [day]: note }));
  };

  const handleSaveDailyNotes = async () => {
    if (!trip) return;
    setIsSavingNotes(true);
    try {
      const updatedTrip = await updateTripAction(trip.id, {
        dailyNotes: currentDailyNotes,
      });
      if (updatedTrip) {
        setTrip(updatedTrip);
        setCurrentDailyNotes(updatedTrip.dailyNotes || {});
        toast({
          title: "Travel Diary Saved",
          description: "Your daily notes have been updated.",
        });
      } else {
        toast({
          title: "Error Saving Notes",
          description: "Could not save daily notes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Saving Notes",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const dailyNotesChanged = useMemo(() => {
    if (!trip) return false;
    return (
      JSON.stringify(trip.dailyNotes || {}) !==
      JSON.stringify(currentDailyNotes)
    );
  }, [trip, currentDailyNotes]);

  const handleChangeTripStatus = async () => {
    if (!trip) return;
    const newStatus = trip.status === "planned" ? "completed" : "planned";
    try {
      const updatedTrip = await updateTripAction(trip.id, {
        status: newStatus,
      });
      if (updatedTrip) {
        setTrip(updatedTrip);
        toast({
          title: "Trip Status Updated",
          description: `Trip marked as ${newStatus}.`,
        });
      } else {
        toast({ title: "Error Updating Status", variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "Error Updating Status",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const renderAvailableGearDialogContent = () => {
    if (isLoadingGear) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading gear library...</p>
        </div>
      );
    }
    if (allGearLibrary.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-10">
          No gear items available in your library.{" "}
          <Link href="/gear" className="text-accent hover:underline">
            Add gear to your library
          </Link>
          .
        </p>
      );
    }
    return (
      <ScrollArea className="flex-grow my-4 border rounded-md bg-muted/20">
        <Accordion
          type="multiple"
          defaultValue={sortedAvailableCategories.map(
            (cat) => `${cat}-dialog`
          )}
          className="w-full space-y-2 p-2"
        >
          {sortedAvailableCategories.map((category) => (
            <AccordionItem
              value={`${category}-dialog`}
              key={`available-${category}-dialog`}
              className="border bg-background rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 text-base font-medium text-primary hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {category} ({groupedAvailableGear[category].length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <div className="space-y-2">
                  {groupedAvailableGear[category].map((item) => (
                    <div
                      key={`${item.id}-dialog`}
                      className="flex items-center space-x-3 p-2 bg-card rounded-md hover:bg-card/80"
                    >
                      <Checkbox
                        id={`gear-select-${item.id}-dialog`}
                        checked={currentSelectedGearIds.includes(item.id)}
                        onCheckedChange={() =>
                          handleToggleGearItemSelection(item.id)
                        }
                        aria-label={`Select ${item.name}`}
                      />
                      <div className="flex-shrink-0 w-10 h-10">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            data-ai-hint={item["data-ai-hint"] || "gear"}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                            {item.itemType === "container" ? (
                              <PackageCheck className="h-5 w-5 text-secondary-foreground" />
                            ) : (
                              <ListChecks className="h-5 w-5 text-secondary-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                      <Label
                        htmlFor={`gear-select-${item.id}-dialog`}
                        className="flex-grow cursor-pointer"
                      >
                        <span className="font-medium text-foreground">
                          {item.name}{" "}
                          {item.itemType === "container" && "(Bag)"}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {item.weight}g - {item.notes || "No notes"}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    );
  };

  const renderSelectedGearContent = () => {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
          <ListChecks className="mr-2 h-5 w-5" />
          Selected for this Trip ({selectedGearDetails.length})
        </h3>
        <ScrollArea className="h-[300px] md:h-[500px] border rounded-md p-1">
          {selectedGearDetails.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground text-center">
                No gear selected.
                <br />
                Click "Add/Remove Gear from Library" to add items.
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={topLevelSelectedItems
                .filter((i) => i.itemType === "container")
                .map((i) => i.id)
                .concat(
                  looseSelectedItems.length > 0 ? ["loose-items-selected"] : []
                )}
            >
              {topLevelSelectedItems
                .filter((item) => item.itemType === "container")
                .map((containerItem) => (
                  <AccordionItem
                    value={containerItem.id}
                    key={`container-${containerItem.id}-selected`}
                    className="border-b-0 mb-1"
                  >
                    <Card className="bg-card/50">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          <Package className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-primary">
                            {containerItem.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto mr-2">
                            (
                            {currentPackedItems[containerItem.id]?.length || 0}{" "}
                            items /{" "}
                            {currentPackedItems[containerItem.id]?.reduce(
                              (acc, packedId) =>
                                acc +
                                (allGearLibrary.find((g) => g.id === packedId)
                                  ?.weight || 0),
                              0
                            ) || 0}
                            g)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 pt-1">
                        <div className="space-y-2 ml-2 border-l pl-4 py-2">
                          {(currentPackedItems[containerItem.id] || []).map(
                            (packedItemId) => {
                              const packedItem = allGearLibrary.find(
                                (g) => g.id === packedItemId
                              );
                              if (!packedItem) return null;
                              return (
                                <div
                                  key={`${packedItemId}-selected-packed`}
                                  className="flex items-center justify-between text-sm p-1.5 rounded bg-background/70 hover:bg-background"
                                >
                                  <span className="text-foreground">
                                    {packedItem.name}{" "}
                                    <span className="text-xs text-muted-foreground">
                                      ({packedItem.weight}g)
                                    </span>
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                      handleUnpackItem(
                                        packedItemId,
                                        containerItem.id
                                      )
                                    }
                                  >
                                    <XCircle size={16} />{" "}
                                    <span className="sr-only">Unpack</span>
                                  </Button>
                                </div>
                              );
                            }
                          )}
                          {(!currentPackedItems[containerItem.id] ||
                            currentPackedItems[containerItem.id].length ===
                              0) && (
                            <p className="text-xs text-muted-foreground italic py-1">
                              Bag is empty.
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              {looseSelectedItems.length > 0 && (
                <AccordionItem
                  value="loose-items-selected"
                  className="border-b-0"
                >
                  <Card className="mt-2">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/30 rounded-t-md">
                      <div className="flex items-center gap-3 w-full">
                        <ListChecks className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-muted-foreground">
                          Loose / Unpacked Items
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto mr-2">
                          ({looseSelectedItems.length} items)
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-2">
                      <div className="space-y-2">
                        {looseSelectedItems.map((item) => (
                          <Card
                            key={`loose-${item.id}-selected`}
                            className="p-3 shadow-none bg-background/50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    data-ai-hint={
                                      item["data-ai-hint"] || "bicycle gear"
                                    }
                                    width={32}
                                    height={32}
                                    className="rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                                    <ListChecks className="h-4 w-4 text-secondary-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-primary text-sm">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <Weight className="mr-1 h-3 w-3" />
                                    {item.weight}g
                                  </p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2"
                                  >
                                    <PackagePlus
                                      size={16}
                                      className="mr-1.5"
                                    />{" "}
                                    Pack In...
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {selectedGearDetails.filter(
                                    (g) =>
                                      g.itemType === "container" &&
                                      g.id !== item.id
                                  ).length > 0 ? (
                                    selectedGearDetails
                                      .filter(
                                        (g) =>
                                          g.itemType === "container" &&
                                          g.id !== item.id
                                      )
                                      .map((container) => (
                                        <DropdownMenuItem
                                          key={`pack-into-${container.id}-selected`}
                                          onClick={() =>
                                            handlePackItem(
                                              item.id,
                                              container.id
                                            )
                                          }
                                        >
                                          <Package
                                            size={14}
                                            className="mr-2"
                                          />{" "}
                                          {container.name}
                                        </DropdownMenuItem>
                                      ))
                                  ) : (
                                    <DropdownMenuItem disabled>
                                      No available bags
                                    </DropdownMenuItem>
                                  )}
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
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">
          Loading trip details...
        </p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-destructive">
          Trip Not Found
        </h2>
        <p className="text-muted-foreground mt-2">
          The requested trip could not be loaded.
        </p>
        <Button asChild className="mt-4">
          <Link href="/trips">Back to Trips List</Link>
        </Button>
      </div>
    );
  }

  const renderDailyNotesInputs = () => {
    if (!trip.durationDays || trip.durationDays <= 0) {
      return (
        <div className="text-center py-8 bg-muted rounded-md">
          <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Set a duration for this trip to add daily notes.
          </p>
          <Button variant="link" asChild className="mt-2">
            <Link href={`/trips/${trip.id}/edit`}>Edit Trip Duration</Link>
          </Button>
        </div>
      );
    }
    const inputs = [];
    for (let i = 1; i <= trip.durationDays; i++) {
      inputs.push(
        <div key={`day-${i}`} className="space-y-2">
          <Label
            htmlFor={`day-note-${i}`}
            className="text-base font-medium text-primary"
          >
            Day {i}
          </Label>
          <Textarea
            id={`day-note-${i}`}
            value={currentDailyNotes[i] || ""}
            onChange={(e) => handleDailyNoteChange(i, e.target.value)}
            placeholder={`Notes for Day ${i}...`}
            rows={4}
            className="bg-background/70"
          />
        </div>
      );
    }
    return <div className="space-y-6">{inputs}</div>;
  };

  return (
    <div className="container-default">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/trips">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Trips</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-primary font-headline">
              {trip.name}
            </h1>
            <Badge
              variant={trip.status === "completed" ? "default" : "secondary"}
              className="capitalize text-sm py-1 px-3"
            >
              {trip.status || "Planned"}
            </Badge>
          </div>
          <p className="text-muted-foreground ml-12 sm:ml-0">
            {trip.description || "No description provided."}
          </p>
          {trip.durationDays && (
            <p className="text-sm text-muted-foreground ml-12 sm:ml-0 mt-1 flex items-center">
              <CalendarClock className="mr-1.5 h-4 w-4" /> Duration:{" "}
              {trip.durationDays} day{trip.durationDays > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
          <Button variant="outline" onClick={handleChangeTripStatus} className="w-full sm:w-auto">
            {trip.status === "planned" ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {trip.status === "planned"
              ? "Mark as Completed"
              : "Mark as Planned"}
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/trips/${trip.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Trip Details
            </Link>
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Route & Map
              </CardTitle>
              <CardDescription>
                Visualize your planned route. GPX data provided:{" "}
                {trip.gpxData ? "Yes" : "No"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trip.gpxData ||
              (trip.weatherWaypoints && trip.weatherWaypoints.length > 0) ? (
                <MapDisplay
                  gpxData={trip.gpxData}
                  weatherWaypoints={trip.weatherWaypoints}
                />
              ) : (
                <p className="text-muted-foreground p-4 border rounded-md text-center">
                  No GPX data or weather waypoints available for this trip.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CloudDrizzle className="h-5 w-5" /> Weather
              </CardTitle>
              <CardDescription>
                AI-suggested weather checkpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleFetchWeatherPoints}
                disabled={isLoadingWeather || !trip.gpxData}
                className="mb-6"
              >
                {isLoadingWeather && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {trip.weatherWaypoints && trip.weatherWaypoints.length > 0
                  ? "Refresh AI Weather Points"
                  : "Get AI Weather Points"}
              </Button>
              {/* Weather points display */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2"><ListChecks className="h-5 w-5" /> Gear List</CardTitle>
                    <CardDescription>Total weight: {(totalSelectedGearWeight / 1000).toFixed(2)} kg.</CardDescription>
                </div>
                {gearSelectionChanged && ( <Button onClick={handleSaveGearSelections} disabled={isSavingGear} size="sm">
                    {isSavingGear && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Gear
                </Button>)}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                  <Dialog open={isAddGearModalOpen} onOpenChange={setIsAddGearModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Add/Remove Gear from Library
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[calc(100vw-2rem)] max-h-[80vh] w-[calc(100vw-2rem)] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Available Gear Library</DialogTitle>
                        <DialogDescription>Select items to add or remove them from your trip's gear list.</DialogDescription>
                      </DialogHeader>
                      {renderAvailableGearDialogContent()}
                      <DialogFooter>
                        <DialogClose asChild><Button type="button">Done</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                 {renderSelectedGearContent()}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setMobileShowDiary(!mobileShowDiary)} variant="outline" className="w-full py-3 text-base">
            <BookOpen className="mr-2 h-5 w-5" />
            {mobileShowDiary ? "Hide Travel Diary" : "Show Travel Diary"}
          </Button>
          {mobileShowDiary && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                 <div>
                  <CardTitle className="font-headline flex items-center gap-2"><BookOpen className="h-5 w-5" /> Travel Diary</CardTitle>
                  <CardDescription>Record your experiences for each day.</CardDescription>
                 </div>
                 {dailyNotesChanged && ( <Button onClick={handleSaveDailyNotes} disabled={isSavingNotes} size="sm">
                  {isSavingNotes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Notes
                 </Button>)}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-3">
                  {renderDailyNotesInputs()}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="map" className="text-base py-2.5">
              <MapPin className="mr-2 h-5 w-5" />
              Route & Map
            </TabsTrigger>
            <TabsTrigger value="weather" className="text-base py-2.5">
              <CloudDrizzle className="mr-2 h-5 w-5" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="gear" className="text-base py-2.5">
              <ListChecks className="mr-2 h-5 w-5" />
              Gear List
            </TabsTrigger>
            <TabsTrigger value="diary" className="text-base py-2.5">
              <BookOpen className="mr-2 h-5 w-5" />
              Travel Diary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Route Map</CardTitle>
                <CardDescription>
                  Visualize your planned route. GPX data provided:{" "}
                  {trip.gpxData ? "Yes" : "No"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trip.gpxData ||
                (trip.weatherWaypoints && trip.weatherWaypoints.length > 0) ? (
                  <MapDisplay
                    gpxData={trip.gpxData}
                    weatherWaypoints={trip.weatherWaypoints}
                  />
                ) : (
                  <p className="text-muted-foreground p-4 border rounded-md text-center">
                    No GPX data or weather waypoints available for this trip.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  Weather Along Route
                </CardTitle>
                <CardDescription>
                  AI-suggested weather checkpoints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleFetchWeatherPoints}
                  disabled={isLoadingWeather || !trip.gpxData}
                  className="mb-6"
                >
                  {isLoadingWeather && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {trip.weatherWaypoints && trip.weatherWaypoints.length > 0
                    ? "Refresh AI Weather Points"
                    : "Get AI Weather Points"}
                </Button>
                {/* Weather points display */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gear">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="font-headline">
                    Gear List for {trip.name}
                  </CardTitle>
                  <CardDescription>
                    Manage equipment for this trip. Total weight: {(totalSelectedGearWeight / 1000).toFixed(2)}{" "}
                    kg
                  </CardDescription>
                </div>
                {gearSelectionChanged && (
                  <Button
                    onClick={handleSaveGearSelections}
                    disabled={isSavingGear}
                  >
                    {isSavingGear && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Gear Changes
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                 <div className="space-y-6">
                    <Dialog open={isAddGearModalOpen} onOpenChange={setIsAddGearModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          <PackagePlus className="mr-2 h-4 w-4" />
                          Add/Remove Gear from Library
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Available Gear Library</DialogTitle>
                          <DialogDescription>Select items to add or remove them from your trip's gear list.</DialogDescription>
                        </DialogHeader>
                        {renderAvailableGearDialogContent()}
                        <DialogFooter>
                          <DialogClose asChild><Button type="button">Done</Button></DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                   {renderSelectedGearContent()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diary">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="font-headline">Travel Diary</CardTitle>
                  <CardDescription>
                    Record your experiences for each day.
                  </CardDescription>
                </div>
                {dailyNotesChanged && (
                  <Button
                    onClick={handleSaveDailyNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Daily Notes
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-3">
                  {renderDailyNotesInputs()}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
