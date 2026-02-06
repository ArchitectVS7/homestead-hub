import { getStorageItems, getExpiringItems } from "@/actions/storage";
import { StorageView } from "./storage-view";

export default async function StoragePage() {
  const [items, expiringItems] = await Promise.all([
    getStorageItems(),
    getExpiringItems(30)
  ]);

  // Serializing dates for client component
  const serializedItems = items.map(item => ({
    ...item,
    purchaseDate: item.purchaseDate,
    expirationDate: item.expirationDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  const serializedExpiring = expiringItems.map(item => ({
    ...item,
    purchaseDate: item.purchaseDate,
    expirationDate: item.expirationDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  return <StorageView initialItems={serializedItems} expiringItems={serializedExpiring} />;
}
