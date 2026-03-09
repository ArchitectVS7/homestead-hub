"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sprout, CircleDot } from "lucide-react";
import { PlantingWithCrop } from "@/actions/garden";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
    plantings: PlantingWithCrop[];
    onPlantingClick?: (planting: PlantingWithCrop) => void;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    plantings: {
        plant: PlantingWithCrop[];
        harvest: PlantingWithCrop[];
    };
}

export function CalendarView({ plantings, onPlantingClick }: CalendarViewProps) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const [viewDate, setViewDate] = useState({ month: currentMonth, year: currentYear });

    const calendarDays = generateCalendarDays(viewDate.year, viewDate.month, plantings, today);

    const previousMonth = () => {
        setViewDate(prev => {
            const newMonth = prev.month - 1;
            if (newMonth < 0) {
                return { month: 11, year: prev.year - 1 };
            }
            return { ...prev, month: newMonth };
        });
    };

    const nextMonth = () => {
        setViewDate(prev => {
            const newMonth = prev.month + 1;
            if (newMonth > 11) {
                return { month: 0, year: prev.year + 1 };
            }
            return { ...prev, month: newMonth };
        });
    };

    const goToToday = () => {
        setViewDate({ month: currentMonth, year: currentYear });
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-soil-200 bg-soil-50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-soil-100 rounded-lg transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-soil-100 rounded-lg transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <h2 className="text-lg font-bold text-soil-900">
                    {monthNames[viewDate.month]} {viewDate.year}
                </h2>
                <button
                    onClick={goToToday}
                    className="px-3 py-1.5 text-sm font-medium text-forest-700 bg-forest-50 hover:bg-forest-100 rounded-lg transition-colors"
                >
                    Today
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-soil-200 bg-soil-50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-soil-600">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => (
                    <CalendarDayCell
                        key={index}
                        day={day}
                        onClick={() => onPlantingClick?.(day.plantings.plant[0] || day.plantings.harvest[0])}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 p-3 border-t border-soil-200 bg-soil-50 text-xs text-soil-600">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
                    <span>Plant Date</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                    <span>Expected Harvest</span>
                </div>
            </div>
        </div>
    );
}

interface CalendarDayCellProps {
    day: CalendarDay;
    onClick?: () => void;
}

function CalendarDayCell({ day, onClick }: CalendarDayCellProps) {
    const totalPlantings = day.plantings.plant.length + day.plantings.harvest.length;
    const hasEvents = totalPlantings > 0;

    return (
        <div
            className={cn(
                "min-h-[100px] p-1.5 border-r border-b border-soil-100 transition-colors",
                !day.isCurrentMonth && "bg-soil-50 text-soil-400",
                day.isToday && "bg-forest-50",
                hasEvents && "cursor-pointer hover:bg-soil-50"
            )}
            onClick={onClick}
        >
            <div className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full text-sm mb-1",
                day.isToday && "bg-forest-600 text-white font-bold"
            )}>
                {day.date.getDate()}
            </div>

            {hasEvents && (
                <div className="space-y-0.5">
                    {day.plantings.plant.slice(0, 2).map(planting => (
                        <div
                            key={planting.id}
                            className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 truncate"
                            title={`${planting.crop.name} - Plant`}
                        >
                            <Sprout className="w-2.5 h-2.5 inline mr-0.5" />
                            {planting.crop.name}
                        </div>
                    ))}
                    {day.plantings.harvest.slice(0, 2).map(planting => (
                        <div
                            key={planting.id}
                            className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 truncate"
                            title={`${planting.crop.name} - Harvest`}
                        >
                            <CircleDot className="w-2.5 h-2.5 inline mr-0.5" />
                            {planting.crop.name}
                        </div>
                    ))}
                    {totalPlantings > 2 && (
                        <div className="text-xs text-soil-500 pl-1">
                            +{totalPlantings - 2} more
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function generateCalendarDays(
    year: number,
    month: number,
    plantings: PlantingWithCrop[],
    today: Date
): CalendarDay[] {
    const days: CalendarDay[] = [];

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Day of week first day starts on (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();
    // Total days in month
    const daysInMonth = lastDay.getDate();

    // Previous month days to fill grid
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isSameDay(date, today),
            plantings: { plant: [], harvest: [] },
        });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayPlantings = plantings.filter(p => {
            const plantDate = new Date(p.plantDate);
            const harvestDate = p.expectedHarvest ? new Date(p.expectedHarvest) : null;
            return (
                (plantDate.getDate() === day && plantDate.getMonth() === month && plantDate.getFullYear() === year) ||
                (harvestDate && harvestDate.getDate() === day && harvestDate.getMonth() === month && harvestDate.getFullYear() === year)
            );
        });

        days.push({
            date,
            isCurrentMonth: true,
            isToday: isSameDay(date, today),
            plantings: {
                plant: dayPlantings.filter(p => {
                    const plantDate = new Date(p.plantDate);
                    return plantDate.getDate() === day && plantDate.getMonth() === month && plantDate.getFullYear() === year;
                }),
                harvest: dayPlantings.filter(p => {
                    if (!p.expectedHarvest) return false;
                    const harvestDate = new Date(p.expectedHarvest);
                    return harvestDate.getDate() === day && harvestDate.getMonth() === month && harvestDate.getFullYear() === year;
                }),
            },
        });
    }

    // Next month days to fill grid (ensure 42 cells = 6 rows)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isSameDay(date, today),
            plantings: { plant: [], harvest: [] },
        });
    }

    return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}
