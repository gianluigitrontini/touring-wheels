"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Trash2,
  Edit3,
  ListChecks,
  Weight,
  Image as ImageIcon,
  Loader2,
  Package,
  PackageCheck,
  Tag,
} from "lucide-react";
import type { GearItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getGearItemsAction,
  addGearItemAction,
  updateGearItemAction,
  deleteGearItemAction,
} from "@/lib/actions";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GearPage() {
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);

  const [itemName, setItemName] = useState("");
  const [itemWeight, setItemWeight] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemType, setItemType] = useState<"item" | "container">("item");
  const [itemCategory, setItemCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemAiHint, setItemAiHint] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const fetchGear = async () => {
      setIsLoading(true);
      try {
        const fetchedGear = await getGearItemsAction();
        setGearItems(fetchedGear);
      } catch (error) {
        console.error("Failed to fetch gear items:", error);
        toast({
          title: "Error Fetching Gear",
          description: "Could not load your gear library.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGear();
  }, [toast]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(
      gearItems.map((item) => item.category).filter(Boolean) as string[]
    );
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [gearItems]);

  const resetForm = () => {
    setItemName("");
    setItemWeight("");
    setItemNotes("");
    setItemImage(null);
    setItemImageFile(null);
    setEditingItem(null);
    setItemType("item");
    setItemCategory("");
    setNewCategoryName("");
    setItemAiHint("");
  };

  const handleOpenModal = (item?: GearItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemWeight(item.weight.toString());
      setItemNotes(item.notes || "");
      setItemImage(item.imageUrl || null);
      setItemType(item.itemType || "item");
      setItemCategory(item.category || "");
      setNewCategoryName("");
      setItemAiHint(item["data-ai-hint"] || "");
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (imageDataUrl: string, file: File) => {
    setItemImage(imageDataUrl);
    setItemImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemWeight) {
      toast({
        title: "Missing Fields",
        description: "Name and weight are required.",
        variant: "destructive",
      });
      return;
    }
    const weightNum = parseFloat(itemWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Weight must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    const finalCategory =
      newCategoryName.trim() || itemCategory || "Miscellaneous";

    const gearData: Omit<GearItem, "id"> = {
      name: itemName,
      weight: weightNum,
      notes: itemNotes,
      imageUrl:
        itemImage ||
        (itemImageFile ? URL.createObjectURL(itemImageFile) : undefined),
      itemType: itemType,
      category: finalCategory,
      "data-ai-hint":
        itemAiHint || itemName.toLowerCase().split(" ").slice(0, 2).join(" "),
    };

    try {
      if (editingItem) {
        const updated = await updateGearItemAction(editingItem.id, gearData);
        if (updated) {
          setGearItems(
            gearItems.map((item) =>
              item.id === editingItem.id ? updated : item
            )
          );
          toast({
            title: "Gear Item Updated",
            description: `${updated.name} has been updated.`,
          });
        } else {
          toast({
            title: "Update Failed",
            description: "Could not update the item.",
            variant: "destructive",
          });
        }
      } else {
        const added = await addGearItemAction(gearData);
        setGearItems([...gearItems, added]);
        toast({
          title: "Gear Item Added",
          description: `${added.name} has been added to your library.`,
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save gear item:", error);
      toast({
        title: "Save Error",
        description: "Could not save the gear item.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const success = await deleteGearItemAction(itemId);
      if (success) {
        setGearItems(gearItems.filter((item) => item.id !== itemId));
        toast({ title: "Gear Item Deleted" });
      } else {
        toast({
          title: "Delete Failed",
          description: "Could not delete the item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete gear item:", error);
      toast({
        title: "Delete Error",
        description: "Could not delete the gear item.",
        variant: "destructive",
      });
    }
  };

  const groupedGearItems = useMemo(() => {
    const groups: Record<string, GearItem[]> = {};
    gearItems.forEach((item) => {
      const category = item.category || "Miscellaneous";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    // Sort items within each category by name
    for (const category in groups) {
      groups[category].sort((a, b) => a.name.localeCompare(b.name));
    }
    return groups;
  }, [gearItems]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedGearItems).sort((a, b) => {
      if (a === "Miscellaneous") return 1; // Always sort Miscellaneous last
      if (b === "Miscellaneous") return -1;
      return a.localeCompare(b);
    });
  }, [groupedGearItems]);

  if (isLoading) {
    return (
      <div className="container-default flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">
          Loading gear library...
        </p>
      </div>
    );
  }

  return (
    <div className="container-default">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary font-headline">
          Gear Library
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Gear
        </Button>
      </div>

      {gearItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">
              Your Gear Library is Empty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-muted-foreground mb-6">
              Add your touring equipment to easily manage packing lists for your
              trips.
            </CardDescription>
            <Button size="lg" onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Gear Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={sortedCategories}
          className="w-full space-y-4"
        >
          {sortedCategories.map((category) => (
            <AccordionItem
              value={category}
              key={category}
              className="border bg-card rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 text-xl font-headline text-primary hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {category} ({groupedGearItems[category].length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedGearItems[category].map((item) => (
                    <Card
                      key={item.id}
                      className="flex flex-col transition-shadow duration-200"
                    >
                      <CardHeader className="relative p-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            data-ai-hint={
                              item["data-ai-hint"] || "bicycle equipment"
                            }
                            width={300}
                            height={200}
                            className="object-cover w-full h-24 rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-24 rounded-t-lg bg-secondary flex items-center justify-center">
                            {item.itemType === "container" ? (
                              <PackageCheck className="w-16 h-16 text-secondary-foreground/50" />
                            ) : (
                              <ListChecks className="w-16 h-16 text-secondary-foreground/50" />
                            )}
                          </div>
                        )}
                        {item.itemType === "container" && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1">
                            <Package size={14} /> Bag
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="flex-grow pt-4">
                        <CardTitle className="text-lg font-headline text-primary mb-1">
                          {item.name}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center mb-2">
                          <Weight className="mr-1.5 h-4 w-4" /> {item.weight}g
                        </div>
                        <p className="text-xs text-foreground/80 line-clamp-3">
                          {item.notes || "No additional notes."}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenModal(item)}
                        >
                          <Edit3 className="h-4 w-4" />{" "}
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />{" "}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">
                {editingItem ? "Edit Gear Item" : "Add New Gear Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the details for this gear item."
                  : "Fill in the details for your new piece of gear."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemName" className="text-right">
                  Name*
                </Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Waterproof Panniers"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemWeight" className="text-right">
                  Weight (g)*
                </Label>
                <Input
                  id="itemWeight"
                  type="number"
                  value={itemWeight}
                  onChange={(e) => setItemWeight(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., 1200"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="itemCategorySelect" className="text-right pt-2">
                  Category
                </Label>
                <div className="col-span-3 space-y-2">
                  <Select value={itemCategory} onValueChange={setItemCategory}>
                    <SelectTrigger id="itemCategorySelect" className="w-full">
                      <SelectValue placeholder="Select an existing category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Miscellaneous">
                        Miscellaneous
                      </SelectItem>
                      {uniqueCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pl-3">
                      Or,{" "}
                    </span>
                    <Input
                      id="newCategoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full pl-10"
                      placeholder="add new category"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemType" className="text-right">
                  Type
                </Label>
                <RadioGroup
                  value={itemType}
                  onValueChange={(value: "item" | "container") =>
                    setItemType(value)
                  }
                  className="col-span-3 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="item" id="type-item" />
                    <Label htmlFor="type-item" className="font-normal">
                      Regular Item
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="container" id="type-container" />
                    <Label htmlFor="type-container" className="font-normal">
                      Bag/Container
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="itemNotes" className="text-right pt-1">
                  Notes
                </Label>
                <Textarea
                  id="itemNotes"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Brand, capacity, features"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="itemAiHint" className="text-right pt-1">
                  AI Hint
                </Label>
                <Input
                  id="itemAiHint"
                  value={itemAiHint}
                  onChange={(e) => setItemAiHint(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., tent camping (for image search)"
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
                  {itemImage && (
                    <Image
                      src={itemImage}
                      alt="Preview"
                      data-ai-hint={`${itemAiHint || "gear"} preview`}
                      width={100}
                      height={100}
                      className="rounded border object-contain"
                    />
                  )}
                  {!itemImage && (
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
                {editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
