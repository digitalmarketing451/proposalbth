import { useEffect, useMemo, useState } from "react";
import { Building2, Check, Hotel as HotelIcon, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { formatIDR, type Hotel } from "@/lib/proposal-engine";
import { getMasterData, saveMasterData, type MasterDestination, type MasterHotel } from "@/lib/master-data";

type MasterTab = "hotel" | "destination";
type HotelDraft = { name: string; area: string; stars: number; roomType: Hotel["roomType"]; pricePerNight: number; facilities: string };
type DestinationDraft = { name: string; area: string; notes: string };
type MasterDataManagerProps = { userEmail: string };

const emptyHotel: HotelDraft = { name: "", area: "", stars: 3, roomType: "Twin", pricePerNight: 0, facilities: "" };
const emptyDestination: DestinationDraft = { name: "", area: "", notes: "" };

function makeId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function safeNumber(value: string, fallback = 0) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }

export function MasterDataManager({ userEmail }: MasterDataManagerProps) {
  const [tab, setTab] = useState<MasterTab>("hotel");
  const [query, setQuery] = useState("");
  const [masterHotels, setMasterHotels] = useState<MasterHotel[]>([]);
  const [masterDestinations, setMasterDestinations] = useState<MasterDestination[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hotelDraft, setHotelDraft] = useState<HotelDraft>(emptyHotel);
  const [destinationDraft, setDestinationDraft] = useState<DestinationDraft>(emptyDestination);

  useEffect(() => {
    const data = getMasterData(userEmail);
    setMasterHotels(data.hotels);
    setMasterDestinations(data.destinations);
  }, [userEmail]);

  const persist = (nextHotels: MasterHotel[], nextDestinations: MasterDestination[]) => {
    setMasterHotels(nextHotels);
    setMasterDestinations(nextDestinations);
    saveMasterData(userEmail, { hotels: nextHotels, destinations: nextDestinations });
  };

  const visibleHotels = useMemo(() => masterHotels.filter(item => `${item.name} ${item.area} ${item.roomType}`.toLowerCase().includes(query.toLowerCase())), [masterHotels, query]);
  const visibleDestinations = useMemo(() => masterDestinations.filter(item => `${item.name} ${item.area} ${item.notes}`.toLowerCase().includes(query.toLowerCase())), [masterDestinations, query]);
  const closeEditor = () => { setEditorOpen(false); setEditingId(null); setHotelDraft(emptyHotel); setDestinationDraft(emptyDestination); };
  const beginAdd = () => { setEditingId(null); setHotelDraft(emptyHotel); setDestinationDraft(emptyDestination); setEditorOpen(true); };
  const beginEditHotel = (item: MasterHotel) => { setEditingId(item.id); setHotelDraft({ name: item.name, area: item.area, stars: item.stars, roomType: item.roomType, pricePerNight: item.pricePerNight, facilities: item.facilities.join(", ") }); setEditorOpen(true); };
  const beginEditDestination = (item: MasterDestination) => { setEditingId(item.id); setDestinationDraft({ name: item.name, area: item.area, notes: item.notes }); setEditorOpen(true); };

  const saveHotel = () => {
    if (!hotelDraft.name.trim() || !hotelDraft.area.trim()) { toast.error("Nama hotel dan area wajib diisi."); return; }
    const existing = masterHotels.find(item => item.id === editingId);
    const next: MasterHotel = { id: editingId || makeId("custom-hotel"), name: hotelDraft.name.trim(), area: hotelDraft.area.trim(), stars: Math.min(5, Math.max(1, Math.round(hotelDraft.stars || 1))), roomType: hotelDraft.roomType, occupancy: hotelDraft.roomType === "Triple" ? 3 : 2, pricePerNight: Math.max(0, Math.round(hotelDraft.pricePerNight || 0)), facilities: hotelDraft.facilities.split(",").map(item => item.trim()).filter(Boolean), custom: existing?.custom ?? true };
    persist(editingId ? masterHotels.map(item => item.id === editingId ? next : item) : [...masterHotels, next], masterDestinations);
    toast.success(editingId ? "Data hotel bawaan diperbarui." : "Hotel berhasil ditambahkan.");
    closeEditor();
  };

  const saveDestination = () => {
    if (!destinationDraft.name.trim() || !destinationDraft.area.trim()) { toast.error("Nama destinasi dan area wajib diisi."); return; }
    const existing = masterDestinations.find(item => item.id === editingId);
    const next: MasterDestination = { id: editingId || makeId("custom-destination"), name: destinationDraft.name.trim(), area: destinationDraft.area.trim(), notes: destinationDraft.notes.trim(), custom: existing?.custom ?? true };
    persist(masterHotels, editingId ? masterDestinations.map(item => item.id === editingId ? next : item) : [...masterDestinations, next]);
    toast.success(editingId ? "Data destinasi bawaan diperbarui." : "Destinasi berhasil ditambahkan.");
    closeEditor();
  };

  const deleteItem = (kind: MasterTab, id: string, name: string) => {
    if (!window.confirm(`Hapus ${kind === "hotel" ? "hotel" : "destinasi"} ${name}?`)) return;
    if (kind === "hotel") persist(masterHotels.filter(item => item.id !== id), masterDestinations);
    else persist(masterHotels, masterDestinations.filter(item => item.id !== id));
    toast.success(`${kind === "hotel" ? "Hotel" : "Destinasi"} dihapus.`);
  };

  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> OPERATIONS LIBRARY</div><h1>Master data</h1><p className="page-subtitle">Kelola hotel dan destinasi yang tersedia saat membuat proposal.</p></div><button className="button button-primary" onClick={beginAdd}><Plus size={17} /> Tambah {tab === "hotel" ? "hotel" : "destinasi"}</button></div>
    <div className="master-tabs"><button className={tab === "hotel" ? "active" : ""} onClick={() => { setTab("hotel"); setQuery(""); closeEditor(); }}>Master Data Hotel</button><button className={tab === "destination" ? "active" : ""} onClick={() => { setTab("destination"); setQuery(""); closeEditor(); }}>Master Data Itinerary (Destinasi)</button></div>
    <div className="master-toolbar"><div className="search-field"><Search size={16} /><input placeholder={`Cari ${tab === "hotel" ? "hotel" : "destinasi"}...`} value={query} onChange={event => setQuery(event.target.value)} /></div><span className="master-count">{tab === "hotel" ? visibleHotels.length : visibleDestinations.length} data</span></div>
    {editorOpen && <div className="master-editor"><div className="master-editor-head"><div><strong>{editingId ? "Edit" : "Tambah"} {tab === "hotel" ? "hotel" : "destinasi"}</strong><span>Data tersimpan khusus untuk akun yang sedang login.</span></div><button className="icon-button subtle" onClick={closeEditor} aria-label="Tutup"><X size={17} /></button></div>
      {tab === "hotel" ? <div className="master-form-grid"><label className="field"><span>Nama hotel</span><input value={hotelDraft.name} onChange={event => setHotelDraft({ ...hotelDraft, name: event.target.value })} placeholder="Contoh: Hotel Bali Indah" /></label><label className="field"><span>Area</span><input value={hotelDraft.area} onChange={event => setHotelDraft({ ...hotelDraft, area: event.target.value })} placeholder="Contoh: Sanur" /></label><label className="field"><span>Bintang</span><input type="number" min="1" max="5" value={hotelDraft.stars} onChange={event => setHotelDraft({ ...hotelDraft, stars: safeNumber(event.target.value, 3) })} /></label><label className="field"><span>Tipe kamar</span><select value={hotelDraft.roomType} onChange={event => setHotelDraft({ ...hotelDraft, roomType: event.target.value as Hotel["roomType"] })}><option>Twin</option><option>Double</option><option>Triple</option></select></label><label className="field"><span>Harga per malam</span><input type="number" min="0" value={hotelDraft.pricePerNight} onChange={event => setHotelDraft({ ...hotelDraft, pricePerNight: safeNumber(event.target.value) })} /></label><label className="field"><span>Fasilitas</span><input value={hotelDraft.facilities} onChange={event => setHotelDraft({ ...hotelDraft, facilities: event.target.value })} placeholder="Breakfast, Pool, Wi-Fi" /></label></div> : <div className="master-form-grid"><label className="field"><span>Nama destinasi</span><input value={destinationDraft.name} onChange={event => setDestinationDraft({ ...destinationDraft, name: event.target.value })} placeholder="Contoh: Desa Wisata Penglipuran" /></label><label className="field"><span>Area</span><input value={destinationDraft.area} onChange={event => setDestinationDraft({ ...destinationDraft, area: event.target.value })} placeholder="Contoh: Bangli" /></label><label className="field field-wide"><span>Catatan itinerary</span><input value={destinationDraft.notes} onChange={event => setDestinationDraft({ ...destinationDraft, notes: event.target.value })} placeholder="Catatan untuk tim sales" /></label></div>}
      <div className="master-editor-actions"><button className="button button-secondary" onClick={closeEditor}>Batal</button><button className="button button-primary" onClick={tab === "hotel" ? saveHotel : saveDestination}><Check size={16} /> Simpan data</button></div></div>}
    {tab === "hotel" ? <div className="master-grid">{visibleHotels.map(item => <div className="master-card" key={item.id}><div className="master-card-icon"><HotelIcon size={18} /></div><div className="master-card-body"><strong>{item.name}</strong><span>{item.area} · {item.stars} bintang · {item.roomType}</span></div><div className="master-card-value">{formatIDR(item.pricePerNight)}</div><div className="master-card-actions"><button className="icon-button subtle" title="Edit hotel" onClick={() => beginEditHotel(item)}><Pencil size={15} /></button>{item.custom && <button className="icon-button subtle danger-ghost" title="Hapus hotel" onClick={() => deleteItem("hotel", item.id, item.name)}><Trash2 size={15} /></button>}</div></div>)}</div> : <div className="master-grid">{visibleDestinations.map(item => <div className="master-card" key={item.id}><div className="master-card-icon"><Building2 size={18} /></div><div className="master-card-body"><strong>{item.name}</strong><span>{item.area}{item.notes ? ` · ${item.notes}` : ""}</span></div><div className="master-card-actions"><button className="icon-button subtle" title="Edit destinasi" onClick={() => beginEditDestination(item)}><Pencil size={15} /></button>{item.custom && <button className="icon-button subtle danger-ghost" title="Hapus destinasi" onClick={() => deleteItem("destination", item.id, item.name)}><Trash2 size={15} /></button>}</div></div>)}</div>}
    {(tab === "hotel" ? visibleHotels.length === 0 : visibleDestinations.length === 0) && <div className="empty-state"><div className="empty-state-icon"><Search size={23} /></div><h3>Data tidak ditemukan</h3><p>Tambahkan data baru atau ubah kata pencarian.</p></div>}
    <div className="master-note"><Sparkles size={17} /><div><strong>Master data aktif di generator</strong><span>Perubahan bawaan dan data tambahan langsung tersedia saat memilih hotel atau destinasi pada proposal baru.</span></div></div>
  </div>;
}
