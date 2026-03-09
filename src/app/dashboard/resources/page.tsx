import { getResourceSummary, getResourceHistory, getResourceChartData, getLowStockAlerts } from "@/actions/resources";
import { ResourcesView } from "./resources-view";

export default async function ResourcesPage() {
    const [summary, history, chartData, lowStockAlerts] = await Promise.all([
        getResourceSummary(),
        getResourceHistory(),
        getResourceChartData(30),
        getLowStockAlerts(),
    ]);

    return (
        <ResourcesView
            initialSummary={summary}
            initialHistory={history}
            chartData={chartData}
            lowStockAlerts={lowStockAlerts}
        />
    );
}
