import { getAnimals, getProductionStats, getProductionChartData, getProductionByType } from "@/actions/livestock";
import { LivestockView } from "./livestock-view";

export default async function LivestockPage() {
  const [animals, stats, chartData, productionByType] = await Promise.all([
    getAnimals({ status: "active" }),
    getProductionStats(),
    getProductionChartData(30),
    getProductionByType(),
  ]);

  return <LivestockView initialAnimals={animals as any} productionStats={stats} chartData={chartData} productionByType={productionByType} />;
}
