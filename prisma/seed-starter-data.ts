import { PrismaClient } from "@prisma/client";

export async function seedStarterData(prisma: PrismaClient) {
  console.log("🌱 Seeding starter data...");

  try {
    // ============================================
    // STORAGE MODULE - Emergency Food Storage
    // ============================================
    const storageItems = await Promise.all([
      // Grains
      prisma.storageItem.create({
        data: {
          name: "White Rice",
          category: "grains",
          quantity: 50,
          unit: "lbs",
          location: "Basement Shelves",
          purchaseDate: new Date("2024-01-15"),
          expirationDate: new Date("2030-01-15"),
          calories: 1650,
          notes: "Stored in mylar bags with oxygen absorbers",
          isStarterData: true,
        },
      }),
      prisma.storageItem.create({
        data: {
          name: "Whole Wheat",
          category: "grains",
          quantity: 25,
          unit: "lbs",
          location: "Basement Shelves",
          purchaseDate: new Date("2024-02-01"),
          expirationDate: new Date("2029-02-01"),
          calories: 1620,
          notes: "Food-grade buckets with gamma lids",
          isStarterData: true,
        },
      }),
      prisma.storageItem.create({
        data: {
          name: "Oats",
          category: "grains",
          quantity: 20,
          unit: "lbs",
          location: "Pantry",
          purchaseDate: new Date("2024-03-10"),
          expirationDate: new Date("2026-03-10"),
          calories: 1540,
          isStarterData: true,
        },
      }),
      // Legumes
      prisma.storageItem.create({
        data: {
          name: "Pinto Beans",
          category: "legumes",
          quantity: 25,
          unit: "lbs",
          location: "Basement Shelves",
          purchaseDate: new Date("2024-01-20"),
          expirationDate: new Date("2032-01-20"),
          calories: 1550,
          notes: "Stored in food-grade buckets",
          isStarterData: true,
        },
      }),
      prisma.storageItem.create({
        data: {
          name: "Black Beans",
          category: "legumes",
          quantity: 15,
          unit: "lbs",
          location: "Basement Shelves",
          purchaseDate: new Date("2024-02-05"),
          expirationDate: new Date("2031-12-31"),
          calories: 1560,
          isStarterData: true,
        },
      }),
      prisma.storageItem.create({
        data: {
          name: "Lentils",
          category: "legumes",
          quantity: 10,
          unit: "lbs",
          location: "Pantry",
          purchaseDate: new Date("2024-04-01"),
          expirationDate: new Date("2027-04-01"),
          calories: 1600,
          isStarterData: true,
        },
      }),
      // Canned Goods
      prisma.storageItem.create({
        data: {
          name: "Canned Tomatoes",
          category: "canned",
          quantity: 24,
          unit: "cans",
          location: "Pantry",
          purchaseDate: new Date("2024-05-15"),
          expirationDate: new Date("2026-08-15"),
          calories: 85,
          isStarterData: true,
        },
      }),
      prisma.storageItem.create({
        data: {
          name: "Canned Chicken",
          category: "canned",
          quantity: 12,
          unit: "cans",
          location: "Pantry",
          purchaseDate: new Date("2024-06-01"),
          expirationDate: new Date("2027-06-01"),
          calories: 234,
          notes: "12.5 oz cans",
          isStarterData: true,
        },
      }),
      prisma.storageItem.create({
        data: {
          name: "Canned Corn",
          category: "canned",
          quantity: 18,
          unit: "cans",
          location: "Pantry",
          purchaseDate: new Date("2024-03-20"),
          expirationDate: new Date("2026-03-20"),
          calories: 132,
          isStarterData: true,
        },
      }),
      // Freeze-dried
      prisma.storageItem.create({
        data: {
          name: "Freeze-Dried Strawberries",
          category: "freeze-dried",
          quantity: 5,
          unit: "pouches",
          location: "Pantry",
          purchaseDate: new Date("2024-07-01"),
          expirationDate: new Date("2034-07-01"),
          calories: 380,
          notes: "25-year shelf life",
          isStarterData: true,
        },
      }),
      prisma.storageItem.create({
        data: {
          name: "Freeze-Dried Beef",
          category: "freeze-dried",
          quantity: 8,
          unit: "cans",
          location: "Basement Shelves",
          purchaseDate: new Date("2024-01-10"),
          expirationDate: new Date("2034-01-10"),
          calories: 720,
          notes: "#10 cans",
          isStarterData: true,
        },
      }),
      // Expiring soon (for testing alerts)
      prisma.storageItem.create({
        data: {
          name: "Pasta",
          category: "grains",
          quantity: 10,
          unit: "lbs",
          location: "Pantry",
          purchaseDate: new Date("2023-07-01"),
          expirationDate: new Date("2026-03-15"), // Expiring in ~1 month
          calories: 1580,
          notes: "Various shapes",
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${storageItems.length} storage items`);

    // ============================================
    // GARDEN MODULE - Crops and Plantings
    // ============================================
    const crops = await Promise.all([
      prisma.crop.create({
        data: {
          name: "Tomato",
          variety: "Roma",
          daysToMaturity: 75,
          plantingDepth: "1/4 inch",
          spacing: "24 inches",
          sunRequirement: "full",
          waterRequirement: "medium",
          companionPlants: JSON.stringify(["basil", "carrots", "parsley"]),
          incompatiblePlants: JSON.stringify(["brassicas", "fennel"]),
          isStarterData: true,
        },
      }),
      prisma.crop.create({
        data: {
          name: "Lettuce",
          variety: "Butterhead",
          daysToMaturity: 55,
          plantingDepth: "1/8 inch",
          spacing: "8 inches",
          sunRequirement: "partial",
          waterRequirement: "high",
          companionPlants: JSON.stringify(["carrots", "radishes", "strawberries"]),
          incompatiblePlants: JSON.stringify([]),
          isStarterData: true,
        },
      }),
      prisma.crop.create({
        data: {
          name: "Zucchini",
          variety: "Black Beauty",
          daysToMaturity: 50,
          plantingDepth: "1 inch",
          spacing: "36 inches",
          sunRequirement: "full",
          waterRequirement: "medium",
          companionPlants: JSON.stringify(["beans", "corn", "squash"]),
          incompatiblePlants: JSON.stringify(["potatoes"]),
          isStarterData: true,
        },
      }),
      prisma.crop.create({
        data: {
          name: "Carrots",
          variety: "Danvers",
          daysToMaturity: 70,
          plantingDepth: "1/4 inch",
          spacing: "3 inches",
          sunRequirement: "full",
          waterRequirement: "medium",
          companionPlants: JSON.stringify(["lettuce", "onions", "tomatoes"]),
          incompatiblePlants: JSON.stringify(["dill"]),
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${crops.length} crops`);

    // Create plantings
    const plantings = await Promise.all([
      prisma.planting.create({
        data: {
          cropId: crops[0].id, // Tomato
          location: "Garden Bed A1",
          plantDate: new Date("2025-04-15"),
          expectedHarvest: new Date("2025-06-29"),
          quantity: 12,
          notes: "Started indoors, transplanted May 15",
          isStarterData: true,
        },
      }),
      prisma.planting.create({
        data: {
          cropId: crops[1].id, // Lettuce
          location: "Garden Bed B2",
          plantDate: new Date("2025-03-20"),
          actualHarvest: new Date("2025-05-14"),
          quantity: 24,
          yield: 8.5,
          yieldUnit: "lbs",
          success: true,
          notes: "Great harvest! Will plant again",
          isStarterData: true,
        },
      }),
      prisma.planting.create({
        data: {
          cropId: crops[2].id, // Zucchini
          location: "Garden Bed A2",
          plantDate: new Date("2025-05-01"),
          expectedHarvest: new Date("2025-06-20"),
          quantity: 6,
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${plantings.length} plantings`);

    // ============================================
    // EQUIPMENT MODULE
    // ============================================
    const equipment = await Promise.all([
      prisma.equipment.create({
        data: {
          name: "John Deere Tractor",
          category: "tractor",
          make: "John Deere",
          model: "3025E",
          serialNumber: "JD3025E-2019-001234",
          purchaseDate: new Date("2019-05-15"),
          purchasePrice: 22500,
          location: "Main Barn",
          status: "operational",
          serviceIntervalHours: 50,
          currentHours: 342.5,
          lastServiceDate: new Date("2025-12-10"),
          lastServiceHours: 300,
          isStarterData: true,
        },
      }),
      prisma.equipment.create({
        data: {
          name: "Honda Generator",
          category: "generator",
          make: "Honda",
          model: "EU7000iS",
          serialNumber: "HGN-7000-2020-567",
          purchaseDate: new Date("2020-03-20"),
          purchasePrice: 4200,
          location: "Equipment Shed",
          status: "operational",
          serviceIntervalDays: 90,
          currentHours: 156,
          lastServiceDate: new Date("2025-11-15"),
          notes: "7000W inverter generator",
          isStarterData: true,
        },
      }),
      prisma.equipment.create({
        data: {
          name: "Stihl Chainsaw",
          category: "chainsaw",
          make: "Stihl",
          model: "MS 271",
          purchaseDate: new Date("2021-08-10"),
          purchasePrice: 549,
          location: "Tool Shed",
          status: "needs-service",
          currentHours: 87,
          lastServiceDate: new Date("2024-10-01"),
          notes: "Chain needs sharpening",
          isStarterData: true,
        },
      }),
      prisma.equipment.create({
        data: {
          name: "Walk-Behind Mower",
          category: "mower",
          make: "Honda",
          model: "HRX217",
          purchaseDate: new Date("2022-04-01"),
          purchasePrice: 699,
          location: "Equipment Shed",
          status: "operational",
          serviceIntervalHours: 25,
          currentHours: 178,
          lastServiceDate: new Date("2025-09-20"),
          lastServiceHours: 175,
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${equipment.length} equipment items`);

    // Create maintenance records
    const maintenanceRecords = await Promise.all([
      prisma.maintenanceRecord.create({
        data: {
          equipmentId: equipment[0].id, // Tractor
          date: new Date("2025-12-10"),
          type: "oil-change",
          description: "Regular 50-hour oil change and filter replacement",
          hoursAtService: 300,
          cost: 85.50,
          parts: JSON.stringify(["Oil filter", "Engine oil (5 qts)"]),
          performedBy: "Self",
          isStarterData: true,
        },
      }),
      prisma.maintenanceRecord.create({
        data: {
          equipmentId: equipment[1].id, // Generator
          date: new Date("2025-11-15"),
          type: "inspection",
          description: "Quarterly inspection and test run",
          cost: 0,
          performedBy: "Self",
          notes: "Ran for 30 minutes under load, all systems normal",
          isStarterData: true,
        },
      }),
      prisma.maintenanceRecord.create({
        data: {
          equipmentId: equipment[0].id, // Tractor
          date: new Date("2025-08-15"),
          type: "repair",
          description: "Replaced hydraulic hose",
          hoursAtService: 275,
          cost: 145.00,
          parts: JSON.stringify(["Hydraulic hose", "Hose clamps"]),
          performedBy: "Mobile Mechanic",
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${maintenanceRecords.length} maintenance records`);

    // ============================================
    // LIVESTOCK MODULE
    // ============================================
    const animals = await Promise.all([
      // Chickens
      prisma.animal.create({
        data: {
          name: "Goldie",
          tag: "CH-001",
          type: "chicken",
          breed: "Rhode Island Red",
          sex: "female",
          birthDate: new Date("2023-04-01"),
          acquiredDate: new Date("2023-05-15"),
          status: "active",
          notes: "Great egg layer, friendly temperament",
          isStarterData: true,
        },
      }),
      prisma.animal.create({
        data: {
          name: "Brownie",
          tag: "CH-002",
          type: "chicken",
          breed: "Barred Rock",
          sex: "female",
          birthDate: new Date("2023-04-05"),
          acquiredDate: new Date("2023-05-15"),
          status: "active",
          isStarterData: true,
        },
      }),
      prisma.animal.create({
        data: {
          name: "Henrietta",
          tag: "CH-003",
          type: "chicken",
          breed: "Buff Orpington",
          sex: "female",
          birthDate: new Date("2023-04-10"),
          acquiredDate: new Date("2023-05-15"),
          status: "active",
          notes: "Goes broody frequently",
          isStarterData: true,
        },
      }),
      // Goats
      prisma.animal.create({
        data: {
          name: "Daisy",
          tag: "GT-001",
          type: "goat",
          breed: "Nigerian Dwarf",
          sex: "female",
          birthDate: new Date("2022-03-15"),
          acquiredDate: new Date("2022-06-01"),
          status: "active",
          notes: "Good milk producer",
          isStarterData: true,
        },
      }),
      prisma.animal.create({
        data: {
          name: "Clover",
          tag: "GT-002",
          type: "goat",
          breed: "Nigerian Dwarf",
          sex: "female",
          birthDate: new Date("2022-03-20"),
          acquiredDate: new Date("2022-06-01"),
          status: "active",
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${animals.length} animals`);

    // Create health records
    const healthRecords = await Promise.all([
      prisma.healthRecord.create({
        data: {
          animalId: animals[0].id, // Goldie
          date: new Date("2025-01-15"),
          type: "vaccination",
          description: "Annual Marek's disease vaccination",
          medication: "Marek's vaccine",
          performedBy: "Self",
          nextDue: new Date("2026-01-15"),
          isStarterData: true,
        },
      }),
      prisma.healthRecord.create({
        data: {
          animalId: animals[3].id, // Daisy
          date: new Date("2025-12-01"),
          type: "vaccination",
          description: "CD&T vaccination",
          medication: "CD&T vaccine",
          dosage: "2 mL subcutaneous",
          cost: 15.00,
          performedBy: "Self",
          nextDue: new Date("2026-12-01"),
          isStarterData: true,
        },
      }),
      prisma.healthRecord.create({
        data: {
          animalId: animals[4].id, // Clover
          date: new Date("2025-12-01"),
          type: "vaccination",
          description: "CD&T vaccination",
          medication: "CD&T vaccine",
          dosage: "2 mL subcutaneous",
          cost: 15.00,
          performedBy: "Self",
          nextDue: new Date("2026-12-01"),
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${healthRecords.length} health records`);

    // Create production logs
    const productionLogs = await Promise.all([
      prisma.productionLog.create({
        data: {
          animalId: animals[0].id, // Goldie
          date: new Date("2026-02-05"),
          type: "eggs",
          quantity: 1,
          unit: "count",
          quality: "Grade A",
          isStarterData: true,
        },
      }),
      prisma.productionLog.create({
        data: {
          animalId: animals[1].id, // Brownie
          date: new Date("2026-02-05"),
          type: "eggs",
          quantity: 1,
          unit: "count",
          quality: "Grade A",
          isStarterData: true,
        },
      }),
      prisma.productionLog.create({
        data: {
          animalId: animals[3].id, // Daisy
          date: new Date("2026-02-05"),
          type: "milk",
          quantity: 0.75,
          unit: "gallons",
          notes: "Morning milking",
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${productionLogs.length} production logs`);

    // ============================================
    // TASKS MODULE
    // ============================================
    const tasks = await Promise.all([
      // Todo tasks
      prisma.task.create({
        data: {
          title: "Check water storage expiration dates",
          description: "Inspect all stored water containers for algae and expiration",
          category: "storage",
          priority: "medium",
          recurrenceRule: "FREQ=MONTHLY;INTERVAL=1",
          nextDue: new Date("2026-03-01"),
          estimatedMinutes: 30,
          isStarterData: true,
        },
      }),
      prisma.task.create({
        data: {
          title: "Clean chicken coop",
          description: "Deep clean coop, replace bedding, sanitize roosts",
          category: "livestock",
          priority: "medium",
          recurrenceRule: "FREQ=WEEKLY;INTERVAL=1",
          nextDue: new Date("2026-02-08"),
          estimatedMinutes: 60,
          isStarterData: true,
        },
      }),
      prisma.task.create({
        data: {
          title: "Inspect generator and test run",
          description: "Start generator, run under load for 30 minutes, check oil level",
          category: "equipment",
          priority: "high",
          recurrenceRule: "FREQ=MONTHLY;INTERVAL=1",
          nextDue: new Date("2026-02-15"),
          estimatedMinutes: 45,
          notes: "Check fuel stabilizer level",
          isStarterData: true,
        },
      }),
      prisma.task.create({
        data: {
          title: "Order garden seeds for spring",
          description: "Review last year's notes and order seeds for spring planting",
          category: "garden",
          priority: "high",
          nextDue: new Date("2026-02-20"),
          estimatedMinutes: 90,
          isStarterData: true,
        },
      }),
      // In progress task
      prisma.task.create({
        data: {
          title: "Rotate emergency food supplies",
          description: "Check expiration dates and rotate stock (FIFO method)",
          category: "storage",
          priority: "medium",
          recurrenceRule: "FREQ=YEARLY;INTERVAL=1;BYMONTH=3",
          nextDue: new Date("2027-03-01"),
          lastCompleted: new Date("2025-03-15"),
          estimatedMinutes: 120,
          notes: "Started, halfway through basement shelves",
          isStarterData: true,
        },
      }),
      // Completed task
      prisma.task.create({
        data: {
          title: "Change tractor oil",
          description: "50-hour oil change with filter replacement",
          category: "equipment",
          priority: "high",
          recurrenceRule: "FREQ=MONTHLY;INTERVAL=2",
          lastCompleted: new Date("2025-12-10"),
          nextDue: new Date("2026-03-10"),
          estimatedMinutes: 45,
          isStarterData: true,
        },
      }),
      prisma.task.create({
        data: {
          title: "Collect and wash eggs",
          description: "Daily egg collection and cleaning",
          category: "livestock",
          priority: "medium",
          recurrenceRule: "FREQ=DAILY;INTERVAL=1",
          lastCompleted: new Date("2026-02-05"),
          nextDue: new Date("2026-02-06"),
          estimatedMinutes: 15,
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${tasks.length} tasks`);

    // Create task completions for completed tasks
    const taskCompletions = await Promise.all([
      prisma.taskCompletion.create({
        data: {
          taskId: tasks[5].id, // Change tractor oil
          completedAt: new Date("2025-12-10"),
          completedBy: "Self",
          duration: 50,
          notes: "Replaced oil filter, no issues",
          isStarterData: true,
        },
      }),
      prisma.taskCompletion.create({
        data: {
          taskId: tasks[6].id, // Collect eggs
          completedAt: new Date("2026-02-05"),
          completedBy: "Self",
          duration: 12,
          notes: "8 eggs collected",
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${taskCompletions.length} task completions`);

    // ============================================
    // RESOURCES MODULE
    // ============================================
    const resourceLogs = await Promise.all([
      // Water
      prisma.resourceLog.create({
        data: {
          type: "water",
          action: "usage",
          quantity: 150,
          unit: "gallons",
          date: new Date("2026-02-01"),
          notes: "Garden irrigation",
          isStarterData: true,
        },
      }),
      prisma.resourceLog.create({
        data: {
          type: "water",
          action: "purchase",
          quantity: 500,
          unit: "gallons",
          date: new Date("2026-01-15"),
          cost: 0,
          notes: "Rainwater collection",
          isStarterData: true,
        },
      }),
      // Fuel
      prisma.resourceLog.create({
        data: {
          type: "fuel",
          action: "purchase",
          quantity: 50,
          unit: "gallons",
          date: new Date("2026-01-20"),
          cost: 175.00,
          vendor: "Local Gas Station",
          notes: "Diesel for tractor",
          isStarterData: true,
        },
      }),
      prisma.resourceLog.create({
        data: {
          type: "fuel",
          action: "usage",
          quantity: 12,
          unit: "gallons",
          date: new Date("2026-02-01"),
          notes: "Tractor usage",
          isStarterData: true,
        },
      }),
      // Feed
      prisma.resourceLog.create({
        data: {
          type: "feed",
          action: "purchase",
          quantity: 100,
          unit: "lbs",
          date: new Date("2026-01-25"),
          cost: 45.00,
          vendor: "Feed Store",
          notes: "Layer feed for chickens",
          isStarterData: true,
        },
      }),
      prisma.resourceLog.create({
        data: {
          type: "feed",
          action: "usage",
          quantity: 25,
          unit: "lbs",
          date: new Date("2026-02-05"),
          notes: "Weekly feed consumption",
          isStarterData: true,
        },
      }),
    ]);

    console.log(`✅ Created ${resourceLogs.length} resource logs`);

    // ============================================
    // PREPAREDNESS MODULE
    // ============================================
    const checklist = await prisma.checklist.create({
      data: {
        name: "72-Hour Emergency Kit",
        description: "Essential supplies for a 72-hour emergency scenario",
        category: "evacuation",
        isTemplate: false,
        isStarterData: true,
        items: {
          create: [
            {
              title: "Water (1 gallon per person per day)",
              sortOrder: 1,
              isCompleted: true,
              completedAt: new Date("2026-01-10"),
              isStarterData: true,
            },
            {
              title: "Non-perishable food (3-day supply)",
              sortOrder: 2,
              isCompleted: true,
              completedAt: new Date("2026-01-10"),
              isStarterData: true,
            },
            {
              title: "Battery-powered or hand-crank radio",
              sortOrder: 3,
              isCompleted: true,
              completedAt: new Date("2026-01-15"),
              isStarterData: true,
            },
            {
              title: "Flashlight and extra batteries",
              sortOrder: 4,
              isCompleted: true,
              completedAt: new Date("2026-01-15"),
              isStarterData: true,
            },
            {
              title: "First aid kit",
              sortOrder: 5,
              isCompleted: false,
              isStarterData: true,
            },
            {
              title: "Whistle (to signal for help)",
              sortOrder: 6,
              isCompleted: true,
              completedAt: new Date("2026-01-20"),
              isStarterData: true,
            },
            {
              title: "Dust masks",
              sortOrder: 7,
              isCompleted: false,
              isStarterData: true,
            },
            {
              title: "Plastic sheeting and duct tape",
              sortOrder: 8,
              isCompleted: false,
              isStarterData: true,
            },
            {
              title: "Moist towelettes, garbage bags",
              sortOrder: 9,
              isCompleted: true,
              completedAt: new Date("2026-01-22"),
              isStarterData: true,
            },
            {
              title: "Wrench/pliers (to turn off utilities)",
              sortOrder: 10,
              isCompleted: true,
              completedAt: new Date("2026-01-25"),
              isStarterData: true,
            },
            {
              title: "Manual can opener",
              sortOrder: 11,
              isCompleted: true,
              completedAt: new Date("2026-01-10"),
              isStarterData: true,
            },
            {
              title: "Local maps",
              sortOrder: 12,
              isCompleted: false,
              isStarterData: true,
            },
            {
              title: "Cell phone with chargers and backup battery",
              sortOrder: 13,
              isCompleted: true,
              completedAt: new Date("2026-01-28"),
              isStarterData: true,
            },
            {
              title: "Prescription medications",
              sortOrder: 14,
              isCompleted: false,
              isStarterData: true,
            },
            {
              title: "Important documents in waterproof container",
              sortOrder: 15,
              isCompleted: false,
              isStarterData: true,
            },
          ],
        },
      },
    });

    console.log(`✅ Created emergency checklist with items`);

    console.log("🎉 Starter data seeding complete!");

    return { success: true };
  } catch (error) {
    console.error("❌ Error seeding starter data:", error);
    throw error;
  }
}

export async function clearStarterData(prisma: PrismaClient) {
  console.log("🧹 Clearing starter data...");

  try {
    // Delete in reverse order of dependencies
    await prisma.taskCompletion.deleteMany({ where: { isStarterData: true } });
    await prisma.task.deleteMany({ where: { isStarterData: true } });
    await prisma.checklistItem.deleteMany({ where: { isStarterData: true } });
    await prisma.checklist.deleteMany({ where: { isStarterData: true } });
    await prisma.resourceLog.deleteMany({ where: { isStarterData: true } });
    await prisma.productionLog.deleteMany({ where: { isStarterData: true } });
    await prisma.healthRecord.deleteMany({ where: { isStarterData: true } });
    await prisma.animal.deleteMany({ where: { isStarterData: true } });
    await prisma.maintenanceRecord.deleteMany({ where: { isStarterData: true } });
    await prisma.equipment.deleteMany({ where: { isStarterData: true } });
    await prisma.planting.deleteMany({ where: { isStarterData: true } });
    await prisma.crop.deleteMany({ where: { isStarterData: true } });
    await prisma.storageItem.deleteMany({ where: { isStarterData: true } });

    // Update settings to reflect cleared data
    const settings = await prisma.settings.findFirst();
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: { hasStarterData: false },
      });
    }

    console.log("✅ Starter data cleared successfully");

    return { success: true };
  } catch (error) {
    console.error("❌ Error clearing starter data:", error);
    throw error;
  }
}
