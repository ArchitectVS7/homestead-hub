"use client";

import { useState } from "react";
import { markAsRead, markAllAsRead, deleteNotification } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Assuming generic icons
// import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react'; 
// I'll stick to text or simple divs if icons not imported.

type Notification = {
    id: string;
    type: string;
    title: string;
    description: string;
    source: string;
    sourceId: string | null;
    isRead: boolean;
    createdAt: Date;
};

export function NotificationsView({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState(initialNotifications);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleDelete = async (id: string) => {
        await deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Helper for color
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            case 'alert': return 'bg-red-100 border-red-300 text-red-800';
            case 'info': return 'bg-blue-100 border-blue-300 text-blue-800';
            case 'success': return 'bg-green-100 border-green-300 text-green-800';
            default: return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                <Button variant="outline" onClick={handleMarkAllRead}>Mark All as Read</Button>
            </div>

            <div className="space-y-4">
                {notifications.map((n) => (
                    <Card key={n.id} className={`border-l-4 ${!n.isRead ? 'bg-white' : 'bg-gray-50 opacity-75'} transition-all`}>
                        <CardContent className="p-4 flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className={`p-2 rounded-full ${getTypeColor(n.type)} w-10 h-10 flex items-center justify-center shrink-0`}>
                                    {/* Icon placeholder */}
                                    {n.type[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-semibold ${!n.isRead ? 'text-black' : 'text-gray-600'}`}>{n.title}</h3>
                                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{n.description}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!n.isRead && (
                                    <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(n.id)}>Read</Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(n.id)}>Clear</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        No notifications.
                    </div>
                )}
            </div>
        </div>
    );
}
