import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react"; // Replaced Bike with MapIcon for My Trips
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container-default">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary font-headline">
          Dashboard
        </h1>
        <Button asChild>
          <Link href="/trips/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Plan New Trip
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow duration-300 col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary font-headline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
              Quick Stats
            </CardTitle>
            <CardDescription>Your touring at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Total Kilometers Planned:
              </span>
              <span className="font-semibold text-primary">0 km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Longest Trip:</span>
              <span className="font-semibold text-primary">N/A</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gear Items Logged:</span>
              <span className="font-semibold text-primary">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bikes Logged:</span>
              <span className="font-semibold text-primary">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-primary mb-4 font-headline">
          Recent Activity
        </h2>
        <div className="bg-white/50 p-6 rounded-lg border">
          <p className="text-muted-foreground">
            No recent activity.{" "}
            <Link href="/trips/new" className="text-accent hover:underline">
              Plan a new trip
            </Link>{" "}
            to get started!
          </p>
        </div>
      </section>
    </div>
  );
}
