import { getEquipment, getServiceDueEquipment } from "@/actions/equipment";
import { EquipmentView } from "./equipment-view";

export default async function EquipmentPage() {
  const [equipment, serviceDue] = await Promise.all([
    getEquipment(),
    getServiceDueEquipment(),
  ]);

  // Serialize dates
  const serializedEquipment = equipment.map(e => ({
    ...e,
    purchaseDate: e.purchaseDate,
    lastServiceDate: e.lastServiceDate,
  }));

  return <EquipmentView initialEquipment={serializedEquipment} dueCount={serviceDue.length} />;
}
