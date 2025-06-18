
"use client";

import React, { useEffect, useState, useMemo } from "react";
import type { Waypoint } from "@/lib/types";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import GpxParser from "gpxparser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Fix for default marker icons in Leaflet with bundlers like Webpack/Next.js
// Ensure these image paths are correct relative to your public folder or that they are properly imported/handled by Next.js
// For Next.js, you might need to ensure these are in the `public` directory and reference them correctly,
// or use a library like `next/image` if you were to customize them further with Image components (not directly applicable here for L.Icon.Default).
// This setup assumes Leaflet's images are correctly found by the bundler or available via its CSS.
// If issues persist, direct import of image assets might be needed.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


interface MapDisplayProps {
  gpxData?: string; // GPX data as a string
  weatherWaypoints?: Waypoint[];
  className?: string;
}

interface ParsedGpxTrack {
  points: LatLngExpression[];
  bounds: LatLngBoundsExpression;
}

// Helper component to automatically fit map bounds to the track
function FitBounds({ bounds }: { bounds: LatLngBoundsExpression | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && map) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
}

export function MapDisplay({ gpxData, weatherWaypoints, className }: MapDisplayProps) {
  const [parsedTrack, setParsedTrack] = useState<ParsedGpxTrack | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (gpxData) {
      try {
        const gpx = new GpxParser();
        gpx.parse(gpxData);

        if (gpx.tracks.length === 0) {
          setMapError("No tracks found in GPX data.");
          setParsedTrack(null);
          return;
        }

        // For simplicity, using the first track
        const track = gpx.tracks[0];
        const points: LatLngExpression[] = track.points.map(p => [p.lat, p.lon] as LatLngExpression);
        
        if (points.length === 0) {
          setMapError("GPX track contains no points.");
          setParsedTrack(null);
          return;
        }

        const bounds = L.latLngBounds(points);
        setParsedTrack({ points, bounds });
        setMapError(null);

      } catch (error) {
        console.error("Error parsing GPX data:", error);
        setMapError("Failed to parse GPX data.");
        setParsedTrack(null);
      }
    } else {
      setParsedTrack(null);
      setMapError(null); // No error if no data is provided intentionally
    }
  }, [gpxData]);

  const polylineColor = 'hsl(var(--primary))'; // Using primary color from CSS variables

  if (mapError) {
    return (
      <Card className={`border-destructive ${className}`}>
        <CardHeader>
          <CardTitle className="text-destructive">Map Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{mapError}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!gpxData && (!weatherWaypoints || weatherWaypoints.length === 0)) {
    return (
       <div className={`h-[500px] w-full rounded-lg overflow-hidden shadow-md flex items-center justify-center bg-muted ${className}`}>
          <p className="text-muted-foreground">No route data or waypoints to display on the map.</p>
       </div>
    );
  }
  
  // Default center and zoom if no track is loaded but waypoints might exist
  const defaultCenter: LatLngExpression = parsedTrack?.bounds ? L.latLngBounds(parsedTrack.points).getCenter() : [51.505, -0.09];
  const defaultZoom = parsedTrack?.bounds ? 13 : 5;


  return (
    <div className={`h-[500px] w-full rounded-lg overflow-hidden shadow-md ${className}`}>
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => {
            // Example: force a resize if layout issues occur, though often not needed
            // setTimeout(() => mapInstance.invalidateSize(), 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parsedTrack && parsedTrack.points.length > 0 && (
          <>
            <Polyline pathOptions={{ color: polylineColor, weight: 5 }} positions={parsedTrack.points} />
            <FitBounds bounds={parsedTrack.bounds} />
          </>
        )}
        {weatherWaypoints && weatherWaypoints.map((wp, idx) => (
          <Marker key={idx} position={[wp.latitude, wp.longitude]}>
            <Popup>
              <div className="p-1">
                <h4 className="font-semibold text-md mb-1 text-primary">{wp.name || `Weather Point ${idx + 1}`}</h4>
                <p className="text-sm text-foreground/80 mb-0.5"><strong>Reason:</strong> {wp.reason}</p>
                <p className="text-xs text-muted-foreground">Lat: {wp.latitude.toFixed(4)}, Lon: {wp.longitude.toFixed(4)}</p>
                <p className="text-xs text-accent mt-0.5">Weather: Forecast unavailable (placeholder)</p>
              </div>
            </Popup>
          </Marker>
        ))}
         {!parsedTrack && weatherWaypoints && weatherWaypoints.length > 0 && (
          <FitBounds bounds={L.latLngBounds(weatherWaypoints.map(wp => [wp.latitude, wp.longitude] as LatLngExpression))} />
        )}
      </MapContainer>
    </div>
  );
}
