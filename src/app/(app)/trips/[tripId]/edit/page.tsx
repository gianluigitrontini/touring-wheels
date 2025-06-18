
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GpxUpload } from "@/components/map/gpx-upload";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, CalendarClock, Loader2 } from "lucide-react";
import Link from "next/link";
import { getTripAction, updateTripAction } from "@/lib/actions";
import type { Trip } from "@/lib/types";

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripName, setTripName] = useState("");
  const [tripDescription, setTripDescription] = useState("");
  const [durationDays, setDurationDays] = useState<string>("");
  
  const [newGpxData, setNewGpxData] = useState<string | null>(null);
  const [newGpxFileName, setNewGpxFileName] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!tripId) {
      setIsLoading(false);
      toast({ title: "Invalid Trip ID", variant: "destructive" });
      router.push("/trips");
      return;
    }

    const fetchTrip = async () => {
      setIsLoading(true);
      try {
        const fetchedTrip = await getTripAction(tripId);
        if (fetchedTrip) {
          setTrip(fetchedTrip);
          setTripName(fetchedTrip.name);
          setTripDescription(fetchedTrip.description || "");
          setDurationDays(fetchedTrip.durationDays?.toString() || "");
        } else {
          toast({ title: "Trip Not Found", variant: "destructive" });
          router.push("/trips");
        }
      } catch (error) {
        console.error("Failed to fetch trip for editing:", error);
        toast({ title: "Error Fetching Trip", description: "Could not load trip data for editing.", variant: "destructive" });
        router.push(`/trips/${tripId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, router, toast]);

  const handleGpxUploaded = (data: string, fileName: string) => {
    setNewGpxData(data);
    setNewGpxFileName(fileName);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trip) {
      toast({ title: "Error", description: "Trip data not loaded.", variant: "destructive" });
      return;
    }
    if (!tripName) {
      toast({ title: "Trip Name Required", description: "Please enter a name for your trip.", variant: "destructive" });
      return;
    }

    const parsedDuration = durationDays ? parseInt(durationDays, 10) : undefined;
    if (durationDays && (isNaN(parsedDuration!) || parsedDuration! <= 0)) {
      toast({ title: "Invalid Duration", description: "Trip duration must be a positive number.", variant: "destructive"});
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>> = {
        name: tripName,
        description: tripDescription,
        durationDays: parsedDuration,
      };

      if (newGpxData) { // Only include gpxData in updates if a new file was uploaded
        updates.gpxData = newGpxData;
      }

      const updatedTrip = await updateTripAction(trip.id, updates);
      
      if (updatedTrip) {
        toast({
          title: "Trip Updated!",
          description: `Your trip "${updatedTrip.name}" has been successfully updated.`,
        });
        router.push(`/trips/${updatedTrip.id}`);
      } else {
        toast({ title: "Update Failed", description: "Could not update the trip.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update trip:", error);
      toast({
        title: "Error Updating Trip",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading trip details for editing...</p>
      </div>
    );
  }

  if (!trip) {
    // This case should ideally be handled by the redirect in useEffect, but as a fallback:
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg text-destructive">Could not load trip information.</p>
        <Button asChild className="mt-4">
          <Link href="/trips">Back to Trips List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/trips/${tripId}`}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Trip Details</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary font-headline">Edit Trip: {trip.name}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Update Trip Details</CardTitle>
            <CardDescription>Modify the information for your bicycle tour.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tripName" className="text-lg font-medium">Trip Name</Label>
              <Input
                id="tripName"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g., Alpine Adventure Summer 2024"
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tripDescription" className="text-lg font-medium">Trip Description (Optional)</Label>
              <Textarea
                id="tripDescription"
                value={tripDescription}
                onChange={(e) => setTripDescription(e.target.value)}
                placeholder="Describe your trip, key locations, goals, etc."
                rows={4}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDays" className="text-lg font-medium flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-muted-foreground"/>
                Trip Duration (Days)
              </Label>
              <Input
                id="durationDays"
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="e.g., 14"
                min="1"
                className="text-base w-full sm:w-1/2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-medium">GPX Route File</Label>
              {trip.gpxData && !newGpxFileName && (
                <p className="text-sm text-muted-foreground mb-2">
                  A GPX route is already associated with this trip. Uploading a new file will replace it.
                </p>
              )}
              <GpxUpload onGpxUploaded={handleGpxUploaded} />
              {newGpxFileName && <p className="text-sm text-muted-foreground mt-2">New file selected: {newGpxFileName}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="text-base px-6 py-3">
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

