"use client";

import { useState } from "react";
import { Plus, Activity, Egg, ArrowLeft, Syringe, History, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, cn } from "@/lib/utils";
import { addHealthRecord, logProduction } from "@/actions/livestock";
import { CreateHealthRecordSchema, CreateProductionLogSchema } from "@/lib/validations";
import { z } from "zod";

interface AnimalDetailViewProps {
    animal: any;
}

export function AnimalDetailView({ animal }: AnimalDetailViewProps) {
    const [isHealthOpen, setIsHealthOpen] = useState(false);
    const [isProdOpen, setIsProdOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [healthData, setHealthData] = useState<Partial<z.infer<typeof CreateHealthRecordSchema>>>({ type: "vaccination", date: new Date() });
    const [prodData, setProdData] = useState<Partial<z.infer<typeof CreateProductionLogSchema>>>({ date: new Date(), unit: "count" });

    // Calculate upcoming health reminders
    const upcomingReminders = animal.healthRecords?.filter((r: any) => {
        if (!r.nextDue) return false;
        const nextDue = new Date(r.nextDue);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return nextDue >= now && nextDue <= thirtyDaysFromNow;
    }).sort((a: any, b: any) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime()) || [];

    // Calculate days until next due
    const getDaysUntil = (dateString: string) => {
        const nextDue = new Date(dateString);
        const now = new Date();
        const diffTime = nextDue.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleHealth = async () => {
        try {
            setIsLoading(true);
            const payload: any = { ...healthData };
            if (payload.date) payload.date = new Date(payload.date);
            if (payload.nextDue) payload.nextDue = new Date(payload.nextDue);
            if (payload.cost) payload.cost = parseFloat(payload.cost);

            const result = CreateHealthRecordSchema.safeParse(payload);
            if (!result.success) return;

            await addHealthRecord(animal.id, result.data);
            setIsHealthOpen(false);
            setHealthData({ type: "vaccination", date: new Date() });
            window.location.reload();
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handleProd = async () => {
        try {
            setIsLoading(true);
            const payload: any = { ...prodData };
            if (payload.date) payload.date = new Date(payload.date);
            if (payload.quantity) payload.quantity = parseFloat(payload.quantity);

            const result = CreateProductionLogSchema.safeParse(payload);
            if (!result.success) return;

            await logProduction(animal.id, result.data);
            setIsProdOpen(false);
            setProdData({ date: new Date(), unit: "count" });
            window.location.reload();
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/livestock" className="p-2 hover:bg-soil-100 rounded-full text-soil-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-soil-900 flex items-center gap-2">
                        {animal.name}
                        <span className={cn("text-xs px-2 py-1 rounded-full border", animal.status === "active" ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500")}>
                            {animal.status}
                        </span>
                    </h1>
                    <p className="text-soil-600 capitalize">{animal.breed} {animal.type} • {animal.age || "Age unknown"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar Info */}
                <div className="bg-white p-6 rounded-xl border border-soil-200 space-y-4 h-fit">
                    <h3 className="font-semibold text-soil-900">Details</h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-soil-500">Sex</dt>
                            <dd className="font-medium capitalize">{animal.sex}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-soil-500">Neutered</dt>
                            <dd className="font-medium">{animal.isNeutered ? "Yes" : "No"}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-soil-500">Birth Date</dt>
                            <dd className="font-medium">{animal.birthDate ? formatDate(animal.birthDate) : "-"}</dd>
                        </div>
                        <div className="pt-4 border-t border-soil-100">
                            <dt className="text-soil-500 mb-1">Notes</dt>
                            <dd className="text-soil-900 italic">{animal.notes || "No notes."}</dd>
                        </div>
                    </dl>

                    <div className="pt-4 space-y-2">
                        <button className="btn-secondary w-full justify-center flex items-center gap-2" onClick={() => setIsHealthOpen(true)}>
                            <Syringe className="w-4 h-4" /> Add Health Record
                        </button>
                        <button className="btn-secondary w-full justify-center flex items-center gap-2" onClick={() => setIsProdOpen(true)}>
                            <Egg className="w-4 h-4" /> Log Production
                        </button>
                    </div>
                </div>

                {/* Feeding/Production/Health Lists */}
                <div className="md:col-span-2 space-y-6">
                    {/* Health Reminders */}
                    {upcomingReminders.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                <h3 className="font-semibold text-amber-900">Upcoming Health Reminders</h3>
                            </div>
                            <div className="space-y-2">
                                {upcomingReminders.map((reminder: any) => {
                                    const daysUntil = getDaysUntil(reminder.nextDue);
                                    const isUrgent = daysUntil <= 7;
                                    return (
                                        <div key={reminder.id} className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border",
                                            isUrgent ? "bg-red-50 border-red-200" : "bg-white border-amber-100"
                                        )}>
                                            <div>
                                                <p className="font-medium text-soil-900 capitalize">{reminder.type} - {reminder.description}</p>
                                                <p className="text-sm text-soil-500">Due: {formatDate(reminder.nextDue)}</p>
                                            </div>
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-sm font-medium",
                                                isUrgent ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                                            )}>
                                                {daysUntil === 0 ? "Due today!" : `${daysUntil} days`}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Lineage Section */}
                    {(animal.parent || animal.offspring?.length > 0) && (
                        <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
                            <div className="bg-soil-50 px-6 py-3 border-b border-soil-200 font-semibold text-soil-900 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Lineage
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Parent */}
                                {animal.parent && (
                                    <div>
                                        <h4 className="text-sm font-medium text-soil-500 uppercase mb-2">Parent</h4>
                                        <Link
                                            href={`/dashboard/livestock/${animal.parent.id}`}
                                            className="block p-3 rounded-lg border border-soil-200 hover:border-forest-300 hover:bg-forest-50 transition-colors"
                                        >
                                            <p className="font-medium text-soil-900">{animal.parent.name}</p>
                                            <p className="text-sm text-soil-500 capitalize">{animal.parent.breed} {animal.parent.type}</p>
                                        </Link>
                                    </div>
                                )}
                                {/* Offspring */}
                                {animal.offspring && animal.offspring.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-soil-500 uppercase mb-2">
                                            Offspring ({animal.offspring.length})
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {animal.offspring.map((offspring: any) => (
                                                <Link
                                                    key={offspring.id}
                                                    href={`/dashboard/livestock/${offspring.id}`}
                                                    className="block p-2 rounded-lg border border-soil-200 hover:border-forest-300 hover:bg-forest-50 transition-colors"
                                                >
                                                    <p className="font-medium text-soil-900 text-sm">{offspring.name}</p>
                                                    <p className="text-xs text-soil-500 capitalize">{offspring.breed} {offspring.type}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Production Stats */}
                    <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
                        <div className="bg-soil-50 px-6 py-3 border-b border-soil-200 font-semibold text-soil-900 flex justify-between items-center">
                            <span>Recent Production</span>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white border-b border-soil-100 text-soil-500">
                                <tr><th className="px-6 py-2">Date</th><th className="px-6 py-2">Type</th><th className="px-6 py-2">Qty</th><th className="px-6 py-2">Notes</th></tr>
                            </thead>
                            <tbody className="divide-y divide-soil-100">
                                {animal.productionLogs.map((log: any) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-3">{formatDate(log.date)}</td>
                                        <td className="px-6 py-3 capitalize">{log.type}</td>
                                        <td className="px-6 py-3">{log.quantity} {log.unit}</td>
                                        <td className="px-6 py-3 text-soil-500 truncate max-w-xs">{log.notes || "-"}</td>
                                    </tr>
                                ))}
                                {animal.productionLogs.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-soil-500">No production logs yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {/* Health Records */}
                    <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
                        <div className="bg-soil-50 px-6 py-3 border-b border-soil-200 font-semibold text-soil-900 flex justify-between items-center">
                            <span>Health History</span>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white border-b border-soil-100 text-soil-500">
                                <tr><th className="px-6 py-2">Date</th><th className="px-6 py-2">Type</th><th className="px-6 py-2">Details</th><th className="px-6 py-2">Next Due</th></tr>
                            </thead>
                            <tbody className="divide-y divide-soil-100">
                                {animal.healthRecords.map((rec: any) => (
                                    <tr key={rec.id}>
                                        <td className="px-6 py-3">{formatDate(rec.date)}</td>
                                        <td className="px-6 py-3 capitalize">{rec.type}</td>
                                        <td className="px-6 py-3">
                                            {rec.medication && <span className="font-medium text-soil-900">{rec.medication} </span>}
                                            {rec.dosage && <span className="text-soil-500">({rec.dosage})</span>}
                                            <div className="text-xs text-soil-500">{rec.description}</div>
                                        </td>
                                        <td className="px-6 py-3">{rec.nextDue ? formatDate(rec.nextDue) : "-"}</td>
                                    </tr>
                                ))}
                                {animal.healthRecords.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-soil-500">No health records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* HEALTH DIALOG */}
            <Dialog open={isHealthOpen} onOpenChange={setIsHealthOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Health Record</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select defaultValue="vaccination" onValueChange={v => setHealthData({ ...healthData, type: v as any })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vaccination">Vaccination</SelectItem>
                                        <SelectItem value="medication">Medication</SelectItem>
                                        <SelectItem value="checkup">Vet Checkup</SelectItem>
                                        <SelectItem value="injury">Injury Treatment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <input type="date" className="input mt-1" defaultValue={new Date().toISOString().split('T')[0]} onChange={e => setHealthData({ ...healthData, date: e.target.value ? new Date(e.target.value) : undefined })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <input className="input mt-1" onChange={e => setHealthData({ ...healthData, description: e.target.value })} placeholder="e.g. Annual rabies shot" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Medication</label>
                                <input className="input mt-1" onChange={e => setHealthData({ ...healthData, medication: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Dosage</label>
                                <input className="input mt-1" onChange={e => setHealthData({ ...healthData, dosage: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Next Due (Optional)</label>
                            <input type="date" className="input mt-1" onChange={e => setHealthData({ ...healthData, nextDue: e.target.value ? new Date(e.target.value) : undefined })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsHealthOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleHealth} disabled={isLoading}>{isLoading ? "Saving..." : "Save Record"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PRODUCTION DIALOG */}
            <Dialog open={isProdOpen} onOpenChange={setIsProdOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log Production</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Type</label>
                            <input className="input mt-1" placeholder="e.g. Eggs, Milk, Wool" onChange={e => setProdData({ ...prodData, type: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Quantity</label>
                                <input type="number" className="input mt-1" onChange={e => setProdData({ ...prodData, quantity: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Unit</label>
                                <Select defaultValue="count" onValueChange={v => setProdData({ ...prodData, unit: v })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="count">Count</SelectItem>
                                        <SelectItem value="lbs">lbs</SelectItem>
                                        <SelectItem value="gal">Gallons</SelectItem>
                                        <SelectItem value="oz">oz</SelectItem>
                                        <SelectItem value="liter">Liter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Date</label>
                            <input type="date" className="input mt-1" defaultValue={new Date().toISOString().split('T')[0]} onChange={e => setProdData({ ...prodData, date: e.target.value ? new Date(e.target.value) : undefined })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsProdOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleProd} disabled={isLoading}>{isLoading ? "Saving..." : "Log Production"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
