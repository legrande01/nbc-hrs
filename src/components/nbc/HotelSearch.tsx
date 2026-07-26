import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchTrustIndicators } from "@/lib/nbc-content";
import { cn } from "@/lib/utils";

export interface HotelSearchValue {
  destination: string;
  checkIn?: Date;
  checkOut?: Date;
  guests: string;
  rooms: string;
}

interface HotelSearchProps {
  onSearch?: (value: HotelSearchValue) => void;
  className?: string;
  showTrustIndicators?: boolean;
  /** Pre-fills the form, e.g. when editing an existing search. */
  defaultValue?: Partial<HotelSearchValue>;
  submitLabel?: string;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="nbc-eyebrow text-[0.625rem] text-muted-foreground">
      {children}
    </Label>
  );
}

/**
 * Reusable hotel search widget.
 * Presentation only — search execution is delegated through onSearch.
 */
export function HotelSearch({
  onSearch,
  className,
  showTrustIndicators = true,
  defaultValue,
  submitLabel = "Search",
}: HotelSearchProps) {
  const [destination, setDestination] = useState(defaultValue?.destination ?? "");
  const [checkIn, setCheckIn] = useState<Date | undefined>(defaultValue?.checkIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(defaultValue?.checkOut);
  const [guests, setGuests] = useState(defaultValue?.guests ?? "2");
  const [rooms, setRooms] = useState(defaultValue?.rooms ?? "1");

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch?.({ destination, checkIn, checkOut, guests, rooms });
        }}
        className="rounded-2xl border border-border/50 bg-background/97 p-5 shadow-elevated ring-1 ring-nbc-royal/5 backdrop-blur-md sm:p-7 lg:p-8"
      >
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr_1fr_0.9fr_0.8fr_auto] lg:items-end">
          <div className="grid min-w-0 gap-2">
            <FieldLabel htmlFor="destination">Destination</FieldLabel>
            <div className="relative">
              <MapPin
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="destination"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Where would you like to stay?"
                className="h-13 pl-9 text-base"
              />
            </div>
          </div>

          <div className="grid min-w-0 gap-2">
            <FieldLabel htmlFor="check-in">Check-in</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="check-in"
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-13 w-full justify-start gap-2 text-base font-normal",
                    !checkIn && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon aria-hidden="true" />
                  <span className="truncate">{checkIn ? format(checkIn, "dd MMM yyyy") : "Add date"}</span>
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
            <FieldLabel htmlFor="check-out">Check-out</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="check-out"
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
            <FieldLabel htmlFor="guests">Guests</FieldLabel>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger id="guests" className="h-13 text-base">
                <Users aria-hidden="true" className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4", "5", "6"].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value} {value === "1" ? "guest" : "guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid min-w-0 gap-2">
            <FieldLabel htmlFor="rooms">Rooms</FieldLabel>
            <Select value={rooms} onValueChange={setRooms}>
              <SelectTrigger id="rooms" className="h-13 text-base">
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

          <Button type="submit" variant="scarlet" size="xl" className="h-13 w-full gap-2 px-10 text-base shadow-card lg:w-auto">
            <Search aria-hidden="true" />
            {submitLabel}
          </Button>
        </div>
      </form>

      {showTrustIndicators && (
        <ul className="mt-7 grid gap-3 sm:grid-cols-3">
          {searchTrustIndicators.map(({ id, label, icon: Icon }) => (
            <li key={id} className="flex min-w-0 items-center gap-2.5 text-primary-foreground">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-nbc-gold" />
              <span className="truncate text-sm">{label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
