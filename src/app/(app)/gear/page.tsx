"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Edit3, ListChecks, Weight, Image as ImageIcon } from "lucide-react";
import type { GearItem } from "@/lib/types";
import { GpxUpload } from "@/components/map/gpx-upload"; // Re-using for image upload concept
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image'; // For displaying images
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";


const initialMockGear: GearItem[] = [
  { id: "g1", name: "2-Person Tent", weight: 2200, imageUrl: "https://placehold.co/150x150.png?text=Tent", notes: "MSR Hubba Hubba NX" },
  { id: "g2", name: "Down Sleeping Bag (-5C)", weight: 950, imageUrl: "https://placehold.co/150x150.png?text=Bag", notes: "Rab Ascent 500" },
  { id: "g3", name: "Bike Multi-tool", weight: 180, notes: "Crankbrothers M19" },
  { id: "g4", name: "Water Filter", weight: 300, imageUrl: "https://placehold.co/150x150.png?text=Filter", notes: "Sawyer Squeeze" },
];

export default function GearPage() {
  const [gearItems, setGearItems] = useState<GearItem[]>(initialMockGear);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);
  
  const [itemName, setItemName] = useState("");
  const [itemWeight, setItemWeight] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);

  const { toast } = useToast();

  const resetForm = () => {
    setItemName("");
    setItemWeight("");
    setItemNotes("");
    setItemImage(null);
    setItemImageFile(null);
    setEditingItem(null);
  };

  const handleOpenModal = (item?: GearItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemWeight(item.weight.toString());
      setItemNotes(item.notes || "");
      setItemImage(item.imageUrl || null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (imageDataUrl: string, file: File) => {
    setItemImage(imageDataUrl); // For preview
    setItemImageFile(file); // For actual upload
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemWeight) {
        toast({title: "Missing Fields", description: "Name and weight are required.", variant: "destructive"});
        return;
    }
    const weightNum = parseFloat(itemWeight);
    if (isNaN(weightNum) || weightNum <=0) {
        toast({title: "Invalid Weight", description: "Weight must be a positive number.", variant: "destructive"});
        return;
    }

    const newItem: GearItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substring(7),
      name: itemName,
      weight: weightNum,
      notes: itemNotes,
      // In a real app, itemImageFile would be uploaded and itemImage would be the URL
      imageUrl: itemImage || (itemImageFile ? URL.createObjectURL(itemImageFile) : undefined), 
    };

    if (editingItem) {
      setGearItems(gearItems.map(item => item.id === editingItem.id ? newItem : item));
      toast({title: "Gear Item Updated", description: `${newItem.name} has been updated.`});
    } else {
      setGearItems([...gearItems, newItem]);
      toast({title: "Gear Item Added", description: `${newItem.name} has been added to your library.`});
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (itemId: string) => {
    setGearItems(gearItems.filter(item => item.id !== itemId));
    toast({title: "Gear Item Deleted"});
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary font-headline">Gear Library</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Gear
        </Button>
      </div>

      {gearItems.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
          <CardHeader><CardTitle className="text-2xl font-headline text-primary">Your Gear Library is Empty</CardTitle></CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-muted-foreground mb-6">
              Add your touring equipment to easily manage packing lists for your trips.
            </CardDescription>
            <Button size="lg" onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Gear Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gearItems.map((item) => (
            <Card key={item.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="relative p-0">
                {item.imageUrl ? (
                   <Image src={item.imageUrl} alt={item.name} data-ai-hint="bicycle equipment" width={300} height={200} className="object-cover w-full h-48 rounded-t-lg" />
                ) : (
                  <div className="w-full h-48 rounded-t-lg bg-secondary flex items-center justify-center">
                    <ListChecks className="w-16 h-16 text-secondary-foreground/50" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow pt-4">
                <CardTitle className="text-lg font-headline text-primary mb-1">{item.name}</CardTitle>
                <div className="text-sm text-muted-foreground flex items-center mb-2">
                  <Weight className="mr-1.5 h-4 w-4" /> {item.weight}g
                </div>
                <p className="text-xs text-foreground/80 line-clamp-3">
                  {item.notes || "No additional notes."}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleOpenModal(item)}>
                  <Edit3 className="h-4 w-4" /> <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" /> <span className="sr-only">Delete</span>
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
              <DialogTitle className="font-headline text-2xl">{editingItem ? "Edit Gear Item" : "Add New Gear Item"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update the details for this gear item." : "Fill in the details for your new piece of gear."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemName" className="text-right">Name</Label>
                <Input id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} className="col-span-3" placeholder="e.g., Waterproof Panniers" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemWeight" className="text-right">Weight (g)</Label>
                <Input id="itemWeight" type="number" value={itemWeight} onChange={e => setItemWeight(e.target.value)} className="col-span-3" placeholder="e.g., 1200" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemNotes" className="text-right">Notes</Label>
                <Input id="itemNotes" value={itemNotes} onChange={e => setItemNotes(e.target.value)} className="col-span-3" placeholder="e.g., Brand, capacity, features" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Image</Label>
                <div className="col-span-3 space-y-2">
                  {/* Simplified image upload - using GpxUpload component structure for concept */}
                  <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            handleImageUpload(reader.result as string, file);
                        };
                        reader.readAsDataURL(file);
                      }
                  }} className="text-sm"/>
                  {itemImage && <Image src={itemImage} alt="Preview" data-ai-hint="gear preview" width={100} height={100} className="rounded border object-contain" />}
                  {!itemImage && <div className="w-24 h-24 rounded border bg-muted flex items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8"/></div>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingItem ? "Save Changes" : "Add Item"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
