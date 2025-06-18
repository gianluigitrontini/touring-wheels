"use client";

import { APIProvider, Map, Polyline, Marker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import type { GpxPoint, Waypoint } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MapDisplayProps {
  gpxPoints?: GpxPoint[];
  weatherWaypoints?: Waypoint[];
  className?: string;
  apiKey?: string; // User needs to provide this
}

// Basic GPX Parser (very simplified)
function parseGpx(gpxString: string): GpxPoint[] {
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
    console.error("Error parsing GPX:", error);
    // Optionally, notify the user via toast or other means
  }
  return points;
}


export function MapDisplay({ gpxPoints: initialGpxPoints, weatherWaypoints, className, apiKey }: MapDisplayProps) {
  const [parsedGpxPath, setParsedGpxPath] = useState<GpxPoint[]>(initialGpxPoints || []);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default center (New York)
  const [zoom, setZoom] = useState(5); // Default zoom
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);

  useEffect(() => {
    if (initialGpxPoints && initialGpxPoints.length > 0) {
      setParsedGpxPath(initialGpxPoints);
      // Auto-center and zoom based on GPX data
      const latitudes = initialGpxPoints.map(p => p.lat);
      const longitudes = initialGpxPoints.map(p => p.lon);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      setCenter({ lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 });
      
      // Basic zoom calculation (very rough)
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      if (maxDiff > 0) {
        const newZoom = Math.floor(9 - Math.log2(maxDiff * 1.5)); // Adjust multiplier for better fit
        setZoom(Math.max(2, Math.min(15, newZoom))); // Clamp zoom level
      }

    } else {
        setParsedGpxPath([]); // Clear path if no GPX data
    }
  }, [initialGpxPoints]);
  
  if (!apiKey) {
    return (
      <Card className={`border-destructive ${className}`}>
        <CardHeader>
          <CardTitle className="text-destructive">Google Maps API Key Missing</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Please provide a Google Maps API Key to display the map. You can set this up in your
            Google Cloud Console and pass it as a prop to this component or set it via an environment variable.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ensure the Maps JavaScript API is enabled for your key.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // This component is needed to access the map instance for operations like fitBounds
  function MapController({ points }: { points: GpxPoint[] }) {
    const map = useMap();
  
    useEffect(() => {
      if (!map || points.length === 0) return;
  
      const bounds = new google.maps.LatLngBounds();
      points.forEach(point => bounds.extend({ lat: point.lat, lng: point.lon }));
      map.fitBounds(bounds);
      
      // Optional: Add a little padding
      const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom()! > 15) map.setZoom(15); // Don't zoom in too much
        google.maps.event.removeListener(listener);
      });

    }, [map, points]);
  
    return null;
  }


  return (
    <APIProvider apiKey={apiKey}>
      <div className={`h-[500px] w-full rounded-lg overflow-hidden shadow-md ${className}`}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          center={center}
          zoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="touringWheelsMap" // Optional: for custom map styling
        >
          {parsedGpxPath.length > 0 && (
            <>
              <Polyline
                path={parsedGpxPath.map(p => ({ lat: p.lat, lng: p.lon }))}
                strokeColor="#3D5A80" // Primary color
                strokeOpacity={0.8}
                strokeWeight={5}
              />
              <MapController points={parsedGpxPath} />
            </>
          )}
          {weatherWaypoints?.map((waypoint, index) => (
            <Marker
              key={`wp-${index}`}
              position={{ lat: waypoint.latitude, lng: waypoint.longitude }}
              title={waypoint.name || `Weather Point ${index + 1}`}
              onClick={() => setSelectedWaypoint(waypoint)}
            />
          ))}
          {selectedWaypoint && (
            <InfoWindow
              position={{ lat: selectedWaypoint.latitude, lng: selectedWaypoint.longitude }}
              onCloseClick={() => setSelectedWaypoint(null)}
              pixelOffset={new google.maps.Size(0, -30)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-semibold text-md mb-1 text-primary">{selectedWaypoint.name || "Weather Info"}</h4>
                <p className="text-sm text-foreground/80 mb-1"><strong>Reason:</strong> {selectedWaypoint.reason}</p>
                <p className="text-sm text-muted-foreground">
                  {/* Placeholder for actual weather data */}
                  Temp: 22°C, Sunny
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
