// Shared TypeScript types for HomesteadHub

export type RecurrenceInterval =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type ResourceType = "water" | "fuel" | "seeds" | "feed" | "other";

export type LivestockType =
  | "chicken"
  | "duck"
  | "goose"
  | "turkey"
  | "cow"
  | "pig"
  | "goat"
  | "sheep"
  | "horse"
  | "rabbit"
  | "bee"
  | "other";

export type EquipmentCategory =
  | "tractor"
  | "mower"
  | "tiller"
  | "chainsaw"
  | "generator"
  | "pump"
  | "vehicle"
  | "tool"
  | "other";

export type StorageCategory =
  | "grains"
  | "legumes"
  | "canned"
  | "freeze-dried"
  | "dehydrated"
  | "frozen"
  | "fresh"
  | "water"
  | "other";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
