"use client";

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { BikeModel } from "@/lib/types";
import {
  Bike as BikeIcon,
  Edit3,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const initialMockBikes: BikeModel[] = [
  {
    id: "b1",
    name: "Road Warrior",
    brand: "Specialized",
    model: "Tarmac SL7",
    year: "2022",
    imageUrl: "https://placehold.co/300x200.png?text=Road+Bike",
    notes: "My primary road bike, great for climbs.",
  },
  {
    id: "b2",
    name: "Gravel Grinder",
    brand: "Cannondale",
    model: "Topstone Carbon",
    year: "2021",
    imageUrl: "https://placehold.co/300x200.png?text=Gravel+Bike",
    notes: "Versatile for mixed terrain tours.",
  },
  {
    id: "b3",
    name: "Old Trusty Tourer",
    brand: "Surly",
    model: "Disc Trucker",
    year: "2018",
    notes: "Steel frame, built for long hauls.",
  },
];

export default function BikesPage() {
  const [bikeModels, setBikeModels] = useState<BikeModel[]>(initialMockBikes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<BikeModel | null>(null);

  const [bikeName, setBikeName] = useState("");
  const [bikeBrand, setBikeBrand] = useState("");
  const [bikeModel, setBikeModelInput] = useState(""); // Renamed to avoid conflict with BikeModel type
  const [bikeYear, setBikeYear] = useState("");
  const [bikeImage, setBikeImage] = useState<string | null>(null);
  const [bikeNotes, setBikeNotes] = useState("");
  const [bikeImageFile, setBikeImageFile] = useState<File | null>(null);

  const { toast } = useToast();

  const resetForm = () => {
    setBikeName("");
    setBikeBrand("");
    setBikeModelInput("");
    setBikeYear("");
    setBikeImage(null);
    setBikeNotes("");
    setBikeImageFile(null);
    setEditingBike(null);
  };

  const handleOpenModal = (bike?: BikeModel) => {
    if (bike) {
      setEditingBike(bike);
      setBikeName(bike.name);
      setBikeBrand(bike.brand || "");
      setBikeModelInput(bike.model || "");
      setBikeYear(bike.year || "");
      setBikeImage(bike.imageUrl || null);
      setBikeNotes(bike.notes || "");
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (imageDataUrl: string, file: File) => {
    setBikeImage(imageDataUrl);
    setBikeImageFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bikeName) {
      toast({
        title: "Missing Fields",
        description: "Bike name is required.",
        variant: "destructive",
      });
      return;
    }

    const currentBike: BikeModel = {
      id: editingBike
        ? editingBike.id
        : Math.random().toString(36).substring(7),
      name: bikeName,
      brand: bikeBrand,
      model: bikeModel,
      year: bikeYear,
      notes: bikeNotes,
      imageUrl:
        bikeImage ||
        (bikeImageFile ? URL.createObjectURL(bikeImageFile) : undefined),
    };

    if (editingBike) {
      setBikeModels(
        bikeModels.map((item) =>
          item.id === editingBike.id ? currentBike : item
        )
      );
      toast({
        title: "Bike Model Updated",
        description: `${currentBike.name} has been updated.`,
      });
    } else {
      setBikeModels([...bikeModels, currentBike]);
      toast({
        title: "Bike Model Added",
        description: `${currentBike.name} has been added to your collection.`,
      });
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (bikeId: string) => {
    setBikeModels(bikeModels.filter((item) => item.id !== bikeId));
    toast({ title: "Bike Model Deleted" });
  };

  return (
    <div className="container-default">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary font-headline">
          My Bikes
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Bike
        </Button>
      </div>

      {bikeModels.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">
              Your Bike Collection is Empty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-muted-foreground mb-6">
              Add your bikes to keep track of your trusty steeds.
            </CardDescription>
            <Button size="lg" onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Bike
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bikeModels.map((bike) => (
            <Card
              key={bike.id}
              className="flex flex-col transition-shadow duration-300"
            >
              <CardHeader className="relative p-0">
                {bike.imageUrl ? (
                  <Image
                    src={bike.imageUrl}
                    alt={bike.name}
                    data-ai-hint="bicycle bike"
                    width={300}
                    height={200}
                    className="object-cover w-full h-24 rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-24 rounded-t-lg bg-secondary flex items-center justify-center">
                    <BikeIcon className="w-16 h-16 text-secondary-foreground/50" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow pt-4">
                <CardTitle className="text-lg font-headline text-primary mb-1">
                  {bike.name}
                </CardTitle>
                <div className="text-sm text-muted-foreground mb-1">
                  {bike.brand || "N/A Brand"} - {bike.model || "N/A Model"} (
                  {bike.year || "N/A Year"})
                </div>
                <p className="text-xs text-foreground/80 line-clamp-3">
                  {bike.notes || "No additional notes."}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => handleOpenModal(bike)}
                >
                  <Edit3 className="h-4 w-4" />{" "}
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(bike.id)}
                >
                  <Trash2 className="h-4 w-4" />{" "}
                  <span className="sr-only">Delete</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">
                {editingBike ? "Edit Bike Model" : "Add New Bike Model"}
              </DialogTitle>
              <DialogDescription>
                {editingBike
                  ? "Update the details for this bike."
                  : "Fill in the details for your new bike."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bikeName" className="text-right">
                  Name*
                </Label>
                <Input
                  id="bikeName"
                  value={bikeName}
                  onChange={(e) => setBikeName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., My Speedy Tourer"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bikeBrand" className="text-right">
                  Brand
                </Label>
                <Input
                  id="bikeBrand"
                  value={bikeBrand}
                  onChange={(e) => setBikeBrand(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Specialized"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bikeModelInput" className="text-right">
                  Model
                </Label>
                <Input
                  id="bikeModelInput"
                  value={bikeModel}
                  onChange={(e) => setBikeModelInput(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Roubaix Comp"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bikeYear" className="text-right">
                  Year
                </Label>
                <Input
                  id="bikeYear"
                  value={bikeYear}
                  onChange={(e) => setBikeYear(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., 2023"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="bikeNotes" className="text-right pt-1">
                  Notes
                </Label>
                <Textarea
                  id="bikeNotes"
                  value={bikeNotes}
                  onChange={(e) => setBikeNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Upgraded wheels, favorite saddle"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Image</Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleImageUpload(reader.result as string, file);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-sm"
                  />
                  {bikeImage && (
                    <Image
                      src={bikeImage}
                      alt="Preview"
                      data-ai-hint="bike preview"
                      width={100}
                      height={100}
                      className="rounded border object-contain"
                    />
                  )}
                  {!bikeImage && (
                    <div className="w-24 h-24 rounded border bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                {editingBike ? "Save Changes" : "Add Bike"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
