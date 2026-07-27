import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomSelectionSearch } from "@/lib/nbc-room-selection";
import { cn } from "@/lib/utils";

interface AvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValue: RoomSelectionSearch;
  onConfirm: (value: RoomSelectionSearch) => void;
}

function toDate(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="nbc-eyebrow text-[0.625rem] text-muted-foreground">
      {children}
    </Label>
  );
}

/**
 * Availability gate shown on Hotel Details before a guest enters Room Selection.
 * Collects the stay context only — it never renders availability results.
 */
export function AvailabilityModal({
  open,
  onOpenChange,
  defaultValue,
  onConfirm,
}: AvailabilityModalProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(toDate(defaultValue.checkIn));
  const [checkOut, setCheckOut] = useState<Date | undefined>(toDate(defaultValue.checkOut));
  const [adults, setAdults] = useState(String(defaultValue.adults));
  const [children, setChildren] = useState(String(defaultValue.children));
  const [rooms, setRooms] = useState(String(defaultValue.rooms));

  // Re-seed from the URL context each time the guest reopens the modal.
  useEffect(() => {
    if (!open) return;
    setCheckIn(toDate(defaultValue.checkIn));
    setCheckOut(toDate(defaultValue.checkOut));
    setAdults(String(defaultValue.adults));
    setChildren(String(defaultValue.children));
    setRooms(String(defaultValue.rooms));
  }, [open, defaultValue]);

  const valid =
    Boolean(checkIn && checkOut && checkOut > checkIn) && Number(adults) >= 1 && Number(rooms) >= 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Choose your stay dates
          </DialogTitle>
          <DialogDescription>
            Select your travel dates and guests to view available rooms.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!valid) return;
            onConfirm({
              checkIn: format(checkIn!, "yyyy-MM-dd"),
              checkOut: format(checkOut!, "yyyy-MM-dd"),
              adults: Number(adults),
              children: Number(children),
              rooms: Number(rooms),
            });
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid min-w-0 gap-2">
              <FieldLabel htmlFor="availability-check-in">Check-in</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="availability-check-in"
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-13 w-full justify-start gap-2 text-base font-normal",
                      !checkIn && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon aria-hidden="true" />
                    <span className="truncate">
                      {checkIn ? format(checkIn, "dd MMM yyyy") : "Add date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid min-w-0 gap-2">
              <FieldLabel htmlFor="availability-check-out">Check-out</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="availability-check-out"
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-13 w-full justify-start gap-2 text-base font-normal",
                      !checkOut && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon aria-hidden="true" />
                    <span className="truncate">
                      {checkOut ? format(checkOut, "dd MMM yyyy") : "Add date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={checkIn ? { before: checkIn } : undefined}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="grid min-w-0 gap-2">
              <FieldLabel htmlFor="availability-adults">Adults</FieldLabel>
              <Select value={adults} onValueChange={setAdults}>
                <SelectTrigger id="availability-adults" className="h-13 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6"].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value} {value === "1" ? "adult" : "adults"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid min-w-0 gap-2">
              <FieldLabel htmlFor="availability-children">Children</FieldLabel>
              <Select value={children} onValueChange={setChildren}>
                <SelectTrigger id="availability-children" className="h-13 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["0", "1", "2", "3", "4"].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value} {value === "1" ? "child" : "children"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid min-w-0 gap-2">
              <FieldLabel htmlFor="availability-rooms">Rooms</FieldLabel>
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger id="availability-rooms" className="h-13 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4"].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value} {value === "1" ? "room" : "rooms"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              variant="scarlet"
              size="xl"
              disabled={!valid}
              className="w-full gap-2 sm:w-auto"
            >
              <Search aria-hidden="true" />
              View Available Rooms
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
