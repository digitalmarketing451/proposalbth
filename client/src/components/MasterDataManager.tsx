import { useMemo, useState } from "react";
import { Building2, Check, Edit3, MapPin, Plus, Save, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { destinations, hotels, formatIDR } from "@/lib/proposal-engine";

type HotelMaster = {
  id: string;
  name: string;
  area: string;
  stars: number;
  roomType: string;
  pricePerNight: number;
  facilities: string;
};

type DestinationMaster = {
  id: string;
  name: string;
  area: string;
  duration: number;
  notes: string;
};

type Props = { storageKey: string; setView: (view: "builder" | "proposals" | "master" | "settings") => void };

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const hotelSeed: HotelMaster[] = hotels.map(item => ({ ...item, facilities: item.facilities.join(", ") }));
const destinationSeed: DestinationMaster[] = destinations.map(item => ({ ...item, notes: "" }));

export default function MasterDataManager({ storageKey, setView }: Props) {
  const [tab, setTab] = useState<"hotel" | "destination">("hotel");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [hotelsData, setHotelsData] = useState<HotelMaster[]>(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}:hotels`) || "null") || hotelSeed; } catch { return hotelSeed; }
  });
  const [destinationsData, setDestinationsData] = useState<DestinationMaster[]>(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}:destinations`) || "null") || destinationSeed; } catch { return destinationSeed; }
  });
  const [hotelForm, setHotelForm] = useState<HotelMaster>({ id: "", name: "", area: "", stars: 3, roomType: "Twin", pricePerNight: 0, facilities: "" });
  const [destinationForm, setDestinationForm] = useState<DestinationMaster>({ id: "", name: "", area: "", duration: 90, notes: "" });

  const isHotel = tab === "hotel";
  const currentRows = useMemo(() => {
    const source = isHotel ? hotelsData : destinationsData;
    return source.filter(item => `${item.name} ${item.area}`.toLowerCase().includes(query.toLowerCase()));
  }, [isHotel, hotelsData, destinationsData, query]);

  const persistHotels = (next: HotelMaster[]) => { setHotelsData(next); localStorage.setItem(`${storageKey}:hotels`, JSON.stringify(next)); };
  const persistDestinations = (next: DestinationMaster[]) => { setDestinationsData(next); localStorage.setItem(`${storageKey}:destinations`, JSON.stringify(next)); };
  const resetForm = () => { setEditingId(null); setShowForm(false); setHotelForm({ id: "", name: "", area: "", stars: 3, roomType: "Twin", pricePerNight: 0, facilities: "" }); setDestinationForm({ id: "", name: "", area: "", duration: 90, notes: "" }); };
  const startAdd = () => { resetForm(); setShowForm(true); };
  const editHotel = (item: HotelMaster) => { setHotelForm(item); setEditingId(item.id); setShowForm(true); };
  const editDestination = (item: DestinationMaster) => { setDestinationForm(item); setEditingId(item.id); setShowForm(true); };
  const saveHotel = () => {
    if (!hotelForm.name.trim() || !hotelForm.area.trim()) { toast.error("Nama hotel dan area wajib diisi."); return; }
    const next = hotelForm.id ? hotelsData.map(item => item.id === hotelForm.id ? hotelForm : item) : [...hotelsData, { ...hotelForm, id: makeId("hotel") }];
    persistHotels(next); toast.success(hotelForm.id ? "Master hotel diperbarui." : "Hotel baru ditambahkan."); resetForm();
  };
  const saveDestination = () => {
    if (!destinationForm.name.trim() || !destinationForm.area.trim()) { toast.error("Nama destinasi dan area wajib diisi."); return; }
    const next = destinationForm.id ? destinationsData.map(item => item.id === destinationForm.id ? destinationForm : item) : [...destinationsData, { ...destinationForm, id: makeId("destination") }];
    persistDestinations(next); toast.success(destinationForm.id ? "Master destinasi diperbarui." : "Destinasi baru ditambahkan."); resetForm();
  };
  const removeRow = (id: string, builtin: boolean) => {
    if (builtin) { toast.info("Data bawaan tidak dihapus. Kamu bisa mengedit atau menambahkan data baru."); return; }
    if (!window.confirm(`Hapus ${isHotel ? "hotel" : "destinasi"} ini?`)) return;
    if (isHotel) persistHotels(hotelsData.filter(item => item.id !== id)); else persistDestinations(destinationsData.filter(item => item.id !== id));
    toast.success("Data master dihapus.");
  };

  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> OPERATIONS LIBRARY</div><h1>Master data</h1><p className="page-subtitle">Kelola hotel dan destinasi yang bisa dipakai ulang saat menyusun proposal.</p></div><button className="button button-primary" onClick={startAdd}><Plus size={17} /> Tambah {isHotel ? "hotel" : "destinasi"}</button></div>
    <div className="master-tabs"><button className={tab === "hotel" ? "active" : ""} onClick={() => { setTab("hotel"); resetForm(); }}>Master Data Hotel</button><button className={tab === "destination" ? "active" : ""} onClick={() => { setTab("destination"); resetForm(); }}>Master Data Itinerary (Destinasi)</button></div>
    <div className="master-toolbar"><div className="search-field"><Search size={16} /><input placeholder={`Cari ${isHotel ? "hotel" : "destinasi"}...`} value={query} onChange={event => setQuery(event.target.value)} /></div><span className="master-count">{currentRows.length} data aktif</span></div>
    {showForm && <div className="master-editor"><div className="master-editor-head"><div><span className="eyebrow">{editingId ? "EDIT DATA" : "DATA BARU"}</span><h2>{editingId ? `Edit ${isHotel ? "hotel" : "destinasi"}` : `Tambah ${isHotel ? "hotel" : "destinasi"}`}</h2></div><button className="icon-button subtle" onClick={resetForm}><X size={17} /></button></div>{isHotel ? <div className="form-grid three"><label className="field"><span>Nama hotel<b>*</b></span><input value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} placeholder="Contoh: Grand Hyatt Bali" /></label><label className="field"><span>Area<b>*</b></span><input value={hotelForm.area} onChange={e => setHotelForm({ ...hotelForm, area: e.target.value })} placeholder="Nusa Dua" /></label><label className="field"><span>Bintang</span><select value={hotelForm.stars} onChange={e => setHotelForm({ ...hotelForm, stars: Number(e.target.value) })}><option value={3}>3 bintang</option><option value={4}>4 bintang</option><option value={5}>5 bintang</option></select></label><label className="field"><span>Tipe kamar</span><input value={hotelForm.roomType} onChange={e => setHotelForm({ ...hotelForm, roomType: e.target.value })} placeholder="Twin" /></label><label className="field"><span>Harga / malam</span><input type="number" min="0" value={hotelForm.pricePerNight} onChange={e => setHotelForm({ ...hotelForm, pricePerNight: Number(e.target.value) })} /></label><label className="field"><span>Fasilitas</span><input value={hotelForm.facilities} onChange={e => setHotelForm({ ...hotelForm, facilities: e.target.value })} placeholder="Breakfast, Pool, Wi-Fi" /></label></div> : <div className="form-grid three"><label className="field"><span>Nama destinasi<b>*</b></span><input value={destinationForm.name} onChange={e => setDestinationForm({ ...destinationForm, name: e.target.value })} placeholder="Contoh: Tirta Gangga" /></label><label className="field"><span>Area<b>*</b></span><input value={destinationForm.area} onChange={e => setDestinationForm({ ...destinationForm, area: e.target.value })} placeholder="Karangasem" /></label><label className="field"><span>Durasi kunjungan</span><div className="input-suffix"><input type="number" min="15" value={destinationForm.duration} onChange={e => setDestinationForm({ ...destinationForm, duration: Number(e.target.value) })} /><span>menit</span></div></label><label className="field field-wide"><span>Catatan itinerary</span><textarea rows={3} value={destinationForm.notes} onChange={e => setDestinationForm({ ...destinationForm, notes: e.target.value })} placeholder="Tiket termasuk, waktu terbaik, catatan operasional" /></label></div>}<div className="master-editor-actions"><button className="button button-secondary" onClick={resetForm}>Batal</button><button className="button button-primary" onClick={isHotel ? saveHotel : saveDestination}><Save size={16} /> Simpan data</button></div></div>}
    <div className="master-grid">{currentRows.map(item => { const row = item as HotelMaster & DestinationMaster; const builtin = row.id.startsWith("h") || row.id.startsWith("d"); return <div className="master-card" key={row.id}><div className="master-card-icon">{isHotel ? <Building2 size={18} /> : <MapPin size={18} />}</div><div className="master-card-body"><strong>{row.name}</strong><span>{row.area} · {isHotel ? `${row.stars} bintang · ${row.roomType}` : `${row.duration} menit`}</span><small>{isHotel ? row.facilities || "Fasilitas belum diisi" : row.notes || "Siap digunakan dalam itinerary"}</small></div><div className="master-card-value">{isHotel ? formatIDR(row.pricePerNight) : "Aktif"}</div><div className="master-card-actions"><button className="icon-button subtle" title="Edit" onClick={() => isHotel ? editHotel(row) : editDestination(row)}><Edit3 size={15} /></button><button className="icon-button danger-ghost" title={builtin ? "Data bawaan" : "Hapus"} onClick={() => removeRow(row.id, builtin)}><Trash2 size={15} /></button></div></div>; })}</div>
    {!currentRows.length && <div className="empty-state"><Check size={18} /><strong>Belum ada data yang cocok</strong><span>Tambahkan data master baru dengan tombol di atas.</span></div>}
    <div className="master-note"><Building2 size={17} /><div><strong>Data tersimpan di workspace akun ini</strong><span>Data hotel dan destinasi yang kamu tambah akan tetap tersedia saat kembali ke generator.</span></div><button className="text-button" onClick={() => setView("builder")}>Buka generator</button></div>
  </div>;
}
