"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(pin);

        if (result.success) {
            router.push("/dashboard");
            router.refresh();
        } else {
            setError(result.error || "Login failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-earth-900">HomesteadHub</h1>
                    <p className="text-earth-600 mt-2">Enter your PIN to continue</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl border border-earth-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="pin"
                                className="block text-sm font-medium text-earth-900 mb-2"
                            >
                                PIN
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
                        </div>

                        {error && (
                            <div className="bg-barn-50 border border-barn-200 rounded-lg p-3 text-sm text-barn-800">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !pin}
                            className="w-full bg-forest-600 text-white py-3 rounded-lg hover:bg-forest-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm text-earth-600 hover:text-earth-900 transition"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </div>

                <p className="text-center text-sm text-earth-500 mt-6">
                    Self-hosted. Self-reliant. Self-sufficient.
                </p>
            </div>
        </div>
    );
}
