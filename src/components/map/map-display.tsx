
"use client";

import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import type { GpxPoint, Waypoint } from "@/lib/types";
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper component to draw the GPX polyline
function PathPolyline({ path }: { path: GpxPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || path.length === 0 || !google.maps.Polyline) return;

    const gmapsPolyline = new google.maps.Polyline({
      path: path.map(p => ({ lat: p.lat, lng: p.lon })),
      strokeColor: "#3D5A80", // Primary color from theme
      strokeOpacity: 0.8,
      strokeWeight: 5,
    });

    gmapsPolyline.setMap(map);

    return () => {
      gmapsPolyline.setMap(null);
    };
  }, [map, path]);

  return null;
}

// Helper component to render waypoints as markers
function WaypointsRenderer({ 
  waypoints, 
  onWaypointClick 
}: { 
  waypoints: Waypoint[], 
  onWaypointClick: (waypoint: Waypoint) => void 
}) {
  const map = useMap();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!map || !google.maps.Marker) {
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    if (!waypoints || waypoints.length === 0) {
      setMarkers([]);
      return;
    }

    const newMarkers = waypoints.map((waypoint, index) => {
      const marker = new google.maps.Marker({
        position: { lat: waypoint.latitude, lng: waypoint.longitude },
        map: map,
        title: waypoint.name || `Weather Point ${index + 1}`,
      });
      marker.addListener('click', () => {
        onWaypointClick(waypoint);
      });
      return marker;
    });
    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [map, waypoints]); // onWaypointClick can cause re-renders if not stable, but should be ok here

  return null;
}

// Helper component for InfoWindow
function CustomInfoWindow({ 
  waypoint, 
  onClose 
}: { 
  waypoint: Waypoint | null, 
  onClose: () => void 
}) {
  const map = useMap();
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  useEffect(() => {
    if (!map || !google.maps.InfoWindow) return;

    if (!infoWindowRef.current) {
      const iw = new google.maps.InfoWindow({
        pixelOffset: new google.maps.Size(0, -30),
      });
      infoWindowRef.current = iw;
      
      iw.addListener('closeclick', onClose);
    }
    
    return () => {
      // Clean up listener when map or onClose changes, or component unmounts.
      // This might be too aggressive if map instance is stable.
      if (infoWindowRef.current) {
        google.maps.event.clearInstanceListeners(infoWindowRef.current);
      }
    };
  }, [map, onClose]);


  useEffect(() => {
    const iw = infoWindowRef.current;
    if (!iw || !map) return;

    if (waypoint) {
      const contentDiv = document.createElement('div');
      contentDiv.className = "p-2 max-w-xs"; // Tailwind classes should apply if globals.css is loaded
      contentDiv.innerHTML = `
        <h4 class="font-semibold text-md mb-1 text-primary">${waypoint.name || "Weather Info"}</h4>
        <p class="text-sm text-foreground/80 mb-1"><strong>Reason:</strong> ${waypoint.reason}</p>
        <p class="text-sm text-muted-foreground">
          Temp: 22°C, Sunny <!-- Placeholder -->
        </p>
      `;
      iw.setContent(contentDiv);
      iw.setPosition({ lat: waypoint.latitude, lng: waypoint.longitude });
      iw.open(map);
    } else {
      iw.close();
    }
  }, [map, waypoint]);

  return null;
}


interface MapDisplayProps {
  gpxPoints?: GpxPoint[];
  weatherWaypoints?: Waypoint[];
  className?: string;
  apiKey?: string;
}

export function MapDisplay({ gpxPoints: initialGpxPoints, weatherWaypoints, className, apiKey }: MapDisplayProps) {
  const [parsedGpxPath, setParsedGpxPath] = useState<GpxPoint[]>(initialGpxPoints || []);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default center
  const [zoom, setZoom] = useState(5); // Default zoom
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);

  useEffect(() => {
    if (initialGpxPoints && initialGpxPoints.length > 0) {
      setParsedGpxPath(initialGpxPoints);
      const latitudes = initialGpxPoints.map(p => p.lat);
      const longitudes = initialGpxPoints.map(p => p.lon);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      setCenter({ lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 });
      
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      if (maxDiff > 0) {
        const newZoom = Math.floor(9 - Math.log2(maxDiff * 1.5));
        setZoom(Math.max(2, Math.min(15, newZoom)));
      }
    } else {
        setParsedGpxPath([]);
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
            Please provide a Google Maps API Key to display the map.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ensure the Maps JavaScript API is enabled for your key.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  function MapBoundsController({ points }: { points: GpxPoint[] }) {
    const map = useMap();
  
    useEffect(() => {
      if (!map || points.length === 0 || !google.maps.LatLngBounds) return;
  
      const bounds = new google.maps.LatLngBounds();
      points.forEach(point => bounds.extend({ lat: point.lat, lng: point.lon }));
      map.fitBounds(bounds);
      
      const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom()! > 15) map.setZoom(15);
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
          mapId="touringWheelsMap"
        >
          {parsedGpxPath.length > 0 && (
            <>
              <PathPolyline path={parsedGpxPath} />
              <MapBoundsController points={parsedGpxPath} />
            </>
          )}
          {weatherWaypoints && weatherWaypoints.length > 0 && (
            <WaypointsRenderer 
              waypoints={weatherWaypoints} 
              onWaypointClick={setSelectedWaypoint} 
            />
          )}
          <CustomInfoWindow 
            waypoint={selectedWaypoint} 
            onClose={() => setSelectedWaypoint(null)} 
          />
        </Map>
      </div>
    </APIProvider>
  );
}

// Basic GPX Parser (client-side) - This function is not directly related to the error but part of the file.
// No changes needed here for this specific error.
function parseGpxClient(gpxString: string): GpxPoint[] {
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
    console.error("Error parsing GPX on client:", error);
  }
  return points;
}
