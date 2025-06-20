import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { GearItem, Trip } from "@/lib/types";
import {
  ListChecks,
  Loader2,
  Package,
  PackageCheck,
  PackagePlus,
  Tag,
  Weight,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface TripGearSectionProps {
  trip: Trip;
  allGearLibrary: GearItem[];
  isLoadingGear: boolean;
  isSavingGear: boolean;
  currentSelectedGearIds: string[];
  currentPackedItems: Record<string, string[]>;
  handleToggleGearItemSelection: (gearId: string) => void;
  handlePackItem: (itemIdToPack: string, containerId: string) => void;
  handleUnpackItem: (itemIdToUnpack: string, containerId?: string) => void;
  handleSaveGearSelections: () => Promise<void>;
  gearSelectionChanged: boolean;
}

export function TripGearSection({
  trip,
  allGearLibrary,
  isLoadingGear,
  isSavingGear,
  currentSelectedGearIds,
  currentPackedItems,
  handleToggleGearItemSelection,
  handlePackItem,
  handleUnpackItem,
  handleSaveGearSelections,
  gearSelectionChanged,
}: TripGearSectionProps) {
  const [isAddGearModalOpen, setIsAddGearModalOpen] = useState(false);

  const selectedGearDetails = useMemo(() => {
    return allGearLibrary.filter((item) =>
      currentSelectedGearIds.includes(item.id)
    );
  }, [allGearLibrary, currentSelectedGearIds]);

  const totalSelectedGearWeight = useMemo(() => {
    return selectedGearDetails.reduce((total, item) => total + item.weight, 0);
  }, [selectedGearDetails]);

  const { topLevelSelectedItems, looseSelectedItems } = useMemo(() => {
    const packedItemIds = new Set(Object.values(currentPackedItems).flat());
    const topLevelItems = selectedGearDetails.filter(
      (item) => !packedItemIds.has(item.id) || item.itemType === "container"
    );
    const looseItems = topLevelItems.filter(
      (item) => item.itemType !== "container"
    );
    return {
      topLevelSelectedItems: topLevelItems,
      looseSelectedItems: looseItems,
    };
  }, [selectedGearDetails, currentPackedItems]);

  const groupedAvailableGear = useMemo(() => {
    const groups: Record<string, GearItem[]> = {};
    allGearLibrary.forEach((item) => {
      const category = item.category || "Miscellaneous";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    for (const category in groups)
      groups[category].sort((a, b) => a.name.localeCompare(b.name));
    return groups;
  }, [allGearLibrary]);

  const sortedAvailableCategories = useMemo(() => {
    return Object.keys(groupedAvailableGear).sort((a, b) => {
      if (a === "Miscellaneous") return 1;
      if (b === "Miscellaneous") return -1;
      return a.localeCompare(b);
    });
  }, [groupedAvailableGear]);

  const renderAvailableGearDialogContent = () => {
    if (isLoadingGear) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading gear library...</p>
        </div>
      );
    }
    if (allGearLibrary.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-10">
          No gear items available in your library.{" "}
          <Link href="/gear" className="text-accent hover:underline">
            Add gear to your library
          </Link>
          .
        </p>
      );
    }
    return (
      <ScrollArea className="flex-grow min-h-0 h-[50vh] border rounded-md bg-muted/20">
        <Accordion
          type="multiple"
          defaultValue={sortedAvailableCategories.map((cat) => `${cat}-dialog`)}
          className="w-full space-y-2 p-2"
        >
          {sortedAvailableCategories.map((category) => (
            <AccordionItem
              value={`${category}-dialog`}
              key={`available-${category}-dialog`}
              className="border bg-background rounded-md"
            >
              <AccordionTrigger className="px-4 py-3 text-base font-medium text-primary hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {category} ({groupedAvailableGear[category].length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <div className="space-y-2">
                  {groupedAvailableGear[category].map((item) => (
                    <div
                      key={`${item.id}-dialog`}
                      className="flex items-center space-x-3 p-2 bg-card rounded-md hover:bg-card/80"
                    >
                      <Checkbox
                        id={`gear-select-${item.id}-dialog`}
                        checked={currentSelectedGearIds.includes(item.id)}
                        onCheckedChange={() =>
                          handleToggleGearItemSelection(item.id)
                        }
                        aria-label={`Select ${item.name}`}
                      />
                      <div className="flex-shrink-0 w-10 h-10">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            data-ai-hint={item["data-ai-hint"] || "gear"}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                            {item.itemType === "container" ? (
                              <PackageCheck className="h-5 w-5 text-secondary-foreground" />
                            ) : (
                              <ListChecks className="h-5 w-5 text-secondary-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                      <Label
                        htmlFor={`gear-select-${item.id}-dialog`}
                        className="flex-grow cursor-pointer"
                      >
                        <span className="font-medium text-foreground">
                          {item.name} {item.itemType === "container" && "(Bag)"}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {item.weight}g - {item.notes || "No notes"}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    );
  };

  const renderSelectedGearContent = () => {
    return (
      <div>
        <ScrollArea className="h-[300px] md:h-[500px]">
          {selectedGearDetails.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground text-center">
                No gear selected.
                <br />
                Click "Add/Remove Gear" to add items.
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={topLevelSelectedItems
                .filter((i) => i.itemType === "container")
                .map((i) => i.id)
                .concat(
                  looseSelectedItems.length > 0 ? ["loose-items-selected"] : []
                )}
            >
              {topLevelSelectedItems
                .filter((item) => item.itemType === "container")
                .map((containerItem) => (
                  <AccordionItem
                    value={containerItem.id}
                    key={`container-${containerItem.id}-selected`}
                    className="border-b-0 mb-1"
                  >
                    <Card className="bg-card/50">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          <Package className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-primary">
                            {containerItem.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto mr-2">
                            ({currentPackedItems[containerItem.id]?.length || 0}{" "}
                            items /{" "}
                            {currentPackedItems[containerItem.id]?.reduce(
                              (acc, packedId) =>
                                acc +
                                (allGearLibrary.find((g) => g.id === packedId)
                                  ?.weight || 0),
                              0
                            ) || 0}
                            g)
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-4 pb-3 pt-1">
                        <div className="space-y-2 py-2">
                          {(currentPackedItems[containerItem.id] || []).map(
                            (packedItemId) => {
                              const packedItem = allGearLibrary.find(
                                (g) => g.id === packedItemId
                              );
                              if (!packedItem) return null;
                              return (
                                <Card
                                  key={`${packedItemId}-${containerItem.id}-selected-packed`}
                                  className="p-3 shadow-none bg-background/50"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      {packedItem.imageUrl ? (
                                        <Image
                                          src={packedItem.imageUrl}
                                          alt={packedItem.name}
                                          data-ai-hint={
                                            packedItem["data-ai-hint"] ||
                                            "bicycle gear"
                                          }
                                          width={32}
                                          height={32}
                                          className="rounded object-cover"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                                          <ListChecks className="h-4 w-4 text-secondary-foreground" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-medium text-primary text-sm">
                                          {packedItem.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center">
                                          <Weight className="mr-1 h-3 w-3" />
                                          {packedItem.weight}g
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      onClick={() =>
                                        handleUnpackItem(
                                          packedItemId,
                                          containerItem.id
                                        )
                                      }
                                    >
                                      <XCircle size={16} />{" "}
                                      <span className="sr-only">Unpack</span>
                                    </Button>
                                  </div>
                                </Card>
                              );
                            }
                          )}
                          {(!currentPackedItems[containerItem.id] ||
                            currentPackedItems[containerItem.id].length ===
                              0) && (
                            <p className="text-xs text-muted-foreground italic py-1">
                              Bag is empty.
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}

              {looseSelectedItems.length > 0 && (
                <AccordionItem
                  value="loose-items-selected"
                  className="border-b-0"
                >
                  <Card className="mt-2">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/30 rounded-t-md">
                      <div className="flex items-center gap-3 w-full">
                        <ListChecks className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-muted-foreground">
                          Loose / Unpacked Items
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto mr-2">
                          ({looseSelectedItems.length} items)
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-3 pt-2">
                      <div className="space-y-2">
                        {looseSelectedItems.map((item, i) => (
                          <Card
                            key={`loose-${item.id}-${i}selected`}
                            className="p-3 shadow-none bg-background/50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    data-ai-hint={
                                      item["data-ai-hint"] || "bicycle gear"
                                    }
                                    width={32}
                                    height={32}
                                    className="rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                                    <ListChecks className="h-4 w-4 text-secondary-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-primary text-sm">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <Weight className="mr-1 h-3 w-3" />
                                    {item.weight}g
                                  </p>
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2"
                                  >
                                    <PackagePlus size={16} className="mr-1.5" />{" "}
                                    Pack In...
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {selectedGearDetails.filter(
                                    (g) =>
                                      g.itemType === "container" &&
                                      g.id !== item.id
                                  ).length > 0 ? (
                                    selectedGearDetails
                                      .filter(
                                        (g) =>
                                          g.itemType === "container" &&
                                          g.id !== item.id
                                      )
                                      .map((container) => (
                                        <DropdownMenuItem
                                          key={`pack-into-${container.id}-selected`}
                                          onClick={() =>
                                            handlePackItem(
                                              item.id,
                                              container.id
                                            )
                                          }
                                        >
                                          <Package size={14} className="mr-2" />{" "}
                                          {container.name}
                                        </DropdownMenuItem>
                                      ))
                                  ) : (
                                    <DropdownMenuItem disabled>
                                      No available bags
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}
            </Accordion>
          )}
        </ScrollArea>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardTitle className="font-headline">
            Gear List for {trip.name}
          </CardTitle>
          <CardDescription>
            Manage equipment for this trip. Total weight:{" "}
            {(totalSelectedGearWeight / 1000).toFixed(2)} kg
          </CardDescription>
        </div>
        {gearSelectionChanged && (
          <Button
            onClick={handleSaveGearSelections}
            disabled={isSavingGear}
          >
            {isSavingGear && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Gear Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Dialog
          open={isAddGearModalOpen}
          onOpenChange={setIsAddGearModalOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <PackagePlus className="mr-2 h-4 w-4" />
              Add/Remove Gear
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Available Gear Library</DialogTitle>
              <DialogDescription>
                Select items to add or remove them from your trip's gear list.
              </DialogDescription>
            </DialogHeader>
            {renderAvailableGearDialogContent()}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {renderSelectedGearContent()}
      </div>
    </div>
  );
}