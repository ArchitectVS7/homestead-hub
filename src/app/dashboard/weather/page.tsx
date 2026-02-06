
import { getLatestWeather, getWeatherHistory } from "@/actions/weather";
import { WeatherView } from "./weather-view";

export default async function WeatherPage() {
  const latest = await getLatestWeather();
  const history = await getWeatherHistory();

  return (
    <div className="space-y-6">
      <WeatherView latest={latest} history={history} />
    </div>
  );
}
