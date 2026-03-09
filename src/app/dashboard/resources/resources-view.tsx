"use client";

import { useState } from "react";
import { logResource, getLowStockAlerts } from "@/actions/resources";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Droplet } from "lucide-react";

type ResourceSummary = {
    type: string;
    balance: number;
    unit: string;
    lastActivity: Date;
    trend: 'up' | 'down' | 'stable';
};

type ResourceLog = {
    id: string;
    type: string;
    action: string;
    quantity: number;
    unit: string;
    date: Date;
    notes: string | null;
};

type LowStockAlert = {
    type: string;
    balance: number;
    unit: string;
    threshold: number;
    percentRemaining: number;
};

interface ResourcesViewProps {
    initialSummary: ResourceSummary[];
    initialHistory: ResourceLog[];
    chartData: Record<string, { date: string; balance: number }[]>;
    lowStockAlerts: LowStockAlert[];
}

export function ResourcesView({ initialSummary, initialHistory, chartData, lowStockAlerts }: ResourcesViewProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: "",
        action: "usage",
        quantity: "",
        unit: "",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await logResource({
                type: formData.type,
                action: formData.action as any,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                date: new Date(),
                notes: formData.notes
            });
            setIsDialogOpen(false);
            window.location.reload();
        } catch (error) {
            alert("Failed to log resource");
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-gray-400';
        }
    };

    // Transform chart data for Recharts
    const transformedChartData = Object.entries(chartData).flatMap(([type, data]) => 
        data.map(d => ({ ...d, type }))
    );

    return (
        <div className="space-y-6">
            {/* Low Stock Alerts */}
            {lowStockAlerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="font-semibold">Low Stock Alerts</h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {lowStockAlerts.map(alert => (
                            <div key={alert.type} className="bg-white rounded-lg p-3 border border-red-100">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium capitalize">{alert.type}</span>
                                    <span className="text-xs text-red-600 font-medium">{alert.percentRemaining}% remaining</span>
                                </div>
                                <div className="mt-2">
                                    <div className="text-lg font-bold">{alert.balance} {alert.unit}</div>
                                    <div className="text-xs text-gray-500">Threshold: {alert.threshold} {alert.unit}</div>
                                </div>
                                <div className="mt-2 w-full bg-red-100 rounded-full h-2">
                                    <div 
                                        className="bg-red-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(alert.percentRemaining, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {initialSummary.map((item) => (
                    <Card key={item.type} className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium capitalize">{item.type}</CardTitle>
                            {getTrendIcon(item.trend)}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.balance} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></div>
                            <p className="text-xs text-muted-foreground">
                                Last activity: {new Date(item.lastActivity).toLocaleDateString()}
                            </p>
                            <p className={`text-xs mt-1 ${getTrendColor(item.trend)}`}>
                                {item.trend === 'up' ? 'Increasing' : item.trend === 'down' ? 'Decreasing' : 'Stable'}
                            </p>
                        </CardContent>
                    </Card>
                ))}
                {initialSummary.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                        No resources tracked yet.
                    </div>
                )}
            </div>

            {/* Consumption Trend Chart */}
            {Object.keys(chartData).length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Consumption Trends (30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={transformedChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Legend />
                                    {Object.keys(chartData).map((type, index) => (
                                        <Line
                                            key={type}
                                            type="monotone"
                                            dataKey="balance"
                                            stroke={["#16a34a", "#2563eb", "#d97706", "#dc2626"][index % 4]}
                                            name={type}
                                            data={chartData[type]}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary">Log Resource</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Resource Activity</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <label>Type</label>
                                <input
                                    className="border p-2 rounded w-full"
                                    placeholder="e.g. Chicken Feed"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Action</label>
                                <select
                                    className="border p-2 rounded w-full"
                                    value={formData.action}
                                    onChange={e => setFormData({ ...formData, action: e.target.value })}
                                >
                                    <option value="usage">Usage (Consume)</option>
                                    <option value="purchase">Purchase (Add)</option>
                                    <option value="adjustment">Adjustment</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="border p-2 rounded w-full"
                                        placeholder="0.00"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label>Unit</label>
                                    <input
                                        className="border p-2 rounded w-full"
                                        placeholder="lbs, gal, etc"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        required
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
                    <CardTitle>Resource History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialHistory.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium capitalize">{log.type}</TableCell>
                                    <TableCell className="capitalize">{log.action}</TableCell>
                                    <TableCell>{log.quantity} {log.unit}</TableCell>
                                    <TableCell>{log.notes || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {initialHistory.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No history logs found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
