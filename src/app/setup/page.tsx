"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setupPIN } from "@/actions/auth";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function SetupPage() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate PIN match
        if (pin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        // Validate PIN length
        if (pin.length < 4) {
            setError("PIN must be at least 4 characters");
            return;
        }

        setIsLoading(true);

        const result = await setupPIN(pin);

        if (result.success) {
            router.push("/dashboard");
            router.refresh();
        } else {
            setError(result.error || "Setup failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-earth-900">
                        Welcome to HomesteadHub
                    </h1>
                    <p className="text-earth-600 mt-2">
                        Let's secure your homestead with a PIN
                    </p>
                </div>

                {/* Setup Form */}
                <div className="bg-white rounded-2xl border border-earth-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="pin"
                                className="block text-sm font-medium text-earth-900 mb-2"
                            >
                                Create PIN
                            </label>
                            <input
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-earth-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent text-lg tracking-widest"
                                placeholder="••••"
                                autoFocus
                                disabled={isLoading}
                            />
                            <p className="text-xs text-earth-500 mt-1">
                                At least 4 characters
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPin"
                                className="block text-sm font-medium text-earth-900 mb-2"
                            >
                                Confirm PIN
                            </label>
                            <input
                                id="confirmPin"
                                type="password"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-earth-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent text-lg tracking-widest"
                                placeholder="••••"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="bg-barn-50 border border-barn-200 rounded-lg p-3 text-sm text-barn-800">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !pin || !confirmPin}
                            className="w-full bg-forest-600 text-white py-3 rounded-lg hover:bg-forest-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                "Complete Setup"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-earth-50 rounded-lg">
                        <p className="text-xs text-earth-600">
                            <strong>Important:</strong> Remember your PIN. There is no
                            password recovery. This is a self-hosted, offline-first
                            application.
                        </p>
                    </div>
                </div>

                <p className="text-center text-sm text-earth-500 mt-6">
                    Self-hosted. Self-reliant. Self-sufficient.
                </p>
            </div>
        </div>
    );
}
