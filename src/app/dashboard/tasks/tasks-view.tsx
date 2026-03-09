"use client";

import { useState } from "react";
import { Plus, Search, CheckCircle2, Clock, Calendar, AlertTriangle, MoreHorizontal, Edit, Trash2, History } from "lucide-react";
import { TaskWithCompletions, createTask, updateTask, deleteTask, completeTask, getTaskCompletionHistory, getTaskRecurrenceDescription } from "@/actions/tasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, cn } from "@/lib/utils";
import { CreateTaskSchema, CompleteTaskSchema } from "@/lib/validations";
import { z } from "zod";

interface TaskSections {
    overdue: TaskWithCompletions[];
    dueToday: TaskWithCompletions[];
    upcomingThisWeek: TaskWithCompletions[];
    later: TaskWithCompletions[];
}

interface Stats {
    overdueCount: number;
    dueTodayCount: number;
    completedThisWeek: number;
    upcomingThisWeekCount: number;
}

interface TasksViewProps {
    sections: TaskSections;
    stats: Stats;
}

const PRIORITIES = [
    { value: "low", label: "Low", color: "bg-blue-100 text-blue-800" },
    { value: "medium", label: "Medium", color: "bg-green-100 text-green-800" },
    { value: "high", label: "High", color: "bg-amber-100 text-amber-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];

const CATEGORIES = ["garden", "livestock", "equipment", "storage", "general"];

export function TasksView({ sections, stats }: TasksViewProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentTask, setCurrentTask] = useState<TaskWithCompletions | null>(null);
    const [completionHistory, setCompletionHistory] = useState<any[]>([]);
    const [recurrenceDesc, setRecurrenceDesc] = useState<string>("");

    // Forms
    const [formData, setFormData] = useState<Partial<z.infer<typeof CreateTaskSchema>>>({ priority: "medium" });
    const [completionData, setCompletionData] = useState<Partial<z.infer<typeof CompleteTaskSchema>>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setFormData({ priority: "medium" });
        setErrors({});
        setCompletionData({});
        setCurrentTask(null);
    };

    const handleCreate = async () => {
        try {
            setIsLoading(true);
            setErrors({});

            const payload: any = { ...formData };
            if (payload.nextDue) payload.nextDue = new Date(payload.nextDue);
            if (payload.estimatedMinutes) payload.estimatedMinutes = Number(payload.estimatedMinutes);

            const result = CreateTaskSchema.safeParse(payload);

            if (!result.success) {
                const fieldErrors: Record<string, string> = {};
                result.error.errors.forEach(err => {
                    if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
                });
                setErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            const response = await createTask(result.data);
            if (response.success) {
                setIsAddOpen(false);
                resetForm();
                window.location.reload();
            } else {
                setErrors({ form: response.error || "Failed to create task" });
            }
        } catch (e) {
            console.error(e);
            setErrors({ form: "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentTask) return;
        try {
            setIsLoading(true);
            setErrors({});

            const payload: any = { ...formData };
            if (payload.nextDue) payload.nextDue = new Date(payload.nextDue);
            if (payload.estimatedMinutes) payload.estimatedMinutes = Number(payload.estimatedMinutes);

            const result = CreateTaskSchema.partial().safeParse(payload);

            if (!result.success) {
                setIsLoading(false);
                return;
            }

            const response = await updateTask(currentTask.id, result.data);
            if (response.success) {
                setIsEditOpen(false);
                resetForm();
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!currentTask) return;
        try {
            setIsLoading(true);

            const payload: any = { ...completionData };
            if (payload.duration) payload.duration = Number(payload.duration);

            const result = CompleteTaskSchema.safeParse(payload);
            if (!result.success) {
                setIsLoading(false);
                return;
            }

            const response = await completeTask(currentTask.id, result.data);
            if (response.success) {
                setIsCompleteOpen(false);
                resetForm();
                window.location.reload();
            }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const openEdit = (task: TaskWithCompletions) => {
        setCurrentTask(task);
        setFormData({
            title: task.title,
            description: task.description || undefined,
            category: task.category || "",
            priority: task.priority as any,
            recurrenceRule: task.recurrenceRule || undefined,
            nextDue: task.nextDue ? new Date(task.nextDue) : undefined,
            estimatedMinutes: task.estimatedMinutes || undefined,
            assignedTo: task.assignedTo || undefined,
            notes: task.notes || undefined,
        });
        setIsEditOpen(true);
    };

    const openComplete = (task: TaskWithCompletions) => {
        setCurrentTask(task);
        setCompletionData({});
        setIsCompleteOpen(true);
    };

    const openHistory = async (task: TaskWithCompletions) => {
        setCurrentTask(task);
        const history = await getTaskCompletionHistory(task.id);
        setCompletionHistory(history);
        if (task.recurrenceRule) {
            const desc = await getTaskRecurrenceDescription(task.id);
            setRecurrenceDesc(desc || "");
        }
        setIsHistoryOpen(true);
    };

    const TaskCard = ({ task }: { task: TaskWithCompletions }) => (
        <div className="bg-white rounded-xl border border-soil-200 p-4 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => openComplete(task)}
                        className={cn(
                            "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            "border-soil-300 hover:border-forest-500 text-transparent hover:text-forest-500"
                        )}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                        <h3 className="text-lg font-semibold text-soil-900">{task.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-soil-500">
                            {task.category && (
                                <span className="capitalize px-2 py-0.5 bg-soil-100 rounded text-soil-700">{task.category}</span>
                            )}
                            {task.priority && (
                                <span className={cn("px-2 py-0.5 rounded capitalize", PRIORITIES.find(p => p.value === task.priority)?.color)}>
                                    {task.priority}
                                </span>
                            )}
                            {task.nextDue && (
                                <span className={cn("flex items-center gap-1", task.nextDue < new Date() ? "text-red-600 font-medium" : "")}>
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(task.nextDue)}
                                </span>
                            )}
                            {task.estimatedMinutes && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {task.estimatedMinutes}m
                                </span>
                            )}
                            {task.recurrenceRule && (
                                <span className="text-forest-600 font-medium flex items-center gap-1">
                                    <History className="w-3.5 h-3.5" />
                                    Recurring
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-soil-100 rounded-lg text-soil-500" onClick={() => openHistory(task)}>
                        <History className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-soil-100 rounded-lg text-soil-500" onClick={() => openEdit(task)}>
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    const Section = ({ title, tasks, icon: Icon, emptyMessage, colorClass }: any) => (
        <div className="space-y-3">
            <h2 className={cn("text-sm font-semibold uppercase tracking-wide flex items-center gap-2", colorClass)}>
                <Icon className="w-4 h-4" />
                {title} ({tasks.length})
            </h2>
            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-sm text-soil-500 bg-soil-50 rounded-lg p-4">{emptyMessage}</div>
                ) : (
                    tasks.map((task: TaskWithCompletions) => <TaskCard key={task.id} task={task} />)
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-soil-200">
                    <p className="text-xs font-semibold text-soil-500 uppercase">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-soil-200">
                    <p className="text-xs font-semibold text-soil-500 uppercase">Due Today</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.dueTodayCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-soil-200">
                    <p className="text-xs font-semibold text-soil-500 uppercase">This Week</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.upcomingThisWeekCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-soil-200">
                    <p className="text-xs font-semibold text-soil-500 uppercase">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedThisWeek}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-soil-900">Tasks & Chores</h1>
                    <p className="text-soil-600 mt-1">Manage daily chores, projects, and maintenance schedules</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <button className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            New Task
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Task Title</label>
                                    <input className="input mt-1" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v as any })}>
                                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea className="input mt-1 h-20 resize-none" value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Due Date</label>
                                    <input type="date" className="input mt-1"
                                        value={formData.nextDue instanceof Date ? formData.nextDue.toISOString().split('T')[0] : ""}
                                        onChange={e => setFormData({ ...formData, nextDue: e.target.value ? new Date(e.target.value) : undefined })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Est. Minutes</label>
                                    <input type="number" className="input mt-1" value={formData.estimatedMinutes || ""} onChange={e => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })} />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Recurrence Rule</label>
                                    <input className="input mt-1" placeholder="e.g. FREQ=WEEKLY;INTERVAL=1" value={formData.recurrenceRule || ""} onChange={e => setFormData({ ...formData, recurrenceRule: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <button className="btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                            <button className="btn-primary ml-2" onClick={handleCreate} disabled={isLoading}>{isLoading ? "Saving..." : "Create Task"}</button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Task Sections */}
            <div className="space-y-8">
                <Section
                    title="Overdue"
                    tasks={sections.overdue}
                    icon={AlertTriangle}
                    emptyMessage="No overdue tasks. Great job!"
                    colorClass="text-red-600"
                />
                <Section
                    title="Due Today"
                    tasks={sections.dueToday}
                    icon={Calendar}
                    emptyMessage="No tasks due today."
                    colorClass="text-amber-600"
                />
                <Section
                    title="Upcoming This Week"
                    tasks={sections.upcomingThisWeek}
                    icon={Clock}
                    emptyMessage="No tasks due this week."
                    colorClass="text-blue-600"
                />
                <Section
                    title="Later"
                    tasks={sections.later}
                    icon={CheckCircle2}
                    emptyMessage="No upcoming tasks."
                    colorClass="text-soil-600"
                />
            </div>

            {/* Completion Dialog */}
            <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Complete Task</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Actual Minutes Taken</label>
                            <input type="number" className="input mt-1"
                                value={completionData.duration || ""}
                                onChange={e => setCompletionData({ ...completionData, duration: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <textarea className="input mt-1"
                                value={completionData.notes || ""}
                                onChange={e => setCompletionData({ ...completionData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <button className="btn-secondary" onClick={() => setIsCompleteOpen(false)}>Cancel</button>
                        <button className="btn-primary ml-2" onClick={handleComplete} disabled={isLoading}>{isLoading ? "Completing..." : "Mark Complete"}</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Completion History: {currentTask?.title}</DialogTitle>
                        {recurrenceDesc && (
                            <p className="text-sm text-soil-500 mt-1">{recurrenceDesc}</p>
                        )}
                    </DialogHeader>
                    <div className="py-4 max-h-96 overflow-y-auto">
                        {completionHistory.length === 0 ? (
                            <p className="text-soil-500 text-center py-4">No completions yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {completionHistory.map((completion: any) => (
                                    <div key={completion.id} className="p-3 bg-soil-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-soil-900">{formatDate(completion.completedAt)}</span>
                                            {completion.duration && (
                                                <span className="text-sm text-soil-500">{completion.duration} min</span>
                                            )}
                                        </div>
                                        {completion.notes && (
                                            <p className="text-sm text-soil-600 mt-1">{completion.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
