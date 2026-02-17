"use client";

import { useEffect, useState } from "react";

export function useNetworkStatus() {
    // Lazy initializer reads navigator.onLine once at mount time, avoiding
    // a synchronous setState call inside an effect body.
    const [isOnline, setIsOnline] = useState(() =>
        typeof window !== "undefined" ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return isOnline;
}
