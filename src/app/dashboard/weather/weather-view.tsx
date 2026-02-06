"use client";

import { useState } from "react";
import { logWeather } from "@/actions/weather";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function WeatherView({ latest, history }: { latest: WeatherSnapshot | null, history: WeatherSnapshot[] }) {
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Weather</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Log Weather</Button>
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

            {latest && (
                <Card>
                    <CardHeader>
                        <CardTitle>Current Conditions ({new Date(latest.timestamp).toLocaleTimeString()})</CardTitle>
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
                            <div className="text-lg">{latest.precipitation ? `${latest.precipitation}"` : '-'}</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="border rounded-md">
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
                                <TableCell>{log.precipitation ? `${log.precipitation}"` : "-"}</TableCell>
                                <TableCell>{log.notes || "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
