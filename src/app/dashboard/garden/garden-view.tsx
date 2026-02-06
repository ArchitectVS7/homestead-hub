"use client";

import { useState } from "react";
import { Plus, Sprout, Calendar as CalIcon, Grid, List, Leaf, Shovel, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, cn } from "@/lib/utils";
import { createCrop, createPlanting, logHarvest, deleteCrop, deletePlanting, PlantingWithCrop } from "@/actions/garden";
import { CreateCropSchema, CreatePlantingSchema } from "@/lib/validations";
import { z } from "zod";

interface Crop {
    id: string;
    name: string;
    variety: string | null;
    daysToMaturity: number | null;
}

interface GardenViewProps {
    initialCrops: Crop[];
    initialPlantings: PlantingWithCrop[];
}

export function GardenView({ initialCrops, initialPlantings }: GardenViewProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState<"garden" | "crops">("garden");

    const [isNewPlantingOpen, setIsNewPlantingOpen] = useState(false);
    const [isNewCropOpen, setIsNewCropOpen] = useState(false);
    const [isHarvestOpen, setIsHarvestOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedPlanting, setSelectedPlanting] = useState<PlantingWithCrop | null>(null);

    // Forms
    const [plantingData, setPlantingData] = useState<Partial<z.infer<typeof CreatePlantingSchema>>>({ quantity: 1 });
    const [cropData, setCropData] = useState<Partial<z.infer<typeof CreateCropSchema>>>({});
    const [harvestData, setHarvestData] = useState({ yieldQuantity: 0, yieldUnit: "lbs", notes: "" });

    const activePlantings = initialPlantings.filter(p => !p.actualHarvest);
    const harvestedPlantings = initialPlantings.filter(p => p.actualHarvest);

    const handleCreateCrop = async () => {
        try {
            setIsLoading(true);
            const payload: any = { ...cropData };
            if (payload.daysToMaturity) payload.daysToMaturity = parseInt(payload.daysToMaturity);

            const result = CreateCropSchema.safeParse(payload);
            if (!result.success) return; // Add error handling

            await createCrop(result.data);
            setIsNewCropOpen(false);
            setCropData({});
            window.location.reload();
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handleCreatePlanting = async () => {
        try {
            setIsLoading(true);
            const payload: any = { ...plantingData };
            if (payload.quantity) payload.quantity = parseInt(payload.quantity);
            if (payload.plantDate) payload.plantDate = new Date(payload.plantDate);
            if (payload.expectedHarvest) payload.expectedHarvest = new Date(payload.expectedHarvest);

            const result = CreatePlantingSchema.safeParse(payload);
            if (!result.success) return;

            await createPlanting(result.data);
            setIsNewPlantingOpen(false);
            setPlantingData({ quantity: 1 });
            window.location.reload();
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handleLogHarvest = async () => {
        if (!selectedPlanting) return;
        try {
            setIsLoading(true);
            await logHarvest(selectedPlanting.id, {
                actualHarvest: new Date(),
                yieldQuantity: Number(harvestData.yieldQuantity),
                yieldUnit: harvestData.yieldUnit,
                notes: harvestData.notes
            });
            setIsHarvestOpen(false);
            window.location.reload();
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-soil-900 flex items-center gap-3">
                        <Sprout className="w-8 h-8 text-forest-600" />
                        Garden Manager
                    </h1>
                    <p className="text-soil-600 mt-1">Track crops, plantings, and harvests</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === "garden" ? (
                        <button className="btn-primary flex items-center gap-2" onClick={() => setIsNewPlantingOpen(true)}>
                            <Shovel className="w-4 h-4" /> New Planting
                        </button>
                    ) : (
                        <button className="btn-primary flex items-center gap-2" onClick={() => setIsNewCropOpen(true)}>
                            <Plus className="w-4 h-4" /> Add Crop
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-soil-200">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab("garden")}
                        className={cn("whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm", activeTab === "garden" ? "border-forest-600 text-forest-600" : "border-transparent text-soil-500 hover:text-soil-700")}
                    >
                        Active Garden
                    </button>
                    <button onClick={() => setActiveTab("crops")}
                        className={cn("whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm", activeTab === "crops" ? "border-forest-600 text-forest-600" : "border-transparent text-soil-500 hover:text-soil-700")}
                    >
                        Crop Library
                    </button>
                </nav>
            </div>

            {activeTab === "garden" && (
                <>
                    <div className="flex justify-end gap-2 mb-4">
                        <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded hover:bg-soil-100", viewMode === "grid" && "bg-soil-100 text-forest-700")}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode("list")} className={cn("p-2 rounded hover:bg-soil-100", viewMode === "list" && "bg-soil-100 text-forest-700")}><List className="w-4 h-4" /></button>
                    </div>

                    <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                        {activePlantings.length === 0 && <div className="col-span-full text-center py-12 text-soil-500 bg-white rounded-xl border border-soil-200">No active plantings. Get growing!</div>}

                        {activePlantings.map(planting => (
                            <div key={planting.id} className="bg-white rounded-xl border border-soil-200 p-5 hover:shadow-md transition-all flex flex-col justify-between group h-full">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-soil-900 text-lg">{planting.crop.name}</h3>
                                            <p className="text-sm text-soil-500">{planting.crop.variety || "No variety"}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Growing</span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex justify-between text-soil-600">
                                            <span>Location:</span>
                                            <span className="font-medium text-soil-900">{planting.location}</span>
                                        </div>
                                        <div className="flex justify-between text-soil-600">
                                            <span>Planted:</span>
                                            <span>{formatDate(planting.plantDate)}</span>
                                        </div>
                                        <div className="flex justify-between text-soil-600">
                                            <span>Harvest:</span>
                                            <span className={cn(planting.expectedHarvest && planting.expectedHarvest <= new Date() ? "text-amber-600 font-bold" : "")}>
                                                {planting.expectedHarvest ? formatDate(planting.expectedHarvest) : "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-soil-600">
                                            <span>Quantity:</span>
                                            <span>{planting.quantity}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-soil-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="flex-1 btn-primary text-xs py-1.5 h-auto bg-amber-600 hover:bg-amber-700 border-transparent text-white"
                                        onClick={() => { setSelectedPlanting(planting); setIsHarvestOpen(true); }}
                                    >
                                        Log Harvest
                                    </button>
                                    {/* Edit/Delete placeholders */}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === "crops" && (
                <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-soil-50 text-soil-900 font-medium border-b border-soil-200">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Variety</th>
                                <th className="px-6 py-3">Days to Maturity</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-soil-100">
                            {initialCrops.map(crop => (
                                <tr key={crop.id} className="hover:bg-soil-50">
                                    <td className="px-6 py-3 font-medium">{crop.name}</td>
                                    <td className="px-6 py-3">{crop.variety || "-"}</td>
                                    <td className="px-6 py-3">{crop.daysToMaturity ? `${crop.daysToMaturity} days` : "-"}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button className="text-red-600 hover:text-red-800" onClick={() => deleteCrop(crop.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* NEW PLANTING DIALOG */}
            <Dialog open={isNewPlantingOpen} onOpenChange={setIsNewPlantingOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Planting</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Crop</label>
                            <Select onValueChange={v => setPlantingData({ ...plantingData, cropId: v })}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Select Crop" /></SelectTrigger>
                                <SelectContent>
                                    {initialCrops.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.variety ? `(${c.variety})` : ""}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Location (e.g., Bed 1)</label>
                            <input className="input mt-1" onChange={e => setPlantingData({ ...plantingData, location: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Date Planted</label>
                                <input type="date" className="input mt-1" onChange={e => setPlantingData({ ...plantingData, plantDate: e.target.value ? new Date(e.target.value) : undefined })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Quantity</label>
                                <input type="number" className="input mt-1" defaultValue={1} onChange={e => setPlantingData({ ...plantingData, quantity: parseInt(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsNewPlantingOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleCreatePlanting} disabled={isLoading}>{isLoading ? "Saving..." : "Plant"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* NEW CROP DIALOG */}
            <Dialog open={isNewCropOpen} onOpenChange={setIsNewCropOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Crop</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <input className="input mt-1" placeholder="e.g. Tomato" onChange={e => setCropData({ ...cropData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Variety</label>
                            <input className="input mt-1" placeholder="e.g. Cherokee Purple" onChange={e => setCropData({ ...cropData, variety: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Days to Maturity</label>
                            <input type="number" className="input mt-1" placeholder="e.g. 80" onChange={e => setCropData({ ...cropData, daysToMaturity: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsNewCropOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleCreateCrop} disabled={isLoading}>{isLoading ? "Saving..." : "Save Crop"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* HARVEST DIALOG */}
            <Dialog open={isHarvestOpen} onOpenChange={setIsHarvestOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log Harvest</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p className="text-sm text-soil-600">Harvesting <strong>{selectedPlanting?.crop.name}</strong> from <strong>{selectedPlanting?.location}</strong></p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Quantity</label>
                                <input type="number" className="input mt-1" onChange={e => setHarvestData({ ...harvestData, yieldQuantity: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Unit</label>
                                <Select defaultValue="lbs" onValueChange={v => setHarvestData({ ...harvestData, yieldUnit: v })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lbs">lbs</SelectItem>
                                        <SelectItem value="oz">oz</SelectItem>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="count">count</SelectItem>
                                        <SelectItem value="bunch">bunch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <textarea className="input mt-1 h-20" placeholder="Quality, issues, etc." onChange={e => setHarvestData({ ...harvestData, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsHarvestOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleLogHarvest} disabled={isLoading}>{isLoading ? "Saving..." : "Record Harvest"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
