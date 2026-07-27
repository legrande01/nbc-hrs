import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

interface AvailabilityPanelProps {
  hotelName: string;
  defaultValue: RoomSelectionSearch;
  onCheck: (value: RoomSelectionSearch) => void;
  className?: string;
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
 * Lightweight availability check shown when a guest reaches Room Selection
 * without a completed availability search. Room categories stay hidden until
 * valid dates are supplied.
 */
export function AvailabilityPanel({
  hotelName,
  defaultValue,
  onCheck,
  className,
}: AvailabilityPanelProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(toDate(defaultValue.checkIn));
  const [checkOut, setCheckOut] = useState<Date | undefined>(toDate(defaultValue.checkOut));
  const [adults, setAdults] = useState(String(defaultValue.adults));
  const [children, setChildren] = useState(String(defaultValue.children));
  const [rooms, setRooms] = useState(String(defaultValue.rooms));

  const valid = Boolean(checkIn && checkOut && checkOut > checkIn);

  return (
    <form
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-6 shadow-card lg:p-8",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid) return;
        onCheck({
          checkIn: format(checkIn!, "yyyy-MM-dd"),
          checkOut: format(checkOut!, "yyyy-MM-dd"),
          adults: Number(adults),
          children: Number(children),
          rooms: Number(rooms),
        });
      }}
    >
      <p className="nbc-eyebrow text-nbc-scarlet">Check Availability</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        Tell us about your stay
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Add your dates and party size to see live room availability and pricing at {hotelName}.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end">
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

        <Button
          type="submit"
          variant="scarlet"
          size="xl"
          disabled={!valid}
          className="h-13 w-full gap-2 px-8 text-base lg:w-auto"
        >
          <Search aria-hidden="true" />
          Check Availability
        </Button>
      </div>
    </form>
  );
}
