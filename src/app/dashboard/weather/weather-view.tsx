"use client";

import { useState } from "react";
import { logWeather } from "@/actions/weather";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart } from "recharts";
import { Thermometer, Cloud, Droplets, Wind, AlertTriangle, Snowflake } from "lucide-react";

type WeatherSnapshot = {
    id: string;
    timestamp: Date;
    temperature: number;
    humidity: number | null;
    conditions: string | null;
    precipitation: number | null;
    windSpeed: number | null;
    notes: string | null;
};

type FrostAlert = {
    isFrost: boolean;
    temperature: number | null;
    timestamp: Date | null;
};

type WeatherStats = {
    avgTemp: number | null;
    highTemp: number | null;
    lowTemp: number | null;
    totalPrecipitation: number;
    snapshotCount: number;
};

interface WeatherViewProps {
    latest: WeatherSnapshot | null;
    history: WeatherSnapshot[];
    frostAlert: FrostAlert | null;
    chartData: { date: string; temperature: number; precipitation: number | null }[];
    stats: WeatherStats;
}

export function WeatherView({ latest, history, frostAlert, chartData, stats }: WeatherViewProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        temperature: "",
        humidity: "",
        conditions: "",
        precipitation: "",
        windSpeed: "",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await logWeather({
                temperature: parseFloat(formData.temperature),
                humidity: formData.humidity ? parseInt(formData.humidity) : undefined,
                conditions: formData.conditions || undefined,
                precipitation: formData.precipitation ? parseFloat(formData.precipitation) : undefined,
                windSpeed: formData.windSpeed ? parseFloat(formData.windSpeed) : undefined,
                notes: formData.notes || undefined,
                date: new Date()
            });
            setIsDialogOpen(false);
            window.location.reload();
        } catch (error) {
            alert("Failed to log weather");
        }
    };

    return (
        <div className="space-y-6">
            {/* Frost Alert */}
            {frostAlert?.isFrost && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-800">
                    <Snowflake className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Frost Alert</p>
                        <p className="text-sm">
                            Temperature dropped to {frostAlert.temperature}°F on {frostAlert.timestamp?.toLocaleDateString()}. 
                            Protect sensitive plants and animals.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgTemp?.toFixed(1) || '-'}°F</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High</CardTitle>
                        <Thermometer className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.highTemp?.toFixed(1) || '-'}°F</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low</CardTitle>
                        <Thermometer className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.lowTemp?.toFixed(1) || '-'}°F</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Precipitation</CardTitle>
                        <Droplets className="w-4 h-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPrecipitation.toFixed(2)} in</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Current Conditions */}
            {latest && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cloud className="w-5 h-5" />
                            Current Conditions ({new Date(latest.timestamp).toLocaleString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-2xl font-bold">{latest.temperature}°F</div>
                            <div className="text-muted-foreground">{latest.conditions || "Unknown"}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Humidity</div>
                            <div className="text-lg">{latest.humidity ? `${latest.humidity}%` : '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Wind</div>
                            <div className="text-lg">{latest.windSpeed ? `${latest.windSpeed} mph` : '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Precipitation</div>
                            <div className="text-lg">{latest.precipitation ? `${latest.precipitation} in` : '-'}</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Temperature Trend Chart */}
            {chartData.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Temperature & Precipitation Trends (30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Legend />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="temperature"
                                        fill="#f0abfc"
                                        stroke="#d946ef"
                                        name="Avg Temp (°F)"
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="precipitation"
                                        fill="#60a5fa"
                                        name="Precipitation (in)"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Log Button */}
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary">Log Weather</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Current Conditions</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label>Temperature (°F)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="border p-2 rounded w-full"
                                        value={formData.temperature}
                                        onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label>Humidity (%)</label>
                                    <input
                                        type="number"
                                        className="border p-2 rounded w-full"
                                        value={formData.humidity}
                                        onChange={e => setFormData({ ...formData, humidity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label>Conditions</label>
                                <input
                                    className="border p-2 rounded w-full"
                                    placeholder="Sunny, Cloudy, Rain..."
                                    value={formData.conditions}
                                    onChange={e => setFormData({ ...formData, conditions: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label>Precipitation (in)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="border p-2 rounded w-full"
                                        value={formData.precipitation}
                                        onChange={e => setFormData({ ...formData, precipitation: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label>Wind Speed (mph)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="border p-2 rounded w-full"
                                        value={formData.windSpeed}
                                        onChange={e => setFormData({ ...formData, windSpeed: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label>Notes</label>
                                <textarea
                                    className="border p-2 rounded w-full"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Log</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* History Table */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Weather History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date/Time</TableHead>
                                <TableHead>Temp</TableHead>
                                <TableHead>Conditions</TableHead>
                                <TableHead>Precipitation</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>{log.temperature}°F</TableCell>
                                    <TableCell>{log.conditions || "-"}</TableCell>
                                    <TableCell>{log.precipitation ? `${log.precipitation} in` : "-"}</TableCell>
                                    <TableCell>{log.notes || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {history.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No weather logs found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
