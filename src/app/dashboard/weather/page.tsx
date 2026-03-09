import { getLatestWeather, getWeatherHistory, getFrostAlert, getWeatherChartData, getWeatherStats } from "@/actions/weather";
import { WeatherView } from "./weather-view";

export default async function WeatherPage() {
    const [latest, history, frostAlert, chartData, stats] = await Promise.all([
        getLatestWeather(),
        getWeatherHistory(),
        getFrostAlert(),
        getWeatherChartData(30),
        getWeatherStats(30),
    ]);

    return (
        <WeatherView
            latest={latest}
            history={history}
            frostAlert={frostAlert}
            chartData={chartData}
            stats={stats}
        />
    );
}
