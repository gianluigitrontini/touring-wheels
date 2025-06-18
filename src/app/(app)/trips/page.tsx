"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MapPin, CalendarDays, Trash2, Edit3, Eye } from "lucide-react";
import type { Trip } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with actual data fetching
const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Coastal Cruise California",
    description: "A scenic ride along the Pacific Coast Highway.",
    gpxData: "mock_gpx_data_coastal.gpx",
    createdAt: new Date("2023-05-10"),
    updatedAt: new Date("2023-05-12"),
  },
  {
    id: "2",
    name: "Rocky Mountain Challenge",
    description: "High altitude cycling through Colorado's Rockies.",
    gpxData: "mock_gpx_data_rockies.gpx",
    createdAt: new Date("2023-08-20"),
    updatedAt: new Date("2023-08-22"),
  },
];

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching trips
    setTrips(mockTrips);
  }, []);

  const handleDeleteTrip = (tripId: string) => {
    // Simulate API call for deletion
    console.log("Deleting trip:", tripId);
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
    toast({
        title: "Trip Deleted",
        description: "The trip has been successfully deleted.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary font-headline">My Trips</h1>
        <Button asChild>
          <Link href="/trips/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Plan New Trip
          </Link>
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">No Trips Yet!</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-muted-foreground mb-6">
              It looks like you haven't planned any trips. Let's get started on your next adventure!
            </CardDescription>
            <Button asChild size="lg">
              <Link href="/trips/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Plan Your First Trip
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-primary hover:text-accent transition-colors">
                  <Link href={`/trips/${trip.id}`}>{trip.name}</Link>
                </CardTitle>
                <CardDescription className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-1.5 h-4 w-4" />
                  Created: {trip.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {trip.description || "No description available."}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/trips/${trip.id}`}>
                    <Eye className="mr-1.5 h-4 w-4" /> View
                  </Link>
                </Button>
                <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" asChild>
                  <Link href={`/trips/${trip.id}/edit`} aria-label="Edit trip"> {/* Assuming an edit page */}
                    <Edit3 className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" aria-label="Delete trip">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the trip "{trip.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
