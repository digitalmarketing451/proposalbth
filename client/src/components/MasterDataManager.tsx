import { useEffect, useMemo, useState } from "react";
import { Building2, Check, Hotel as HotelIcon, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { destinations, hotels, formatIDR, type Hotel } from "@/lib/proposal-engine";

type MasterTab = "hotel" | "destination";
type CustomHotel = Hotel & { custom: true };
type CustomDestination = { id: string; name: string; area: string; duration: number; notes: string; custom: true };
type HotelDraft = { name: string; area: string; stars: number; roomType: Hotel["roomType"]; pricePerNight: number; facilities: string };
type DestinationDraft = { name: string; area: string; duration: number; notes: string };

type MasterDataManagerProps = { userEmail: string };

const emptyHotel: HotelDraft = { name: "", area: "", stars: 3, roomType: "Twin", pricePerNight: 0, facilities: "" };
const emptyDestination: DestinationDraft = { name: "", area: "", duration: 120, notes: "" };

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function storageKey(email: string) {
  return `bth-master-data-v1:${email.toLowerCase()}`;
}

function safeNumber(value: string, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function MasterDataManager({ userEmail }: MasterDataManagerProps) {
  const [tab, setTab] = useState<MasterTab>("hotel");
  const [query, setQuery] = useState("");
  const [customHotels, setCustomHotels] = useState<CustomHotel[]>([]);
  const [customDestinations, setCustomDestinations] = useState<CustomDestination[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hotelDraft, setHotelDraft] = useState<HotelDraft>(emptyHotel);
  const [destinationDraft, setDestinationDraft] = useState<DestinationDraft>(emptyDestination);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey(userEmail)) || "{}");
      setCustomHotels(Array.isArray(stored.hotels) ? stored.hotels : []);
      setCustomDestinations(Array.isArray(stored.destinations) ? stored.destinations : []);
    } catch {
      setCustomHotels([]);
      setCustomDestinations([]);
    }
  }, [userEmail]);

  const persist = (nextHotels: CustomHotel[], nextDestinations: CustomDestination[]) => {
    setCustomHotels(nextHotels);
    setCustomDestinations(nextDestinations);
    localStorage.setItem(storageKey(userEmail), JSON.stringify({ hotels: nextHotels, destinations: nextDestinations }));
  };

  const hotelRows = useMemo(() => [...hotels.map(item => ({ ...item, custom: false as const })), ...customHotels], [customHotels]);
  const destinationRows = useMemo(() => [...destinations.map(item => ({ ...item, notes: "", custom: false as const })), ...customDestinations], [customDestinations]);
  const visibleHotels = hotelRows.filter(item => `${item.name} ${item.area} ${item.roomType}`.toLowerCase().includes(query.toLowerCase()));
  const visibleDestinations = destinationRows.filter(item => `${item.name} ${item.area} ${item.notes}`.toLowerCase().includes(query.toLowerCase()));

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setHotelDraft(emptyHotel);
    setDestinationDraft(emptyDestination);
  };

  const beginAdd = () => {
    setEditingId(null);
    setHotelDraft(emptyHotel);
    setDestinationDraft(emptyDestination);
    setEditorOpen(true);
  };

  const beginEditHotel = (item: CustomHotel) => {
    setEditingId(item.id);
    setHotelDraft({ name: item.name, area: item.area, stars: item.stars, roomType: item.roomType, pricePerNight: item.pricePerNight, facilities: item.facilities.join(", ") });
    setEditorOpen(true);
  };

  const beginEditDestination = (item: CustomDestination) => {
    setEditingId(item.id);
    setDestinationDraft({ name: item.name, area: item.area, duration: item.duration, notes: item.notes });
    setEditorOpen(true);
  };

  const saveHotel = () => {
    if (!hotelDraft.name.trim() || !hotelDraft.area.trim()) {
      toast.error("Nama hotel dan area wajib diisi.");
      return;
    }
    const next: CustomHotel = {
      id: editingId || makeId("custom-hotel"),
      name: hotelDraft.name.trim(),
      area: hotelDraft.area.trim(),
      stars: Math.min(5, Math.max(1, Math.round(hotelDraft.stars || 1))),
      roomType: hotelDraft.roomType,
      occupancy: hotelDraft.roomType === "Triple" ? 3 : 2,
      pricePerNight: Math.max(0, Math.round(hotelDraft.pricePerNight || 0)),
      facilities: hotelDraft.facilities.split(",").map(item => item.trim()).filter(Boolean),
      custom: true,
    };
    persist(editingId ? customHotels.map(item => item.id === editingId ? next : item) : [...customHotels, next], customDestinations);
    toast.success(editingId ? "Data hotel diperbarui." : "Hotel berhasil ditambahkan.");
    closeEditor();
  };

  const saveDestination = () => {
    if (!destinationDraft.name.trim() || !destinationDraft.area.trim()) {
      toast.error("Nama destinasi dan area wajib diisi.");
      return;
    }
    const next: CustomDestination = {
      id: editingId || makeId("custom-destination"),
      name: destinationDraft.name.trim(),
      area: destinationDraft.area.trim(),
      duration: Math.max(1, Math.round(destinationDraft.duration || 1)),
      notes: destinationDraft.notes.trim(),
      custom: true,
    };
    persist(customHotels, editingId ? customDestinations.map(item => item.id === editingId ? next : item) : [...customDestinations, next]);
    toast.success(editingId ? "Data destinasi diperbarui." : "Destinasi berhasil ditambahkan.");
    closeEditor();
  };

  const deleteHotel = (item: CustomHotel) => {
    if (!window.confirm(`Hapus hotel ${item.name}?`)) return;
    persist(customHotels.filter(current => current.id !== item.id), customDestinations);
    toast.success("Hotel dihapus.");
  };

  const deleteDestination = (item: CustomDestination) => {
    if (!window.confirm(`Hapus destinasi ${item.name}?`)) return;
    persist(customHotels, customDestinations.filter(current => current.id !== item.id));
    toast.success("Destinasi dihapus.");
  };

  return <div className="page-content">
    <div className="page-heading">
      <div><div className="eyebrow"><span className="eyebrow-line" /> OPERATIONS LIBRARY</div><h1>Master data</h1><p className="page-subtitle">Kelola hotel dan destinasi tambahan tanpa mengubah alur generator proposal.</p></div>
      <button className="button button-primary" onClick={beginAdd}><Plus size={17} /> Tambah {tab === "hotel" ? "hotel" : "destinasi"}</button>
    </div>

    <div className="master-tabs">
      <button className={tab === "hotel" ? "active" : ""} onClick={() => { setTab("hotel"); setQuery(""); closeEditor(); }}>Master Data Hotel</button>
      <button className={tab === "destination" ? "active" : ""} onClick={() => { setTab("destination"); setQuery(""); closeEditor(); }}>Master Data Itinerary (Destinasi)</button>
    </div>

    <div className="master-toolbar"><div className="search-field"><Search size={16} /><input placeholder={`Cari ${tab === "hotel" ? "hotel" : "destinasi"}...`} value={query} onChange={event => setQuery(event.target.value)} /></div><span className="master-count">{tab === "hotel" ? visibleHotels.length : visibleDestinations.length} data</span></div>

    {editorOpen && <div className="master-editor">
      <div className="master-editor-head"><div><strong>{editingId ? "Edit" : "Tambah"} {tab === "hotel" ? "hotel" : "destinasi"}</strong><span>Data ini tersimpan khusus untuk akun yang sedang login.</span></div><button className="icon-button subtle" onClick={closeEditor} aria-label="Tutup"><X size={17} /></button></div>
      {tab === "hotel" ? <div className="master-form-grid">
        <label className="field"><span>Nama hotel</span><input value={hotelDraft.name} onChange={event => setHotelDraft({ ...hotelDraft, name: event.target.value })} placeholder="Contoh: Hotel Bali Indah" /></label>
        <label className="field"><span>Area</span><input value={hotelDraft.area} onChange={event => setHotelDraft({ ...hotelDraft, area: event.target.value })} placeholder="Contoh: Sanur" /></label>
        <label className="field"><span>Bintang</span><input type="number" min="1" max="5" value={hotelDraft.stars} onChange={event => setHotelDraft({ ...hotelDraft, stars: safeNumber(event.target.value, 3) })} /></label>
        <label className="field"><span>Tipe kamar</span><select value={hotelDraft.roomType} onChange={event => setHotelDraft({ ...hotelDraft, roomType: event.target.value as Hotel["roomType"] })}><option>Twin</option><option>Double</option><option>Triple</option></select></label>
        <label className="field"><span>Harga per malam</span><input type="number" min="0" value={hotelDraft.pricePerNight} onChange={event => setHotelDraft({ ...hotelDraft, pricePerNight: safeNumber(event.target.value) })} /></label>
        <label className="field"><span>Fasilitas</span><input value={hotelDraft.facilities} onChange={event => setHotelDraft({ ...hotelDraft, facilities: event.target.value })} placeholder="Breakfast, Pool, Wi-Fi" /></label>
      </div> : <div className="master-form-grid">
        <label className="field"><span>Nama destinasi</span><input value={destinationDraft.name} onChange={event => setDestinationDraft({ ...destinationDraft, name: event.target.value })} placeholder="Contoh: Desa Wisata Penglipuran" /></label>
        <label className="field"><span>Area</span><input value={destinationDraft.area} onChange={event => setDestinationDraft({ ...destinationDraft, area: event.target.value })} placeholder="Contoh: Bangli" /></label>
        <label className="field"><span>Durasi kunjungan (menit)</span><input type="number" min="1" value={destinationDraft.duration} onChange={event => setDestinationDraft({ ...destinationDraft, duration: safeNumber(event.target.value, 120) })} /></label>
        <label className="field field-wide"><span>Catatan itinerary</span><input value={destinationDraft.notes} onChange={event => setDestinationDraft({ ...destinationDraft, notes: event.target.value })} placeholder="Catatan untuk tim sales" /></label>
      </div>}
      <div className="master-editor-actions"><button className="button button-secondary" onClick={closeEditor}>Batal</button><button className="button button-primary" onClick={tab === "hotel" ? saveHotel : saveDestination}><Check size={16} /> Simpan data</button></div>
    </div>}

    {tab === "hotel" ? <div className="master-grid">{visibleHotels.map(item => <div className="master-card" key={item.id}><div className="master-card-icon"><HotelIcon size={18} /></div><div className="master-card-body"><strong>{item.name}</strong><span>{item.area} · {item.stars} bintang · {item.roomType}</span></div><div className="master-card-value">{formatIDR(item.pricePerNight)}</div>{item.custom ? <div className="master-card-actions"><button className="icon-button subtle" title="Edit hotel" onClick={() => beginEditHotel(item)}><Pencil size={15} /></button><button className="icon-button subtle danger-ghost" title="Hapus hotel" onClick={() => deleteHotel(item)}><Trash2 size={15} /></button></div> : <span className="master-default-label">Bawaan</span>}</div>)}</div> : <div className="master-grid">{visibleDestinations.map(item => <div className="master-card" key={item.id}><div className="master-card-icon"><Building2 size={18} /></div><div className="master-card-body"><strong>{item.name}</strong><span>{item.area} · {item.duration} menit{item.notes ? ` · ${item.notes}` : ""}</span></div>{item.custom ? <div className="master-card-actions"><button className="icon-button subtle" title="Edit destinasi" onClick={() => beginEditDestination(item)}><Pencil size={15} /></button><button className="icon-button subtle danger-ghost" title="Hapus destinasi" onClick={() => deleteDestination(item)}><Trash2 size={15} /></button></div> : <span className="master-default-label">Bawaan</span>}</div>)}</div>}

    {(tab === "hotel" ? visibleHotels.length === 0 : visibleDestinations.length === 0) && <div className="empty-state"><div className="empty-state-icon"><Search size={23} /></div><h3>Data tidak ditemukan</h3><p>Tambahkan data baru atau ubah kata pencarian.</p></div>}
    <div className="master-note"><Sparkles size={17} /><div><strong>Data master tetap terpisah dari proposal</strong><span>Menambah atau menghapus data di sini tidak mengubah tampilan dan input manual pada generator proposal.</span></div></div>
  </div>;
}
