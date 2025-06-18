"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  Eye,
  CalendarDays,
  Trash2,
  Edit3,
  Loader2,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getTripsAction } from "@/lib/actions"; // Import server action

// Placeholder for a potential server action to delete trips.
// async function deleteTripServerAction(tripId: string): Promise<boolean> {
//   console.log("Calling server to delete trip:", tripId);
//   // This would interact with the MOCK_DB on the server via globalThis
//   const MOCK_DB = (globalThis as any).MOCK_DB_INSTANCE;
//   if (MOCK_DB && MOCK_DB.trips) {
//     const deleted = MOCK_DB.trips.delete(tripId);
//     if (deleted) {
//        console.log("Trip deleted from MOCK_DB on server");
//        return true;
//     }
//   }
//   console.log("Trip not found in MOCK_DB on server for deletion");
//   return false;
// }

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const fetchedTrips = await getTripsAction();
        setTrips(
          fetchedTrips.map((trip) => ({
            ...trip,
            createdAt: new Date(trip.createdAt), // Ensure createdAt is a Date object
            updatedAt: new Date(trip.updatedAt), // Ensure updatedAt is a Date object
          }))
        );
      } catch (error) {
        console.error("Failed to fetch trips:", error);
        toast({
          title: "Error fetching trips",
          description: "Could not load trips data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, [toast]);

  const handleDeleteTrip = async (tripId: string) => {
    // For now, this is an optimistic client-side update.
    // A full implementation would call a server action.
    const tripNameToDelete =
      trips.find((t) => t.id === tripId)?.name || "the trip";
    setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
    toast({
      title: "Trip Removed (Locally)",
      description: `"${tripNameToDelete}" has been removed from this view.`,
    });

    // Example of how it might work with a server action:
    // try {
    //   const success = await deleteTripServerAction(tripId);
    //   if (success) {
    //     toast({ title: "Trip Deleted", description: `"${tripNameToDelete}" has been successfully deleted.` });
    //     // Optionally re-fetch or confirm client state matches server
    //   } else {
    //     toast({ title: "Deletion Failed", description: "Could not delete the trip on the server.", variant: "destructive" });
    //     // Potentially re-fetch to revert optimistic update if needed
    //     const fetchedTrips = await getTripsAction();
    //     setTrips(fetchedTrips.map(trip => ({...trip, createdAt: new Date(trip.createdAt), updatedAt: new Date(trip.updatedAt)})));
    //   }
    // } catch (error) {
    //   toast({ title: "Error Deleting Trip", description: (error as Error).message, variant: "destructive" });
    //   const fetchedTrips = await getTripsAction();
    //   setTrips(fetchedTrips.map(trip => ({...trip, createdAt: new Date(trip.createdAt), updatedAt: new Date(trip.updatedAt)})));
    // }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading trips...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary font-headline">
          My Trips
        </h1>
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
            <CardTitle className="text-2xl font-headline text-primary">
              No Trips Yet!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-muted-foreground mb-6">
              It looks like you haven't planned any trips. Let's get started on
              your next adventure!
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
            <Card
              key={trip.id}
              className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    asChild
                  >
                    {/* The edit page /trips/[tripId]/edit doesn't exist yet. This link will 404. */}
                    <Link
                      href={`/trips/${trip.id}/edit`}
                      aria-label="Edit trip"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Delete trip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will remove the
                          trip "{trip.name}" from your list (locally).
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
