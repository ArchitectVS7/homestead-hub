"use client";

import { useState } from "react";
import { Plus, Egg, Activity, HeartPulse, Download } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { createAnimal, Animal } from "@/actions/livestock";
import { CreateAnimalSchema } from "@/lib/validations";
import { z } from "zod";
import { ProductionChart, ProductionByTypeChart } from "./production-chart";

interface LivestockViewProps {
    initialAnimals: Animal[];
    productionStats: Record<string, number>;
    chartData: Array<Record<string, any>>;
    productionByType: Array<{ name: string; value: number; unit: string }>;
}

export function LivestockView({ initialAnimals, productionStats, chartData, productionByType }: LivestockViewProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadCsv = async () => {
        setIsDownloading(true);
        try {
            const res = await fetch("/api/export?module=livestock");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "livestock.csv";
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("CSV export failed", e);
        } finally {
            setIsDownloading(false);
        }
    };

    const [animalData, setAnimalData] = useState<Partial<z.infer<typeof CreateAnimalSchema>>>({ sex: "female", status: "active", isNeutered: false });

    const handleCreate = async () => {
        try {
            setIsLoading(true);
            const payload: any = { ...animalData };
            if (payload.birthDate) payload.birthDate = new Date(payload.birthDate);

            const result = CreateAnimalSchema.safeParse(payload);
            if (!result.success) return;

            await createAnimal(result.data);
            setIsAddOpen(false);
            setAnimalData({ sex: "female", status: "active", isNeutered: false });
            window.location.reload();
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const TYPES = ["chicken", "goat", "cow", "pig", "sheep", "rabbit", "duck"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-soil-900 flex items-center gap-3">
                        <Egg className="w-8 h-8 text-amber-600" />
                        Livestock
                    </h1>
                    <p className="text-soil-600 mt-1">Manage animals, health records, and production</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={downloadCsv}
                        disabled={isDownloading}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {isDownloading ? "Exporting…" : "Export CSV"}
                    </button>
                    <button className="btn-primary flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
                        <Plus className="w-4 h-4" /> Add Animal
                    </button>
                </div>
            </div>

            {/* Production Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(productionStats).map(([key, value]) => (
                    <div key={key} className="bg-white p-4 rounded-xl border border-soil-200">
                        <p className="text-xs font-semibold text-soil-500 uppercase">{key}</p>
                        <h3 className="text-2xl font-bold text-soil-900">{value}</h3>
                        <p className="text-xs text-soil-400">Last 30 days</p>
                    </div>
                ))}
                {Object.keys(productionStats).length === 0 && (
                    <div className="col-span-full text-sm text-soil-500 bg-soil-50 p-4 rounded-xl">No production logs in last 30 days.</div>
                )}
            </div>

            {/* Production Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductionChart data={chartData} title="Production Trends (30 Days)" />
                <ProductionByTypeChart data={productionByType} title="Production by Type" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialAnimals.map(animal => (
                    <Link key={animal.id} href={`/dashboard/livestock/${animal.id}`} className="block group">
                        <div className="bg-white rounded-xl border border-soil-200 p-5 hover:shadow-md transition-all h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-soil-900 text-lg group-hover:text-forest-700 transition-colors">{animal.name}</h3>
                                    <p className="text-sm text-soil-500 capitalize">{animal.breed} {animal.type}</p>
                                </div>
                                <span className="bg-soil-100 text-soil-700 text-xs px-2 py-1 rounded capitalize">{animal.sex}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-soil-100 flex items-center justify-between text-sm text-soil-500">
                                <span>Born: {animal.birthDate ? formatDate(animal.birthDate) : "Unknown"}</span>
                                <span className="flex items-center gap-1 text-forest-600 font-medium">View Details &rarr;</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {initialAnimals.length === 0 && (
                    <div className="col-span-full py-12 text-center text-soil-500 bg-white rounded-xl border border-soil-200">
                        No animals found. Add one to get started.
                    </div>
                )}
            </div>

            {/* CREATE DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Animal</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Name / Tag</label>
                            <input className="input mt-1" onChange={e => setAnimalData({ ...animalData, name: e.target.value })} placeholder="e.g. Bessie" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select onValueChange={v => setAnimalData({ ...animalData, type: v as any })}>
                                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        {TYPES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Sex</label>
                                <Select defaultValue="female" onValueChange={v => setAnimalData({ ...animalData, sex: v as any })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Breed</label>
                            <input className="input mt-1" onChange={e => setAnimalData({ ...animalData, breed: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Birth Date</label>
                            <input type="date" className="input mt-1" onChange={e => setAnimalData({ ...animalData, birthDate: e.target.value ? new Date(e.target.value) : undefined })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleCreate} disabled={isLoading}>{isLoading ? "Saving..." : "Add Animal"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
