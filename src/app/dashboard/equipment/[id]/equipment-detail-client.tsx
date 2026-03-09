"use client";

import { useState } from "react";
import { Wrench, ArrowLeft, Calendar, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, cn } from "@/lib/utils";
import { logMaintenance, updateEquipment } from "@/actions/equipment";
import { CreateMaintenanceSchema } from "@/lib/validations";
import { z } from "zod";

interface MaintenanceRecord {
    id: string;
    date: string;
    type: string;
    description: string;
    cost: number | null;
    hoursAtService: number | null;
}

interface Equipment {
    id: string;
    name: string;
    category: string;
    model: string | null;
    serialNumber: string | null;
    purchaseDate: string | null;
    serviceIntervalHours: number | null;
    serviceIntervalDays: number | null;
    lastServiceDate: string | null;
    lastServiceHours: number | null;
    currentHours: number | null;
    status: string;
    notes: string | null;
    maintenanceRecords: MaintenanceRecord[];
}

interface EquipmentDetailClientProps {
    equipment: Equipment;
    stats: {
        totalRecords: number;
        totalCost: number;
        averageCost: number;
        lastServiceDate: Date | null;
        lastServiceType: string | null;
    };
    serviceDueStatus: {
        isDue: boolean;
        reason: string | null;
        daysOverdue: number;
        hoursOverdue: number;
    };
}

export function EquipmentDetailClient({ equipment, stats, serviceDueStatus }: EquipmentDetailClientProps) {
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [maintData, setMaintData] = useState<Partial<z.infer<typeof CreateMaintenanceSchema>>>({
        type: "routine",
        date: new Date(),
    });

    const [editData, setEditData] = useState({
        name: equipment.name,
        model: equipment.model || "",
        serialNumber: equipment.serialNumber || "",
        currentHours: equipment.currentHours?.toString() || "",
        status: equipment.status,
        notes: equipment.notes || "",
    });

    const handleLogMaintenance = async () => {
        try {
            setIsLoading(true);
            const payload: any = { ...maintData };
            if (payload.date) payload.date = new Date(payload.date);
            if (payload.cost) payload.cost = parseFloat(payload.cost);
            if (payload.hoursAtService) payload.hoursAtService = parseInt(payload.hoursAtService);

            const result = CreateMaintenanceSchema.safeParse(payload);
            if (!result.success) return;

            await logMaintenance(equipment.id, result.data);
            setIsLogOpen(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            await updateEquipment(equipment.id, {
                name: editData.name,
                model: editData.model || undefined,
                serialNumber: editData.serialNumber || undefined,
                currentHours: editData.currentHours ? parseInt(editData.currentHours) : undefined,
                status: editData.status as "operational" | "needs-service" | "out-of-order",
                notes: editData.notes || undefined,
            });
            setIsEditOpen(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            operational: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
            "needs-service": { bg: "bg-amber-100", text: "text-amber-800", icon: AlertTriangle },
            "out-of-order": { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
        };
        const { bg, text, icon: Icon } = config[status as keyof typeof config] || config.operational;
        return (
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5", bg, text)}>
                <Icon className="w-4 h-4" />
                {status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const config = {
            routine: "bg-blue-100 text-blue-800",
            repair: "bg-red-100 text-red-800",
            inspection: "bg-purple-100 text-purple-800",
        };
        return config[type as keyof typeof config] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-soil-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-soil-900 flex items-center gap-3">
                        <Wrench className="w-8 h-8 text-slate-600" />
                        {equipment.name}
                    </h1>
                    <p className="text-soil-600 mt-1">{equipment.model || "No model specified"}</p>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(equipment.status)}
                    <button className="btn-secondary" onClick={() => setIsEditOpen(true)}>Edit</button>
                </div>
            </div>

            {/* Service Alert */}
            {serviceDueStatus.isDue && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Service Due</p>
                        <p className="text-sm">{serviceDueStatus.reason}</p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-soil-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-soil-600">Total Services</p>
                            <p className="text-2xl font-bold text-soil-900">{stats.totalRecords}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-soil-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-soil-600">Total Cost</p>
                            <p className="text-2xl font-bold text-soil-900">${stats.totalCost.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-soil-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-soil-600">Avg Cost</p>
                            <p className="text-2xl font-bold text-soil-900">${stats.averageCost.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-soil-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-soil-600">Current Hours</p>
                            <p className="text-2xl font-bold text-soil-900">{equipment.currentHours || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Equipment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-soil-200 p-6">
                    <h3 className="font-semibold text-soil-900 mb-4">Equipment Details</h3>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-soil-600">Category</dt>
                            <dd className="font-medium capitalize">{equipment.category}</dd>
                        </div>
                        {equipment.serialNumber && (
                            <div className="flex justify-between">
                                <dt className="text-soil-600">Serial Number</dt>
                                <dd className="font-medium">{equipment.serialNumber}</dd>
                            </div>
                        )}
                        {equipment.purchaseDate && (
                            <div className="flex justify-between">
                                <dt className="text-soil-600">Purchase Date</dt>
                                <dd className="font-medium">{formatDate(equipment.purchaseDate)}</dd>
                            </div>
                        )}
                        {equipment.serviceIntervalDays && (
                            <div className="flex justify-between">
                                <dt className="text-soil-600">Service Interval (Days)</dt>
                                <dd className="font-medium">{equipment.serviceIntervalDays} days</dd>
                            </div>
                        )}
                        {equipment.serviceIntervalHours && (
                            <div className="flex justify-between">
                                <dt className="text-soil-600">Service Interval (Hours)</dt>
                                <dd className="font-medium">{equipment.serviceIntervalHours} hours</dd>
                            </div>
                        )}
                        {equipment.lastServiceDate && (
                            <div className="flex justify-between">
                                <dt className="text-soil-600">Last Service</dt>
                                <dd className="font-medium">{formatDate(equipment.lastServiceDate)}</dd>
                            </div>
                        )}
                        {equipment.notes && (
                            <div>
                                <dt className="text-soil-600 mb-1">Notes</dt>
                                <dd className="text-soil-700">{equipment.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Last Service Summary */}
                <div className="bg-white rounded-xl border border-soil-200 p-6">
                    <h3 className="font-semibold text-soil-900 mb-4">Last Service Summary</h3>
                    {stats.lastServiceDate ? (
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-soil-600">Date</dt>
                                <dd className="font-medium">{formatDate(stats.lastServiceDate)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-soil-600">Type</dt>
                                <dd className="font-medium capitalize">{stats.lastServiceType}</dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="text-soil-500">No service records yet.</p>
                    )}
                </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-soil-200">
                    <h3 className="font-semibold text-soil-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Maintenance History
                    </h3>
                    <button className="btn-primary text-sm" onClick={() => setIsLogOpen(true)}>
                        <Wrench className="w-4 h-4 inline mr-1" />
                        Log Service
                    </button>
                </div>
                {equipment.maintenanceRecords.length === 0 ? (
                    <div className="p-8 text-center text-soil-500">
                        No maintenance records. Log the first service to track maintenance history.
                    </div>
                ) : (
                    <div className="divide-y divide-soil-100">
                        {equipment.maintenanceRecords.map((record, index) => (
                            <div key={record.id} className="p-4 hover:bg-soil-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getTypeBadge(record.type))}>
                                                {record.type}
                                            </span>
                                            <span className="text-sm text-soil-600">{formatDate(record.date)}</span>
                                            {index === 0 && (
                                                <span className="px-2 py-0.5 bg-forest-100 text-forest-800 rounded text-xs font-medium">
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-soil-700">{record.description}</p>
                                        {record.hoursAtService !== null && (
                                            <p className="text-sm text-soil-500 mt-1">
                                                Hours at service: {record.hoursAtService}
                                            </p>
                                        )}
                                    </div>
                                    {record.cost !== null && record.cost > 0 && (
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-soil-900">${record.cost.toFixed(2)}</p>
                                            <p className="text-xs text-soil-500">Cost</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Log Maintenance Dialog */}
            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log Maintenance: {equipment.name}</DialogTitle></DialogHeader>
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
                                <input
                                    type="date"
                                    className="input mt-1"
                                    onChange={e => setMaintData({ ...maintData, date: e.target.value ? new Date(e.target.value) : undefined })}
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Hours at Service</label>
                            <input
                                type="number"
                                className="input mt-1"
                                defaultValue={equipment.currentHours || 0}
                                onChange={e => setMaintData({ ...maintData, hoursAtService: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Cost</label>
                            <input
                                type="number"
                                className="input mt-1"
                                onChange={e => setMaintData({ ...maintData, cost: parseFloat(e.target.value) })}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                className="input mt-1 h-20"
                                onChange={e => setMaintData({ ...maintData, description: e.target.value })}
                                placeholder="What was done?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsLogOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleLogMaintenance} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Log Record"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Equipment Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Equipment</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <input
                                className="input mt-1"
                                defaultValue={editData.name}
                                onChange={e => setEditData({ ...editData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Model</label>
                                <input
                                    className="input mt-1"
                                    defaultValue={editData.model}
                                    onChange={e => setEditData({ ...editData, model: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Serial Number</label>
                                <input
                                    className="input mt-1"
                                    defaultValue={editData.serialNumber}
                                    onChange={e => setEditData({ ...editData, serialNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Current Hours</label>
                                <input
                                    type="number"
                                    className="input mt-1"
                                    defaultValue={editData.currentHours}
                                    onChange={e => setEditData({ ...editData, currentHours: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select defaultValue={editData.status} onValueChange={v => setEditData({ ...editData, status: v })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operational">Operational</SelectItem>
                                        <SelectItem value="needs-service">Needs Service</SelectItem>
                                        <SelectItem value="out-of-order">Out of Order</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <textarea
                                className="input mt-1 h-20"
                                defaultValue={editData.notes}
                                onChange={e => setEditData({ ...editData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleUpdate} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
