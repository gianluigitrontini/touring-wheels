"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Trip } from "@/lib/types";
import { CalendarClock, Loader2 } from "lucide-react";
import Link from "next/link";

interface TripDiarySectionProps {
  trip: Trip;
  isSavingNotes: boolean;
  currentDailyNotes: Record<number, string>;
  handleDailyNoteChange: (day: number, note: string) => void;
  handleSaveDailyNotes: () => Promise<void>;
  dailyNotesChanged: boolean;
}

const TripDiarySection: React.FC<TripDiarySectionProps> = ({
  trip,
  isSavingNotes,
  currentDailyNotes,
  handleDailyNoteChange,
  handleSaveDailyNotes,
  dailyNotesChanged,
}) => {
  const renderDailyNotesInputs = () => {
    if (!trip.durationDays || trip.durationDays <= 0) {
      return (
        <div className="text-center py-8 bg-muted rounded-md">
          <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Set a duration for this trip to add daily notes.
          </p>
          <Button variant="link" asChild className="mt-2">
            <Link href={`/trips/${trip.id}/edit`}>Edit Trip Duration</Link>
          </Button>
        </div>
      );
    }
    const inputs = [];
    for (let i = 1; i <= trip.durationDays; i++) {
      inputs.push(
        <div key={`day-${i}`} className="space-y-2">
          <Label
            htmlFor={`day-note-${i}`}
            className="text-base font-medium text-primary"
          >
            Day {i}
          </Label>
          <Textarea
            id={`day-note-${i}`}
            value={currentDailyNotes[i] || ""}
            onChange={(e) => handleDailyNoteChange(i, e.target.value)}
            placeholder={`Notes for Day ${i}...`}
            rows={4}
            className="bg-background/70"
          />
        </div>
      );
    }
    return <div className="space-y-6">{inputs}</div>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardTitle className="font-headline">Travel Diary</CardTitle>
          <CardDescription>
            Record your experiences for each day.
          </CardDescription>
        </div>
        {dailyNotesChanged && (
          <Button onClick={handleSaveDailyNotes} disabled={isSavingNotes}>
            {isSavingNotes && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Daily Notes
          </Button>
        )}
      </div>

      <ScrollArea className="h-[500px] pr-3">
        {renderDailyNotesInputs()}
      </ScrollArea>
    </div>
  );
};

export default TripDiarySection;