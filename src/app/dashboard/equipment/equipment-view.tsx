"use client";

import { useState } from "react";
import { Plus, Wrench, AlertTriangle, CheckCircle2, MoreHorizontal, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, cn } from "@/lib/utils";
import { createEquipment, updateEquipment, logMaintenance, deleteEquipment, EquipmentWithMaintenance } from "@/actions/equipment";
import { CreateEquipmentSchema, CreateMaintenanceSchema } from "@/lib/validations";
import { z } from "zod";

interface EquipmentViewProps {
    initialEquipment: EquipmentWithMaintenance[];
    dueCount: number;
}

export function EquipmentView({ initialEquipment, dueCount }: EquipmentViewProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithMaintenance | null>(null);

    // Forms
    const [eqData, setEqData] = useState<Partial<z.infer<typeof CreateEquipmentSchema>>>({ status: "operational" });
    const [maintData, setMaintData] = useState<Partial<z.infer<typeof CreateMaintenanceSchema>>>({ type: "routine", date: new Date() });

    const handleCreate = async () => {
        try {
            setIsLoading(true);
            const payload: any = { ...eqData };
            if (payload.purchaseDate) payload.purchaseDate = new Date(payload.purchaseDate);
            if (payload.serviceIntervalDays) payload.serviceIntervalDays = parseInt(payload.serviceIntervalDays);
            if (payload.serviceIntervalHours) payload.serviceIntervalHours = parseInt(payload.serviceIntervalHours);
            if (payload.currentHours) payload.currentHours = parseInt(payload.currentHours);

            const result = CreateEquipmentSchema.safeParse(payload);
            if (!result.success) return;

            await createEquipment(result.data);
            setIsAddOpen(false);
            setEqData({ status: "operational" });
            window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogMaintenance = async () => {
        if (!selectedEquipment) return;
        try {
            setIsLoading(true);
            const payload: any = { ...maintData };
            if (payload.date) payload.date = new Date(payload.date);
            if (payload.cost) payload.cost = parseFloat(payload.cost);
            if (payload.hoursAtService) payload.hoursAtService = parseInt(payload.hoursAtService);

            const result = CreateMaintenanceSchema.safeParse(payload);
            if (!result.success) return;

            await logMaintenance(selectedEquipment.id, result.data);
            setIsLogOpen(false);
            setMaintData({ type: "routine", date: new Date() });
            window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const CATEGORIES = ["tractor", "mower", "vehicle", "tool", "generator", "other"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-soil-900 flex items-center gap-3">
                        <Wrench className="w-8 h-8 text-slate-600" />
                        Equipment & Tools
                    </h1>
                    <p className="text-soil-600 mt-1">Manage assets and maintenance schedules</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4" /> Add Equipment
                </button>
            </div>

            {dueCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{dueCount} equipment item{dueCount > 1 ? "s" : ""} due for service.</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-soil-50 text-soil-900 font-medium border-b border-soil-200">
                        <tr>
                            <th className="px-6 py-3">Asset Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Usage (Hrs)</th>
                            <th className="px-6 py-3">Last Service</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-soil-100">
                        {initialEquipment.map(item => (
                            <tr key={item.id} className="hover:bg-soil-50 group">
                                <td className="px-6 py-3 font-medium text-soil-900">
                                    {item.name}
                                    <div className="text-xs text-soil-500 font-normal">{item.model}</div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                        item.status === "operational" ? "bg-green-100 text-green-800" :
                                            item.status === "needs-service" ? "bg-amber-100 text-amber-800" :
                                                "bg-red-100 text-red-800"
                                    )}>
                                        {item.status.replace("-", " ")}
                                    </span>
                                </td>
                                <td className="px-6 py-3 capitalize">{item.category}</td>
                                <td className="px-6 py-3">{item.currentHours ? `${item.currentHours} hr` : "-"}</td>
                                <td className="px-6 py-3">
                                    {item.lastServiceDate ? formatDate(item.lastServiceDate) : "Never"}
                                </td>
                                <td className="px-6 py-3 text-right flex justify-end gap-2 items-center">
                                    <button
                                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-all"
                                        title="Log Maintenance"
                                        onClick={() => { setSelectedEquipment(item); setIsLogOpen(true); }}
                                    >
                                        <Wrench className="w-4 h-4" />
                                    </button>
                                    {/* More actions: Edit, Delete, View History */}
                                </td>
                            </tr>
                        ))}
                        {initialEquipment.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-soil-500">No equipment added yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* CREATE DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <input className="input mt-1" onChange={e => setEqData({ ...eqData, name: e.target.value })} placeholder="e.g. John Deere Tractor" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <Select onValueChange={v => setEqData({ ...eqData, category: v as any })}>
                                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select defaultValue="operational" onValueChange={v => setEqData({ ...eqData, status: v as any })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operational">Operational</SelectItem>
                                        <SelectItem value="needs-service">Needs Service</SelectItem>
                                        <SelectItem value="out-of-order">Out of Order</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Purchase Date</label>
                                <input type="date" className="input mt-1" onChange={e => setEqData({ ...eqData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Current Hours</label>
                                <input type="number" className="input mt-1" onChange={e => setEqData({ ...eqData, currentHours: parseInt(e.target.value) })} />
                            </div>
                        </div>

                        <div className="border-t border-soil-200 pt-4 mt-2">
                            <h4 className="text-sm font-semibold mb-2">Service Intervals</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-soil-600">Every X Hours</label>
                                    <input type="number" className="input mt-1" placeholder="e.g. 100" onChange={e => setEqData({ ...eqData, serviceIntervalHours: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-xs text-soil-600">Every X Days</label>
                                    <input type="number" className="input mt-1" placeholder="e.g. 365" onChange={e => setEqData({ ...eqData, serviceIntervalDays: parseInt(e.target.value) })} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleCreate} disabled={isLoading}>{isLoading ? "Saving..." : "Create Asset"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MAINTENANCE DIALOG */}
            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log Maintenance: {selectedEquipment?.name}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select defaultValue="routine" onValueChange={v => setMaintData({ ...maintData, type: v as any })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="routine">Routine Service</SelectItem>
                                        <SelectItem value="repair">Repair</SelectItem>
                                        <SelectItem value="inspection">Inspection</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <input type="date" className="input mt-1" onChange={e => setMaintData({ ...maintData, date: e.target.value ? new Date(e.target.value) : undefined })} defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Current Hours (at service)</label>
                            <input type="number" className="input mt-1" defaultValue={selectedEquipment?.currentHours || 0} onChange={e => setMaintData({ ...maintData, hoursAtService: parseInt(e.target.value) })} />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Cost</label>
                            <input type="number" className="input mt-1" onChange={e => setMaintData({ ...maintData, cost: parseFloat(e.target.value) })} placeholder="0.00" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea className="input mt-1 h-20" onChange={e => setMaintData({ ...maintData, description: e.target.value })} placeholder="What was done?" />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsLogOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleLogMaintenance} disabled={isLoading}>{isLoading ? "Saving..." : "Log Record"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
