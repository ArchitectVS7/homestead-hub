"use client";

import { useState } from "react";
import { logResource } from "@/actions/resources";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function ResourcesView({ initialSummary, initialHistory }: { initialSummary: ResourceSummary[], initialHistory: ResourceLog[] }) {
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Log Resource</Button>
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {initialSummary.map((item) => (
                    <div key={item.type} className="border rounded-xl p-4 bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium capitalize">{item.type}</h3>
                        </div>
                        <div className="pt-0">
                            <div className="text-2xl font-bold">{item.balance} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></div>
                            <p className="text-xs text-muted-foreground">
                                Last activity: {new Date(item.lastActivity).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
                {initialSummary.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                        No resources tracked yet.
                    </div>
                )}
            </div>

            <div className="border rounded-md">
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
            </div>
        </div>
    );
}
