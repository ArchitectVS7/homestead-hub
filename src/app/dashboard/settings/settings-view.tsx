"use client";

import { useState } from "react";
import { Save, Loader2, MapPin, Ruler } from "lucide-react";
import { updateSettings } from "@/actions/settings";
import { changePIN } from "@/actions/auth";
import { UpdateSettingsSchema, ChangePINSchema } from "@/lib/validations";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Settings {
    id: string;
    hardinessZone: string | null;
    zipCode: string | null;
    latitude: number | null;
    longitude: number | null;
    unitPreference: string;
    expirationWarningDays: number;
    weatherAPIKey: string | null;
}

interface SettingsViewProps {
    initialSettings: Settings;
}

export function SettingsView({ initialSettings }: SettingsViewProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        </div>
    );
}
