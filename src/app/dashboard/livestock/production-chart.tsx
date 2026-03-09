"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity } from "lucide-react";

interface ProductionChartProps {
    data: Array<Record<string, any>>;
    title?: string;
}

export function ProductionChart({ data, title = "Production Trends" }: ProductionChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-soil-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-soil-400" />
                    <h3 className="font-semibold text-soil-900">{title}</h3>
                </div>
                <div className="flex items-center justify-center h-64 text-soil-500 text-sm">
                    No production data available for the selected period.
                </div>
            </div>
        );
    }

    // Get all production type keys (excluding 'date')
    const productionTypes = Array.from(
        new Set(data.flatMap(d => Object.keys(d).filter(k => k !== "date")))
    );

    // Color palette for different production types
    const colors = [
        "#16a34a", // forest-600 - green
        "#d97706", // harvest-600 - amber
        "#2563eb", // blue-600
        "#dc2626", // red-600
        "#9333ea", // purple-600
        "#0891b2", // cyan-600
    ];

    return (
        <div className="bg-white rounded-xl border border-soil-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-forest-600" />
                <h3 className="font-semibold text-soil-900">{title}</h3>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            {productionTypes.map((type, index) => (
                                <linearGradient key={type} id={`color-${type}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                            labelFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", { 
                                    weekday: "short", 
                                    month: "short", 
                                    day: "numeric" 
                                });
                            }}
                        />
                        <Legend />
                        {productionTypes.map((type, index) => (
                            <Area
                                key={type}
                                type="monotone"
                                dataKey={type}
                                stroke={colors[index % colors.length]}
                                fillOpacity={1}
                                fill={`url(#color-${type})`}
                                name={type}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/**
 * Simple bar chart for production by type summary
 */
export function ProductionByTypeChart({ data, title = "Production by Type" }: ProductionChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-soil-200 p-6">
                <h3 className="font-semibold text-soil-900 mb-4">{title}</h3>
                <div className="flex items-center justify-center h-48 text-soil-500 text-sm">
                    No data available.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-soil-200 p-6">
            <h3 className="font-semibold text-soil-900 mb-4">{title}</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                        />
                        <Bar dataKey="value" fill="#16a34a" name="Quantity" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
