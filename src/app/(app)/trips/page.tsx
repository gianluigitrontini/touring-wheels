"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Eye,
  CalendarDays,
  Trash2,
  Edit3,
  Loader2,
  MapPin,
  ListFilter,
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
import { getTripsAction } from "@/lib/actions";

function TripsPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as
    | Trip["status"]
    | "all"
    | null;

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
            createdAt: new Date(trip.createdAt),
            updatedAt: new Date(trip.updatedAt),
            status: trip.status || "planned",
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
    const tripNameToDelete =
      trips.find((t) => t.id === tripId)?.name || "the trip";
    setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
    toast({
      title: "Trip Removed (Locally)",
      description: `"${tripNameToDelete}" has been removed from this view. Full deletion not yet implemented.`,
    });
    // Mock server deletion would be:
    // try {
    //   await deleteTripAction(tripId); // Assume this action exists
    //   toast({ title: "Trip Deleted" });
    // } catch { /* ... */ }
  };

  const filteredTrips = trips.filter((trip) => {
    if (!statusFilter || statusFilter === "all") return true;
    return trip.status === statusFilter;
  });

  let pageTitle = "My Trips";
  if (statusFilter === "planned") pageTitle = "Planned Trips";
  if (statusFilter === "completed") pageTitle = "Completed Trips";

  if (isLoading) {
    return (
      <div className="container-default flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading trips...</p>
      </div>
    );
  }

  return (
    <div className="container-default">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary font-headline">
            {pageTitle}
          </h1>
        </div>
        <Button asChild>
          <Link href="/trips/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Plan New Trip
          </Link>
        </Button>
      </div>

      {/* Basic Filter Display - can be enhanced later */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={
            !statusFilter || statusFilter === "all" ? "default" : "outline"
          }
          size="sm"
          asChild
        >
          <Link href="/trips">All Trips</Link>
        </Button>
        <Button
          variant={statusFilter === "planned" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/trips?status=planned">Planned</Link>
        </Button>
        <Button
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/trips?status=completed">Completed</Link>
        </Button>
      </div>

      {filteredTrips.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">
              No {statusFilter && statusFilter !== "all" ? statusFilter : ""}{" "}
              Trips Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-muted-foreground mb-6">
              {statusFilter === "planned" &&
                "You have no trips currently planned."}
              {statusFilter === "completed" &&
                "You haven't completed any trips yet."}
              {(!statusFilter || statusFilter === "all") &&
                "It looks like you haven't planned any trips. Let's get started!"}
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
          {filteredTrips.map((trip) => (
            <Card
              key={trip.id}
              className="flex flex-col transition-shadow duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-headline text-primary hover:text-accent transition-colors">
                    <Link href={`/trips/${trip.id}`}>{trip.name}</Link>
                  </CardTitle>
                  <Badge
                    variant={
                      trip.status === "completed" ? "default" : "secondary"
                    }
                    className="capitalize text-xs"
                  >
                    {trip.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
                  <CalendarDays className="mr-1.5 h-4 w-4" />
                  Created: {trip.createdAt.toLocaleDateString()}
                  {trip.durationDays && ` | ${trip.durationDays} days`}
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
                    <Eye className="mr-1.5 h-4 w-4" /> View Details
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    asChild
                  >
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

export default function TripsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-default flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">
            Loading trips page...
          </p>
        </div>
      }
    >
      <TripsPageContent />
    </Suspense>
  );
}
