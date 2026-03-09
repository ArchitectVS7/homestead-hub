import { z } from "zod";

// ============================================
// STORAGE MODULE
// ============================================

export const CreateStorageItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    quantity: z.number().positive("Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    location: z.string().optional(),
    purchaseDate: z.date().optional(),
    expirationDate: z.date().optional(),
    calories: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
});

export const UpdateStorageItemSchema = CreateStorageItemSchema.partial();

// ============================================
// TASK MODULE
// ============================================

export const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    recurrenceRule: z.string().optional(),
    nextDue: z.date().optional(),
    estimatedMinutes: z.number().int().positive().optional(),
    assignedTo: z.string().optional(),
    notes: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const CompleteTaskSchema = z.object({
    duration: z.number().int().positive().optional(),
    notes: z.string().optional(),
});

// ============================================
// SETTINGS
// ============================================

export const UpdateSettingsSchema = z.object({
    hardinessZone: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    unitPreference: z.enum(["imperial", "metric"]).optional(),
    expirationWarningDays: z.number().int().positive().optional(),
    weatherAPIKey: z.string().optional(),
});

export const ChangePINSchema = z.object({
    currentPIN: z.string().min(4, "PIN must be at least 4 chars"),
    newPIN: z.string().min(4, "PIN must be at least 4 chars"),
    confirmNewPIN: z.string().min(4, "PIN must be at least 4 chars"),
}).refine((data) => data.newPIN === data.confirmNewPIN, {
    message: "New PINs do not match",
    path: ["confirmNewPIN"],
});

// ============================================
// GARDEN MODULE (Phase 2)
// ============================================

export const CreateCropSchema = z.object({
    name: z.string().min(1, "Name is required"),
    variety: z.string().optional(),
    daysToMaturity: z.number().int().positive().optional(),
    plantingDepth: z.string().optional(),
    spacing: z.string().optional(),
    sunRequirement: z.string().optional(),
    waterRequirement: z.string().optional(),
    companionPlants: z.string().optional(), // JSON string array
    incompatiblePlants: z.string().optional(), // JSON string array
    notes: z.string().optional(),
});

export const UpdateCropSchema = CreateCropSchema.partial();

export const CreatePlantingSchema = z.object({
    cropId: z.string().min(1, "Crop is required"),
    location: z.string().min(1, "Location is required"),
    plantDate: z.date(),
    quantity: z.number().positive(),
    expectedHarvest: z.date().optional(),
    notes: z.string().optional(),
});

export const UpdatePlantingSchema = CreatePlantingSchema.partial();

// ============================================
// EQUIPMENT MODULE (Phase 2)
// ============================================

export const CreateEquipmentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    status: z.enum(["operational", "needs-service", "out-of-order"]),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    purchaseDate: z.date().optional(),
    serviceIntervalHours: z.number().int().positive().optional(),
    serviceIntervalDays: z.number().int().positive().optional(),
    currentHours: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
});

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial();

export const CreateMaintenanceSchema = z.object({
    type: z.enum(["routine", "repair", "inspection"]),
    description: z.string().min(1, "Description is required"),
    date: z.date(),
    cost: z.number().nonnegative().optional(),
    hoursAtService: z.number().int().nonnegative().optional(),
});

// ============================================
// LIVESTOCK MODULE (Phase 2)
// ============================================

export const CreateAnimalSchema = z.object({
    name: z.string().min(1, "Name/Tag is required"),
    type: z.string().min(1, "Type is required"),
    breed: z.string().optional(),
    sex: z.enum(["male", "female"]),
    isNeutered: z.boolean().optional(),
    birthDate: z.date().optional(),
    status: z.enum(["active", "sold", "deceased"]),
    parentId: z.string().optional(),
    notes: z.string().optional(),
});

export const CreateHealthRecordSchema = z.object({
    type: z.enum(["vaccination", "medication", "injury", "checkup"]),
    date: z.date(),
    description: z.string().min(1, "Description is required"),
    medication: z.string().optional(),
    dosage: z.string().optional(),
    cost: z.number().nonnegative().optional(),
    nextDue: z.date().optional(),
});

export const CreateProductionLogSchema = z.object({
    type: z.string().min(1, "Type is required"),
    date: z.date(),
    quantity: z.number().positive(),
    unit: z.string().min(1, "Unit is required"),
    notes: z.string().optional(),
});

// ============================================
// RESOURCE MODULE (Phase 3)
// ============================================

export const CreateResourceLogSchema = z.object({
    type: z.string().min(1, "Resource type is required"),
    action: z.enum(["purchase", "usage", "adjustment"]),
    quantity: z.number().positive("Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    date: z.date(),
    cost: z.number().nonnegative().optional(),
    notes: z.string().optional(),
});

// ============================================
// WEATHER MODULE (Phase 3)
// ============================================

export const CreateWeatherSnapshotSchema = z.object({
    temperature: z.number(),
    humidity: z.number().int().min(0).max(100).optional(),
    conditions: z.string().optional(),
    precipitation: z.number().nonnegative().optional(),
    windSpeed: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    date: z.date().optional() // Optional override, defaults to now
});

// ============================================
// PREPAREDNESS MODULE (Phase 3)
// ============================================

export const CreateChecklistSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    isTemplate: z.boolean().optional(),
    notes: z.string().optional(),
});

export const UpdateChecklistSchema = CreateChecklistSchema.partial();

export const CreateChecklistItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    checklistId: z.string().min(1, "Checklist ID is required"),
    description: z.string().optional(),
    notes: z.string().optional(),
});



