import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MountainSnow, MapPinned, ListChecks } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Touring Wheels</h1>
          <nav>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Go to App</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-primary mb-4 font-headline">Plan Your Epic Bicycle Adventure</h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Touring Wheels helps you meticulously plan your multi-week bicycle trips. Upload your routes, manage your gear, and check the weather along your path, all in one place.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Start Planning Now</Link>
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <MapPinned className="w-16 h-16 text-accent" />
              </div>
              <CardTitle className="text-2xl font-headline text-center text-primary">GPX Route Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-foreground/70">
                Visualize your journey by uploading GPX tracks. See your past and upcoming route sections clearly on an interactive map.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <ListChecks className="w-16 h-16 text-accent" />
              </div>
              <CardTitle className="text-2xl font-headline text-center text-primary">Gear Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-foreground/70">
                Keep track of all your equipment. List items, note their weights, and even add images for a comprehensive packing list.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M22 10a3 3 0 0 0-3-3h-2.26a2.5 2.5 0 0 0-4.48-1.95A2.5 2.5 0 0 0 8 7.55c-.14.02-.28.05-.42.1H4.5a3 3 0 0 0-3 3c0 1 .5 1.84 1.2 2.4C3.6 13.6 4.68 14 6.5 14h1.65"/><path d="m12 15.5 1.55.37a0.5 0.5 0 0 0 .6-.37l.37-1.55a0.5 0.5 0 0 1 .37-.6l1.55-.37a0.5 0.5 0 0 1 .6.37l.37 1.55a0.5 0.5 0 0 0 .37.6l1.55.37a0.5 0.5 0 0 0 .37-.6l-.37-1.55a0.5 0.5 0 0 1-.37-.6l-1.55-.37a0.5 0.5 0 0 1-.6.37l-1.55.37a0.5 0.5 0 0 0-.37.6l.37 1.55a0.5 0.5 0 0 1 .37.6Z"/></svg>
              </div>
              <CardTitle className="text-2xl font-headline text-center text-primary">AI Weather Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-foreground/70">
                Get AI-powered weather forecasts for crucial points along your route, such as campsites and areas with significant elevation changes.
              </CardDescription>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-primary/80 text-primary-foreground/80 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Touring Wheels. Ride on!</p>
      </footer>
    </div>
  );
}
