"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BikeIcon, EditIcon, Loader } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

interface TripHeaderProps {
  trip: Trip;
  handleChangeTripStatus: () => Promise<void>;
}

const TripHeader: React.FC<TripHeaderProps> = ({
  trip,
  handleChangeTripStatus,
}) => {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-y-4 md:flex-row md:justify-between md:items-center">
      <div className="flex flex-col gap-y-2">
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <p className="text-muted-foreground">{trip.description}</p>
        <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
          <Badge
            className={cn(
              "text-xs",
              trip.status === "planned" &&
                "bg-blue-500 hover:bg-blue-500/80 text-primary-foreground",
              // trip.status === "ongoing" &&
              //   "bg-green-500 hover:bg-green-500/80 text-primary-foreground",
              trip.status === "completed" &&
                "bg-purple-500 hover:bg-purple-500/80 text-primary-foreground",
              // trip.status === "cancelled" &&
              //   "bg-red-500 hover:bg-red-500/80 text-primary-foreground"
            )}
          >
            {trip.status}
          </Badge>
          <span>&bull;</span>
          <span>{trip.durationDays} days</span>
        </div>
      </div>
      <div className="flex gap-x-2">
        {isPending ? (
          <Skeleton className="w-32 h-10" />
        ) : (
          <Button
            variant="outline"
            onClick={() => startTransition(handleChangeTripStatus)}
            disabled={isPending}
          >
            {trip.status === "planned" && (
              <>
                <BikeIcon className="mr-2 w-4 h-4" /> Start Trip
              </>
            )}
            {/* {trip.status === "ongoing" && (
              <>
                <BikeIcon className="mr-2 w-4 h-4" /> End Trip
              </>
            )} */}
            {trip.status === "completed" && (
              <>
                <BikeIcon className="mr-2 w-4 h-4" /> Mark as Planned
              </>
            )}
            {/* {trip.status === "cancelled" && (
              <>
                <BikeIcon className="mr-2 w-4 h-4" /> Mark as Planned
              </>
            )} */}
          </Button>
        )}

        <Link href={`/trips/${trip.id}/edit`}>
          <Button variant="outline">
            <EditIcon className="mr-2 w-4 h-4" /> Edit
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TripHeader;