import { destinations, hotels, type Hotel } from "./proposal-engine";

export type MasterHotel = Hotel & { custom: boolean };
export type MasterDestination = { id: string; name: string; area: string; notes: string; custom: boolean };
export type MasterData = { hotels: MasterHotel[]; destinations: MasterDestination[] };

function key(email: string) {
  return `bth-master-data-v1:${email.toLowerCase()}`;
}

function readStored(email: string): { hotels?: unknown[]; destinations?: unknown[] } {
  try {
    const stored = JSON.parse(localStorage.getItem(key(email)) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

export function getMasterData(email: string): MasterData {
  const stored = readStored(email);
  const storedHotels = Array.isArray(stored.hotels) ? stored.hotels as Partial<MasterHotel>[] : [];
  const storedDestinations = Array.isArray(stored.destinations) ? stored.destinations as Partial<MasterDestination>[] : [];
  const savedHotelById = new Map(storedHotels.filter(item => item.id).map(item => [item.id, item]));
  const savedDestinationById = new Map(storedDestinations.filter(item => item.id).map(item => [item.id, item]));
  const defaultHotelIds = new Set(hotels.map(item => item.id));
  const defaultDestinationIds = new Set(destinations.map(item => item.id));

  const masterHotels = hotels.map(item => ({ ...item, ...(savedHotelById.get(item.id) || {}), custom: false }));
  const customHotels = storedHotels.filter(item => item.id && !defaultHotelIds.has(item.id)).map(item => ({ ...item, custom: true } as MasterHotel));
  const masterDestinations = destinations.map(item => {
    const saved = savedDestinationById.get(item.id);
    return { id: item.id, name: saved?.name || item.name, area: saved?.area || item.area, notes: saved?.notes || "", custom: false };
  });
  const customDestinations = storedDestinations.filter(item => item.id && !defaultDestinationIds.has(item.id)).map(item => ({ id: item.id as string, name: item.name || "", area: item.area || "", notes: item.notes || "", custom: true }));

  return { hotels: [...masterHotels, ...customHotels], destinations: [...masterDestinations, ...customDestinations] };
}

export function saveMasterData(email: string, data: MasterData) {
  localStorage.setItem(key(email), JSON.stringify(data));
}
