import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed some common crops
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
      },
    }),
  ]);

  console.log(`✅ Created ${crops.length} crops`);

  // Seed emergency preparedness checklist template
  const emergencyChecklist = await prisma.checklist.create({
    data: {
      name: "72-Hour Emergency Kit",
      description: "Essential supplies for a 72-hour emergency scenario",
      category: "evacuation",
      isTemplate: true,
      items: {
        create: [
          { title: "Water (1 gallon per person per day)", sortOrder: 1 },
          { title: "Non-perishable food (3-day supply)", sortOrder: 2 },
          { title: "Battery-powered or hand-crank radio", sortOrder: 3 },
          { title: "Flashlight and extra batteries", sortOrder: 4 },
          { title: "First aid kit", sortOrder: 5 },
          { title: "Whistle (to signal for help)", sortOrder: 6 },
          { title: "Dust masks", sortOrder: 7 },
          { title: "Plastic sheeting and duct tape", sortOrder: 8 },
          { title: "Moist towelettes, garbage bags", sortOrder: 9 },
          { title: "Wrench/pliers (to turn off utilities)", sortOrder: 10 },
          { title: "Manual can opener", sortOrder: 11 },
          { title: "Local maps", sortOrder: 12 },
          { title: "Cell phone with chargers and backup battery", sortOrder: 13 },
          { title: "Prescription medications", sortOrder: 14 },
          { title: "Important documents in waterproof container", sortOrder: 15 },
          { title: "Cash in small denominations", sortOrder: 16 },
          { title: "Emergency blanket", sortOrder: 17 },
          { title: "Change of clothes and sturdy shoes", sortOrder: 18 },
          { title: "Fire extinguisher", sortOrder: 19 },
          { title: "Matches in waterproof container", sortOrder: 20 },
        ],
      },
    },
  });

  console.log(`✅ Created emergency checklist: ${emergencyChecklist.name}`);

  // Seed some common recurring tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Check water storage expiration dates",
        category: "storage",
        priority: "medium",
        recurrenceRule: "FREQ=MONTHLY;INTERVAL=1",
        estimatedMinutes: 30,
      },
    }),
    prisma.task.create({
      data: {
        title: "Inspect generator and test run",
        category: "equipment",
        priority: "high",
        recurrenceRule: "FREQ=MONTHLY;INTERVAL=1",
        estimatedMinutes: 45,
      },
    }),
    prisma.task.create({
      data: {
        title: "Rotate emergency food supplies",
        category: "storage",
        priority: "medium",
        recurrenceRule: "FREQ=YEARLY;INTERVAL=1;BYMONTH=3",
        estimatedMinutes: 120,
      },
    }),
    prisma.task.create({
      data: {
        title: "Clean chicken coop",
        category: "livestock",
        priority: "medium",
        recurrenceRule: "FREQ=WEEKLY;INTERVAL=1",
        estimatedMinutes: 60,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} recurring tasks`);

  // Seed sample storage items
  const storageItems = await Promise.all([
    prisma.storageItem.create({
      data: {
        name: "White Rice",
        category: "grains",
        quantity: 50,
        unit: "lbs",
        location: "Basement Shelves",
        expirationDate: new Date("2030-01-01"),
        calories: 1650,
        notes: "Stored in mylar bags with oxygen absorbers",
      },
    }),
    prisma.storageItem.create({
      data: {
        name: "Pinto Beans",
        category: "legumes",
        quantity: 25,
        unit: "lbs",
        location: "Basement Shelves",
        expirationDate: new Date("2032-06-01"),
        calories: 1550,
        notes: "Stored in food-grade buckets",
      },
    }),
    prisma.storageItem.create({
      data: {
        name: "Canned Tomatoes",
        category: "canned",
        quantity: 24,
        unit: "cans",
        location: "Pantry",
        expirationDate: new Date("2026-08-15"),
        calories: 85,
      },
    }),
  ]);

  console.log(`✅ Created ${storageItems.length} storage items`);

  console.log("🎉 Database seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
