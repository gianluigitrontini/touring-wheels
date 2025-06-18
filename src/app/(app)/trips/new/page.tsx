
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GpxUpload } from "@/components/map/gpx-upload";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, CalendarClock } from "lucide-react";
import Link from "next/link";
import { saveTripAction } from "@/lib/actions"; 
import type { Trip } from "@/lib/types";


export default function NewTripPage() {
  const [tripName, setTripName] = useState("");
  const [tripDescription, setTripDescription] = useState("");
  const [gpxData, setGpxData] = useState<string | null>(null);
  const [gpxFileName, setGpxFileName] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGpxUploaded = (data: string, fileName: string) => {
    setGpxData(data);
    setGpxFileName(fileName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName) {
      toast({ title: "Trip Name Required", description: "Please enter a name for your trip.", variant: "destructive" });
      return;
    }
    if (!gpxData) {
      toast({ title: "GPX File Required", description: "Please upload a GPX file for your trip route.", variant: "destructive" });
      return;
    }
    
    const duration = durationDays ? parseInt(durationDays, 10) : undefined;
    if (durationDays && (isNaN(duration!) || duration! <= 0)) {
      toast({ title: "Invalid Duration", description: "Trip duration must be a positive number.", variant: "destructive"});
      return;
    }


    setIsSaving(true);
    try {
      const tripToSave: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        name: tripName,
        description: tripDescription,
        gpxData: gpxData,
        durationDays: duration,
        parsedGpx: [], 
        weatherWaypoints: [],
        gearList: [], // This field is deprecated / not used, selectedGearIds is used
        selectedGearIds: [], 
        bikeId: undefined, 
        status: 'planned',
        dailyNotes: {},
      };
      const newTrip = await saveTripAction(tripToSave);
      
      toast({
        title: "Trip Saved!",
        description: `Your trip "${newTrip.name}" has been created.`,
      });
      router.push(`/trips/${newTrip.id}`); 
    } catch (error) {
      console.error("Failed to save trip:", error);
      toast({
        title: "Error Saving Trip",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/trips">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Trips</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary font-headline">Plan New Trip</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Trip Details</CardTitle>
            <CardDescription>Enter the basic information for your new bicycle tour.</CardDescription>
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
              <GpxUpload onGpxUploaded={handleGpxUploaded} />
              {gpxFileName && <p className="text-sm text-muted-foreground mt-2">Uploaded: {gpxFileName}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving || !gpxData} className="text-base px-6 py-3">
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? "Saving..." : "Save Trip & View Map"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
