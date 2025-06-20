"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Zap, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";
import type { Trip } from "@/lib/types";

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

interface TripMapSectionProps {
  trip: Trip;
  isLoadingWeather: boolean;
  handleFetchWeatherPoints: () => Promise<void>;
}

export function TripMapSection({
  trip,
  isLoadingWeather,
  handleFetchWeatherPoints,
}: TripMapSectionProps) {
  return (
    <div>
      <div className="mb-4">
        <CardTitle className="font-headline">Route Map</CardTitle>
        <CardDescription>Visualize your planned route.</CardDescription>
      </div>
      {trip.gpxData || (trip.weatherWaypoints && trip.weatherWaypoints.length > 0) ? (
        <>
          <MapDisplay
            gpxData={trip.gpxData}
            weatherWaypoints={trip.weatherWaypoints}
          />
          <div className="my-6 flex justify-between items-center border rounded-md p-4">
            <div>
              <CardTitle className="font-headline">
                Weather Along Route
              </CardTitle>
              <CardDescription>AI-suggested weather checkpoints.</CardDescription>
            </div>
            <Button
              onClick={handleFetchWeatherPoints}
              disabled={isLoadingWeather || !trip.gpxData}
            >
              {isLoadingWeather && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {trip.weatherWaypoints && trip.weatherWaypoints.length > 0
                ? "Refresh AI Weather Points"
                : "Get AI Weather Points"}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground p-4 border rounded-md text-center">
          No GPX data or weather waypoints available for this trip.
        </p>
      )}
    </div>
  );
}