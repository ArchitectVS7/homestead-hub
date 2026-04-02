"use client";

import { useState } from "react";
import { Plus, Search, Filter, AlertTriangle, Edit, Trash2, Download } from "lucide-react";
import { StorageItem, createStorageItem, updateStorageItem, deleteStorageItem } from "@/actions/storage";
import { DataTable } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, daysUntil, cn } from "@/lib/utils";
import { CreateStorageItemSchema } from "@/lib/validations";
import { z } from "zod";

interface StorageViewProps {
    initialItems: StorageItem[];
    expiringItems: StorageItem[];
}

const CATEGORIES = [
    "grains", "legumes", "canned", "freeze-dried", "dehydrated", "frozen", "fresh", "water", "other"
];

const UNITS = [
    "lbs", "oz", "kg", "g", "gallons", "liters", "cans", "bags", "boxes", "count"
];

export function StorageView({ initialItems, expiringItems }: StorageViewProps) {
    const [items, setItems] = useState(initialItems);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<StorageItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadCsv = async () => {
        setIsDownloading(true);
        try {
            const res = await fetch("/api/export?module=storage");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "storage-inventory.csv";
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("CSV export failed", e);
        } finally {
            setIsDownloading(false);
        }
    };

    // Form states
    const [formData, setFormData] = useState<Partial<z.infer<typeof CreateStorageItemSchema>>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Client-side filtering
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const resetForm = () => {
        setFormData({});
        setErrors({});
        setCurrentItem(null);
    };

    const handleCreate = async () => {
        try {
            setIsLoading(true);
            setErrors({});

            // Parse dates from strings if necessary
            const payload: any = { ...formData };
            if (payload.quantity) payload.quantity = Number(payload.quantity);
            if (payload.calories) payload.calories = Number(payload.calories);
            if (payload.purchaseDate) payload.purchaseDate = new Date(payload.purchaseDate);
            if (payload.expirationDate) payload.expirationDate = new Date(payload.expirationDate);

            const result = CreateStorageItemSchema.safeParse(payload);

            if (!result.success) {
                const fieldErrors: Record<string, string> = {};
                result.error.errors.forEach(err => {
                    if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
                });
                setErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            const response = await createStorageItem(result.data);
            if (response.success) {
                setIsAddOpen(false);
                resetForm();
                // Ideally re-fetch or optimistically update. For now rely on server revalidation refresh
                window.location.reload();
            } else {
                setErrors({ form: response.error || "Failed to create item" });
            }
        } catch (e) {
            console.error(e);
            setErrors({ form: "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentItem) return;

        try {
            setIsLoading(true);
            setErrors({});

            const payload: any = { ...formData };
            if (payload.quantity) payload.quantity = Number(payload.quantity);
            if (payload.calories) payload.calories = Number(payload.calories);
            if (payload.purchaseDate) payload.purchaseDate = new Date(payload.purchaseDate);
            if (payload.expirationDate) payload.expirationDate = new Date(payload.expirationDate);

            const result = CreateStorageItemSchema.partial().safeParse(payload);

            if (!result.success) {
                const fieldErrors: Record<string, string> = {};
                result.error.errors.forEach(err => {
                    if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
                });
                setErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            const response = await updateStorageItem(currentItem.id, result.data);
            if (response.success) {
                setIsEditOpen(false);
                resetForm();
                window.location.reload();
            } else {
                setErrors({ form: response.error || "Failed to update item" });
            }
        } catch (e) {
            console.error(e);
            setErrors({ form: "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteStorageItem(id);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Failed to delete item");
        }
    };

    const openEdit = (item: StorageItem) => {
        setCurrentItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            location: item.location || undefined,
            purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
            expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
            calories: item.calories || undefined,
            notes: item.notes || undefined,
        });
        setIsEditOpen(true);
    };

    const getExpirationBadge = (date: Date | null) => {
        if (!date) return null;
        const days = daysUntil(date);

        if (days < 7) {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Expiring in {days} days</span>;
        }
        if (days < 30) {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Expiring in {days} days</span>;
        }
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{formatDate(date)}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-soil-900 flex items-center gap-3">
                        Food Storage
                    </h1>
                    <p className="text-soil-600 mt-1">
                        Track inventory, expiration dates, and rotation schedules
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={downloadCsv}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 border border-soil-300 text-soil-700 px-4 py-2.5 rounded-lg hover:bg-soil-50 transition font-medium disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {isDownloading ? "Exporting…" : "Export CSV"}
                    </button>
                    <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <button className="inline-flex items-center gap-2 bg-forest-600 text-white px-4 py-2.5 rounded-lg hover:bg-forest-700 transition font-medium">
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add Storage Item</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-soil-900">Name</label>
                                    <input
                                        className="input w-full mt-1"
                                        placeholder="e.g. White Rice"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-soil-900">Category</label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-soil-900">Location</label>
                                    <input
                                        className="input w-full mt-1"
                                        placeholder="e.g. Pantry"
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-soil-900">Quantity</label>
                                    <input
                                        type="number"
                                        className="input w-full mt-1"
                                        placeholder="0"
                                        value={formData.quantity || ""}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                    />
                                    {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-soil-900">Unit</label>
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(val) => setFormData({ ...formData, unit: val })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UNITS.map(unit => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.unit && <p className="text-xs text-red-600 mt-1">{errors.unit}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-soil-900">Purchase Date</label>
                                    <input
                                        type="date"
                                        className="input w-full mt-1"
                                        value={formData.purchaseDate ? formData.purchaseDate.toISOString().split('T')[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-soil-900">Expiration Date</label>
                                    <input
                                        type="date"
                                        className="input w-full mt-1"
                                        value={formData.expirationDate ? formData.expirationDate.toISOString().split('T')[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value ? new Date(e.target.value) : undefined })}
                                    />
                                </div>
                            </div>
                            {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
                        </div>
                        <DialogFooter>
                            <button
                                className="btn-secondary px-4 py-2 rounded-lg"
                                onClick={() => setIsAddOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary px-4 py-2 rounded-lg ml-2"
                                onClick={handleCreate}
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Item"}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Storage Item</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Same form fields as Create - simplified for brevity, in real app would componentize */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-soil-900">Name</label>
                                <input
                                    className="input w-full mt-1"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-soil-900">Quantity</label>
                                <input
                                    type="number"
                                    className="input w-full mt-1"
                                    value={formData.quantity || ""}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-soil-900">Expiration Date</label>
                                <input
                                    type="date"
                                    className="input w-full mt-1"
                                    value={formData.expirationDate instanceof Date ? formData.expirationDate.toISOString().split('T')[0] : ""}
                                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value ? new Date(e.target.value) : undefined })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary px-4 py-2 rounded-lg" onClick={() => setIsEditOpen(false)}>Cancel</button>
                        <button className="btn-primary px-4 py-2 rounded-lg ml-2" onClick={handleUpdate} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Update Item"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-soil-400" />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-soil-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Alert banner */}
            {expiringItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">{expiringItems.length} items expiring within 30 days</p>
                        <p className="text-sm text-amber-600 mt-0.5">
                            Review and rotate stock to prevent waste
                        </p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <DataTable
                data={filteredItems}
                keyExtractor={(item) => item.id}
                columns={[
                    { header: "Name", accessorKey: "name", className: "font-medium text-soil-900" },
                    { header: "Category", accessorKey: "category", cell: (item) => <span className="capitalize">{item.category}</span> },
                    { header: "Quantity", cell: (item) => `${item.quantity} ${item.unit}` },
                    { header: "Location", accessorKey: "location" },
                    { header: "Expiration", cell: (item) => getExpirationBadge(item.expirationDate) },
                    {
                        header: "Actions", cell: (item) => (
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-1 hover:bg-soil-100 rounded text-soil-500 hover:text-forest-600">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1 hover:bg-soil-100 rounded text-soil-500 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
}
