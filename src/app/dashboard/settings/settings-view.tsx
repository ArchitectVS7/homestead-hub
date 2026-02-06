"use client";

import { useState } from "react";
import { Save, Loader2, MapPin, Ruler, Trash2, AlertTriangle } from "lucide-react";
import { updateSettings } from "@/actions/settings";
import { changePIN } from "@/actions/auth";
import { removeStarterData, loadStarterData } from "@/actions/onboarding";
import { UpdateSettingsSchema, ChangePINSchema } from "@/lib/validations";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Settings {
    id: string;
    hardinessZone: string | null;
    zipCode: string | null;
    latitude: number | null;
    longitude: number | null;
    unitPreference: string;
    expirationWarningDays: number;
    weatherAPIKey: string | null;
    onboardingCompleted: boolean;
    hasStarterData: boolean;
}

interface SettingsViewProps {
    initialSettings: Settings;
}

export function SettingsView({ initialSettings }: SettingsViewProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showClearDataDialog, setShowClearDataDialog] = useState(false);
    const [showLoadDataDialog, setShowLoadDataDialog] = useState(false);
    const router = useRouter();

    // General Settings Form
    const [formData, setFormData] = useState<Partial<z.infer<typeof UpdateSettingsSchema>>>({
        hardinessZone: settings.hardinessZone || undefined,
        zipCode: settings.zipCode || undefined,
        unitPreference: (settings.unitPreference as "imperial" | "metric") || "imperial",
        expirationWarningDays: settings.expirationWarningDays || 30,
        weatherAPIKey: settings.weatherAPIKey || undefined,
    });

    // PIN Change Form
    const [pinData, setPinData] = useState({
        currentPIN: "",
        newPIN: "",
        confirmNewPIN: "",
    });

    const handleSaveSettings = async () => {
        try {
            setIsLoading(true);
            setMessage(null);

            // Parse and convert
            const payload: any = { ...formData };
            if (payload.expirationWarningDays) payload.expirationWarningDays = Number(payload.expirationWarningDays);

            const result = UpdateSettingsSchema.safeParse(payload);
            if (!result.success) {
                setMessage({ type: "error", text: "Invalid input: " + result.error.errors[0].message });
                setIsLoading(false);
                return;
            }

            const response = await updateSettings(result.data);
            if (response.success) {
                setMessage({ type: "success", text: "Settings saved successfully" });
            } else {
                setMessage({ type: "error", text: response.error || "Failed to save settings" });
            }
        } catch (e) {
            console.error(e);
            setMessage({ type: "error", text: "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePIN = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setMessage(null);

            const result = ChangePINSchema.safeParse(pinData);
            if (!result.success) {
                setMessage({ type: "error", text: result.error.errors[0].message });
                setIsLoading(false);
                return;
            }

            const response = await changePIN(pinData.currentPIN, pinData.newPIN);
            if (response.success) {
                setMessage({ type: "success", text: "PIN changed successfully" });
                setPinData({ currentPIN: "", newPIN: "", confirmNewPIN: "" });
            } else {
                setMessage({ type: "error", text: response.error || "Failed to change PIN" });
            }
        } catch (e) {
            console.error(e);
            setMessage({ type: "error", text: "Error changing PIN" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearStarterData = async () => {
        try {
            setIsLoading(true);
            setMessage(null);
            setShowClearDataDialog(false);

            const response = await removeStarterData();
            if (response.success) {
                setMessage({ type: "success", text: "Starter data cleared successfully" });
                setSettings({ ...settings, hasStarterData: false });
                router.refresh();
            } else {
                setMessage({ type: "error", text: response.error || "Failed to clear starter data" });
            }
        } catch (e) {
            console.error(e);
            setMessage({ type: "error", text: "Error clearing starter data" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadStarterData = async () => {
        try {
            setIsLoading(true);
            setMessage(null);
            setShowLoadDataDialog(false);

            const response = await loadStarterData();
            if (response.success) {
                setMessage({ type: "success", text: "Starter data loaded successfully" });
                setSettings({ ...settings, hasStarterData: true });
                router.refresh();
            } else {
                setMessage({ type: "error", text: response.error || "Failed to load starter data" });
            }
        } catch (e) {
            console.error(e);
            setMessage({ type: "error", text: "Error loading starter data" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-soil-900">Settings</h1>
                <p className="text-soil-600 mt-1">Configure your homestead parameters and security</p>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-lg flex items-center gap-2",
                    message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                )}>
                    {message.text}
                </div>
            )}

            {/* General Settings Card */}
            <div className="bg-white rounded-xl border border-soil-200 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-soil-900 flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-soil-500" />
                    General Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-soil-900">Unit System</label>
                        <div className="mt-2">
                            <Select
                                value={formData.unitPreference}
                                onValueChange={(val) => setFormData({ ...formData, unitPreference: val as "imperial" | "metric" })}
                            >
                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="imperial">Imperial (lbs, °F)</SelectItem>
                                    <SelectItem value="metric">Metric (kg, °C)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-soil-500 mt-1">Default for new items</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-soil-900">Hardiness Zone</label>
                        <input
                            className="input mt-2"
                            placeholder="e.g. 6b"
                            value={formData.hardinessZone || ""}
                            onChange={(e) => setFormData({ ...formData, hardinessZone: e.target.value })}
                        />
                        <p className="text-xs text-soil-500 mt-1">For garden planning</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-soil-900">Zip Code</label>
                        <input
                            className="input mt-2"
                            placeholder="e.g. 12345"
                            value={formData.zipCode || ""}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-soil-900">Expiration Warning (Days)</label>
                        <input
                            type="number"
                            className="input mt-2"
                            value={formData.expirationWarningDays || ""}
                            onChange={(e) => setFormData({ ...formData, expirationWarningDays: parseInt(e.target.value) })}
                        />
                        <p className="text-xs text-soil-500 mt-1">Alert threshold for expiring items</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-soil-100 flex justify-end">
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-xl border border-soil-200 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-soil-900 flex items-center gap-2">
                    Security
                </h2>
                <form onSubmit={handleChangePIN} className="space-y-4 max-w-md">
                    <div>
                        <label className="text-sm font-medium text-soil-900">Current PIN</label>
                        <input
                            type="password"
                            className="input mt-1"
                            value={pinData.currentPIN}
                            onChange={(e) => setPinData({ ...pinData, currentPIN: e.target.value })}
                            placeholder="••••"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-soil-900">New PIN</label>
                            <input
                                type="password"
                                className="input mt-1"
                                value={pinData.newPIN}
                                onChange={(e) => setPinData({ ...pinData, newPIN: e.target.value })}
                                placeholder="••••"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-soil-900">Confirm New PIN</label>
                            <input
                                type="password"
                                className="input mt-1"
                                value={pinData.confirmNewPIN}
                                onChange={(e) => setPinData({ ...pinData, confirmNewPIN: e.target.value })}
                                placeholder="••••"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn-secondary w-full"
                        disabled={isLoading || !pinData.currentPIN || !pinData.newPIN}
                    >
                        Update PIN
                    </button>
                </form>
            </div>

            {/* Data Management Card */}
            <div className="bg-white rounded-xl border border-soil-200 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-soil-900 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-soil-500" />
                    Data Management
                </h2>
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-amber-900">
                                    {settings.hasStarterData ? "Starter Data Detected" : "No Starter Data"}
                                </p>
                                <p className="text-sm text-amber-800">
                                    {settings.hasStarterData
                                        ? "Your project contains example data for testing and exploration. You can safely remove all example data when you're ready to use real data."
                                        : "You can load example data at any time to explore the features of HomesteadHub."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {settings.hasStarterData ? (
                            <button
                                className="btn-secondary flex items-center justify-center gap-2 text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
                                onClick={() => setShowClearDataDialog(true)}
                                disabled={isLoading}
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Starter Data
                            </button>
                        ) : (
                            <button
                                className="btn-secondary flex items-center justify-center gap-2"
                                onClick={() => setShowLoadDataDialog(true)}
                                disabled={isLoading}
                            >
                                <Save className="w-4 h-4" />
                                Load Starter Data
                            </button>
                        )}
                    </div>

                    {settings.hasStarterData && (
                        <div className="text-xs text-soil-600 space-y-1">
                            <p>
                                <strong>Note:</strong> Only example data will be removed. Your own data will remain intact.
                            </p>
                            <p className="text-soil-500">
                                Starter data includes: sample storage items, crops, equipment, livestock, tasks, resource logs, and checklists.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Clear Data Confirmation Dialog */}
            <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-5 h-5" />
                            Clear Starter Data?
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete all example data from your homestead, including:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <ul className="text-sm text-soil-700 space-y-1 list-disc list-inside">
                            <li>Sample storage items</li>
                            <li>Example crops and plantings</li>
                            <li>Sample equipment and maintenance records</li>
                            <li>Example livestock and health records</li>
                            <li>Sample tasks and completions</li>
                            <li>Example resource logs</li>
                            <li>Sample emergency checklists</li>
                        </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-900">
                            <strong>Your own data is safe.</strong> Only items marked as starter data will be removed.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowClearDataDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleClearStarterData}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Clear Starter Data
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Load Data Confirmation Dialog */}
            <Dialog open={showLoadDataDialog} onOpenChange={setShowLoadDataDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Load Starter Data?</DialogTitle>
                        <DialogDescription>
                            This will add example data to help you explore HomesteadHub features.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <p className="text-sm text-soil-700">
                            The following example data will be added to your homestead:
                        </p>
                        <ul className="text-sm text-soil-700 space-y-1 list-disc list-inside">
                            <li>12 storage items with various expiration dates</li>
                            <li>4 crops with plantings</li>
                            <li>4 equipment items with maintenance records</li>
                            <li>5 animals with health and production records</li>
                            <li>7 tasks in various states</li>
                            <li>Resource logs and consumption tracking</li>
                            <li>Emergency preparedness checklist</li>
                        </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                            You can safely delete all starter data later from this page.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowLoadDataDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLoadStarterData}
                            className="bg-forest-600 hover:bg-forest-700"
                        >
                            Load Starter Data
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
