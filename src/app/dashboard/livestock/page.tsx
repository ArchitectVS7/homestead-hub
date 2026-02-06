import { getAnimals, getProductionStats } from "@/actions/livestock";
import { LivestockView } from "./livestock-view";

export default async function LivestockPage() {
  const [animals, stats] = await Promise.all([
    getAnimals({ status: "active" }),
    getProductionStats(),
  ]);

  return <LivestockView initialAnimals={animals as any} productionStats={stats} />;
}
