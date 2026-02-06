import * as storageActions from "@/actions/storage";
import * as taskActions from "@/actions/tasks";
import * as gardenActions from "@/actions/garden";
import * as equipmentActions from "@/actions/equipment";
import * as livestockActions from "@/actions/livestock";
import * as resourcesActions from "@/actions/resources";
import * as weatherActions from "@/actions/weather";
import * as preparednessActions from "@/actions/preparedness";
import * as settingsActions from "@/actions/settings";
import * as notificationsActions from "@/actions/notifications";

type ServerAction = (data: any) => Promise<{ success: boolean; error?: string }>;

export const ACTION_REGISTRY: Record<string, Function> = {
    // Storage
    "storage.create": storageActions.createStorageItem,
    "storage.update": (data: any) => storageActions.updateStorageItem(data.id, data),
    "storage.delete": (data: any) => storageActions.deleteStorageItem(data.id),

    // Tasks
    "tasks.create": taskActions.createTask,
    "tasks.update": (data: any) => taskActions.updateTask(data.id, data),
    "tasks.complete": (data: any) => taskActions.completeTask(data.id, data),
    "tasks.delete": (data: any) => taskActions.deleteTask(data.id),

    // Garden
    "garden.createPlanting": gardenActions.createPlanting,
    "garden.logHarvest": (data: any) => gardenActions.logHarvest(data.id, data),

    // Equipment
    "equipment.create": equipmentActions.createEquipment,
    "equipment.logMaintenance": (data: any) => equipmentActions.logMaintenance(data.equipmentId, data),

    // Livestock
    "livestock.create": livestockActions.createAnimal,
    "livestock.logproduction": (data: any) => livestockActions.logProduction(data.animalId, data),
    "livestock.addhealthrecord": (data: any) => livestockActions.addHealthRecord(data.animalId, data),

    // Resources
    "resources.log": resourcesActions.logResource,

    // Weather
    "weather.log": weatherActions.logWeather,

    // Preparedness
    "preparedness.toggleitem": (data: any) => preparednessActions.toggleItem(data.id, data.isCompleted),

    // Settings
    "settings.update": settingsActions.updateSettings,

    // Notifications
    "notifications.markread": (data: any) => notificationsActions.markAsRead(data.id),
    "notifications.markallread": notificationsActions.markAllAsRead,
};

export function getAction(key: string): Function | undefined {
    return ACTION_REGISTRY[key];
}
