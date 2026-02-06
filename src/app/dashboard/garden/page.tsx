import { getCrops, getPlantings } from "@/actions/garden";
import { GardenView } from "./garden-view";

export default async function GardenPage() {
  const [crops, plantings] = await Promise.all([
    getCrops(),
    getPlantings({ status: "active" }), // Default view active
  ]);

  // Serialize dates for client
  const serializedPlantings = plantings.map(p => ({
    ...p,
    plantDate: p.plantDate,
    expectedHarvest: p.expectedHarvest,
    actualHarvest: p.actualHarvest,
  }));

  return <GardenView initialCrops={crops} initialPlantings={serializedPlantings} />;
}
