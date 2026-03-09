import { getEquipmentWithHistory, getMaintenanceStats, getServiceDueStatus } from "@/actions/equipment";
import { EquipmentDetailClient } from "./equipment-detail-client";
import { notFound } from "next/navigation";

interface EquipmentDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
    const { id } = await params;
    const equipment = await getEquipmentWithHistory(id);

    if (!equipment) {
        notFound();
    }

    const [stats, serviceDueStatus] = await Promise.all([
        getMaintenanceStats(id),
        getServiceDueStatus(id),
    ]);

    // Serialize dates for client
    const serializedEquipment = {
        ...equipment,
        purchaseDate: equipment.purchaseDate?.toISOString() || null,
        lastServiceDate: equipment.lastServiceDate?.toISOString() || null,
        maintenanceRecords: equipment.maintenanceRecords.map(r => ({
            ...r,
            date: r.date.toISOString(),
        })),
    } as const;

    return (
        <EquipmentDetailClient
            equipment={serializedEquipment as unknown as Parameters<typeof EquipmentDetailClient>[0]["equipment"]}
            stats={stats}
            serviceDueStatus={serviceDueStatus}
        />
    );
}
