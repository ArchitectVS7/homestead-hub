"use client";

import { useState } from "react";
import { createChecklist, createChecklistItem, toggleItem } from "@/actions/preparedness";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming exists, or I'll use standard HTML progress or div width
// I will use a simple div for progress if component missing.

type ChecklistItem = {
    id: string;
    title: string;
    isCompleted: boolean;
};

type Checklist = {
    id: string;
    name: string;
    category: string | null;
    items: ChecklistItem[];
};

export function PreparednessView({ checklists, readinessScore }: { checklists: Checklist[], readinessScore: number }) {
    const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);

    // Form states
    const [checklistForm, setChecklistForm] = useState({ name: "", category: "General" });
    const [itemForm, setItemForm] = useState({ title: "" });

    const handleCreateChecklist = async (e: React.FormEvent) => {
        e.preventDefault();
        await createChecklist(checklistForm);
        setIsChecklistDialogOpen(false);
        window.location.reload();
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChecklistId) return;
        await createChecklistItem({
            checklistId: selectedChecklistId,
            title: itemForm.title
        });
        setIsItemDialogOpen(false);
        window.location.reload();
    };

    const handleToggle = async (itemId: string, currentStatus: boolean) => {
        // Optimistic update could happen here, but for now simple reload
        await toggleItem(itemId, !currentStatus);
        window.location.reload();
    };

    const openAddItem = (checklistId: string) => {
        setSelectedChecklistId(checklistId);
        setIsItemDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Preparedness</h1>
                <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>New Checklist</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Checklist</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateChecklist} className="space-y-4">
                            <div className="grid gap-2">
                                <label>Name</label>
                                <input className="border p-2 rounded" value={checklistForm.name} onChange={e => setChecklistForm({ ...checklistForm, name: e.target.value })} required />
                            </div>
                            <div className="grid gap-2">
                                <label>Category</label>
                                <input className="border p-2 rounded" value={checklistForm.category} onChange={e => setChecklistForm({ ...checklistForm, category: e.target.value })} required />
                            </div>
                            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Readiness Score */}
            <Card>
                <CardHeader>
                    <CardTitle>Total Readiness Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="text-4xl font-bold text-primary">{readinessScore}%</div>
                        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${readinessScore}%` }} />
                        </div>
                        <p className="text-sm text-muted-foreground">Based on completion of all non-template checklist items.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Checklists */}
            <div className="grid gap-6 md:grid-cols-2">
                {checklists.map(list => {
                    const completed = list.items.filter(i => i.isCompleted).length;
                    const total = list.items.length;
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                        <Card key={list.id} className="flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{list.name}</CardTitle>
                                        <div className="text-sm text-muted-foreground">{list.category}</div>
                                    </div>
                                    <div className="font-bold text-sm">{percent}%</div>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-green-500 transition-all" style={{ width: `${percent}%` }} />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4 pt-4">
                                <div className="space-y-2">
                                    {list.items.map(item => (
                                        <div key={item.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={item.isCompleted}
                                                onChange={() => handleToggle(item.id, item.isCompleted)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <span className={item.isCompleted ? "line-through text-muted-foreground" : ""}>
                                                {item.title}
                                            </span>
                                        </div>
                                    ))}
                                    {list.items.length === 0 && <div className="text-sm text-muted-foreground italic">No items yet.</div>}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => openAddItem(list.id)} className="w-full mt-2">
                                    + Add Item
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Add Item Dialog */}
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Item to Checklist</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateItem} className="space-y-4">
                        <div className="grid gap-2">
                            <label>Title</label>
                            <input className="border p-2 rounded" value={itemForm.title} onChange={e => setItemForm({ title: e.target.value })} required />
                        </div>
                        <DialogFooter><Button type="submit">Add</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
