export type ProposalStatus =
  | "Draft"
  | "Menunggu Approval"
  | "Disetujui Internal"
  | "Terkirim"
  | "Dilihat Klien"
  | "Disetujui Klien"
  | "Ditolak"
  | "Kedaluwarsa";

export type Activity = {
  id: string;
  start: string;
  end?: string;
  type: "Kedatangan" | "Wisata" | "Makan" | "Hiburan" | "Belanja" | "Transfer" | "Check-in/out" | "Lainnya";
  name: string;
  location?: string;
  notes?: string;
  restaurant?: string;
};

export type ItineraryDay = {
  id: string;
  number: number;
  title: string;
  location: string;
  activities: Activity[];
};

export type Hotel = {
  id: string;
  name: string;
  stars: number;
  area: string;
  roomType: "Twin" | "Double" | "Triple";
  occupancy: number;
  pricePerNight: number;
  facilities: string[];
};

export type ProposalOption = {
  id: string;
  name: string;
  hotelId?: string;
  pricePerPerson: number;
  pricingMode: "manual" | "kalkulasi";
  recommended?: boolean;
  notes?: string;
};

export type Proposal = {
  id: string;
  number: string;
  version: number;
  status: ProposalStatus;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  institution: string;
  packageCode: string;
  category: string;
  totalParticipants: number;
  paidPax: number;
  freePax: number;
  originCity: string;
  specialFacilities: string;
  startDate: string;
  endDate: string;
  alternativeDate?: string;
  title: string;
  description: string;
  itinerary: ItineraryDay[];
  options: ProposalOption[];
  flight: {
    show: boolean;
    route: string;
    airline: string;
    arrival: string;
    return: string;
    pricePerPerson: number;
    paxFlight: number;
    complimentary: string;
    overrideReason?: string;
  };
  included: string[];
  excluded: string[];
  dpPercent: number;
  validityDays: number;
  createdAt: string;
  updatedAt: string;
  sales: string;
};

export const hotels: Hotel[] = [
  { id: "h1", name: "Sanur Resort Watujimbar", stars: 4, area: "Sanur", roomType: "Twin", occupancy: 2, pricePerNight: 850000, facilities: ["Breakfast", "Pool", "Wi-Fi"] },
  { id: "h2", name: "The Anvaya Beach Resort", stars: 5, area: "Kuta", roomType: "Twin", occupancy: 2, pricePerNight: 1450000, facilities: ["Breakfast", "Beachfront", "Pool"] },
  { id: "h3", name: "Swiss-Belresort Watu Jimbar", stars: 4, area: "Sanur", roomType: "Twin", occupancy: 2, pricePerNight: 975000, facilities: ["Breakfast", "Pool", "Meeting room"] },
];

export const destinations = [
  { id: "d1", name: "Tanjung Benoa", area: "Bali Selatan", duration: 150 },
  { id: "d2", name: "Melasti Beach", area: "Bali Selatan", duration: 120 },
  { id: "d3", name: "Uluwatu Temple", area: "Bali Selatan", duration: 120 },
  { id: "d4", name: "Tari Kecak Uluwatu", area: "Bali Selatan", duration: 120 },
  { id: "d5", name: "Kintamani & Tegallalang", area: "Bali Tengah", duration: 240 },
  { id: "d6", name: "Desa Penglipuran", area: "Bangli", duration: 120 },
];

export const restaurants = [
  { id: "r1", name: "Bale Udang Mang Engking", area: "Kuta", type: "Siang", price: 125000 },
  { id: "r2", name: "Jimbaran Seafood Dinner", area: "Jimbaran", type: "Malam", price: 185000 },
  { id: "r3", name: "Kintamani Grand Pancasari", area: "Kintamani", type: "Siang", price: 110000 },
];

export const packageTemplates = [
  { code: "BTH-3H2M", category: "Paket Tour Bali 3 Hari 2 Malam", days: 3, nights: 2, description: "Nikmati Bali dari pesisir selatan hingga panorama pegunungan dalam perjalanan 3 hari 2 malam yang dirancang nyaman untuk rombongan.", included: ["Menginap 2 malam", "Sarapan 2x di hotel", "Transportasi private", "Tour guide", "Tiket masuk destinasi", "Parkir, tol, dan asuransi"], excluded: ["Tiket pesawat", "Tips driver dan guide", "Pengeluaran pribadi"] },
  { code: "BTH-4H3M", category: "Paket Eksplorasi Bali 4 Hari 3 Malam", days: 4, nights: 3, description: "Eksplorasi lengkap Bali Selatan, Ubud, dan Kintamani dengan tempo perjalanan yang santai.", included: ["Menginap 3 malam", "Sarapan 3x di hotel", "Transportasi private", "Tour guide", "Tiket masuk destinasi"], excluded: ["Tiket pesawat", "Tips driver dan guide", "Pengeluaran pribadi"] },
];

const daySeed = (id: string, number: number, title: string, location: string, activities: Activity[]): ItineraryDay => ({ id, number, title, location, activities });

export const defaultItinerary: ItineraryDay[] = [
  daySeed("day-1", 1, "Kedatangan & Sunset Bali Selatan", "Bandara • Tanjung Benoa • Jimbaran", [
    { id: "a1", start: "09:40", end: "10:20", type: "Kedatangan", name: "Penjemputan di Bandara I Gusti Ngurah Rai", location: "DPS", notes: "Menyesuaikan jadwal penerbangan" },
    { id: "a2", start: "11:30", end: "14:00", type: "Wisata", name: "Water sport dan santai di Tanjung Benoa", location: "Tanjung Benoa", notes: "FREE 1x Banana Boat" },
    { id: "a3", start: "14:15", end: "15:30", type: "Makan", name: "Makan siang", restaurant: "Bale Udang Mang Engking", notes: "Menu set nusantara" },
    { id: "a4", start: "16:00", end: "18:00", type: "Wisata", name: "Menikmati sunset di Melasti Beach", location: "Melasti Beach" },
    { id: "a5", start: "18:30", end: "20:30", type: "Makan", name: "Jimbaran seafood dinner", restaurant: "Jimbaran Seafood Dinner" },
    { id: "a6", start: "21:00", end: "21:30", type: "Check-in/out", name: "Check-in hotel dan istirahat", location: "Sanur" },
  ]),
  daySeed("day-2", 2, "Pesona Bali Selatan", "Uluwatu • Kecak • Jimbaran", [
    { id: "a7", start: "07:00", end: "08:00", type: "Makan", name: "Sarapan di hotel", restaurant: "Sanur Resort Watujimbar" },
    { id: "a8", start: "09:00", end: "12:00", type: "Wisata", name: "Uluwatu Temple & tebing karang", location: "Uluwatu Temple" },
    { id: "a9", start: "12:15", end: "13:30", type: "Makan", name: "Makan siang", restaurant: "Bale Udang Mang Engking" },
    { id: "a10", start: "15:30", end: "17:30", type: "Hiburan", name: "Pertunjukan Tari Kecak saat sunset", location: "Uluwatu", notes: "Tiket pertunjukan termasuk" },
    { id: "a11", start: "18:30", end: "20:30", type: "Makan", name: "Jimbaran seafood dinner", restaurant: "Jimbaran Seafood Dinner" },
  ]),
  daySeed("day-3", 3, "Belanja & Kembali", "Sanur • Krisna • Bandara", [
    { id: "a12", start: "07:00", end: "08:00", type: "Makan", name: "Sarapan di hotel", restaurant: "Sanur Resort Watujimbar" },
    { id: "a13", start: "09:00", end: "11:00", type: "Belanja", name: "Belanja oleh-oleh Bali", location: "Krisna Oleh-Oleh" },
    { id: "a14", start: "11:30", end: "13:00", type: "Makan", name: "Makan siang", restaurant: "Bale Udang Mang Engking" },
    { id: "a15", start: "13:30", end: "15:00", type: "Transfer", name: "Transfer menuju Bandara", location: "DPS", notes: "Tiba minimal 3 jam sebelum penerbangan" },
  ]),
];

export const seedProposals: Proposal[] = [
  {
    id: "proposal-001", number: "PRP/2026/10/0001", version: 1, status: "Terkirim", clientName: "Ilham Bagus", clientPhone: "+62 812 3456 7890", clientEmail: "ilham@contoh.co", institution: "PT Nusantara Ceria", packageCode: "BTH-3H2M", category: "Paket Tour Bali 3 Hari 2 Malam", totalParticipants: 26, paidPax: 25, freePax: 1, originCity: "Jakarta", specialFacilities: "Vegetarian 2 pax; 1 kursi roda", startDate: "2026-11-05", endDate: "2026-11-07", alternativeDate: "2026-11-06 – 2026-11-08", title: "PENAWARAN PAKET TOUR ( 26 PAX )", description: "Nikmati Bali dari pesisir selatan hingga panorama pegunungan dalam perjalanan 3 hari 2 malam yang dirancang nyaman untuk rombongan.", itinerary: defaultItinerary, options: [{ id: "option-1", name: "Paket Tour + Hotel Bintang 4", hotelId: "h1", pricePerPerson: 2790000, pricingMode: "manual", recommended: true, notes: "Twin sharing • 13 kamar • 2 malam" }, { id: "option-2", name: "Paket Tour Tanpa Hotel", pricePerPerson: 1705000, pricingMode: "manual", notes: "Transportasi, makan, tiket, dan guide" }], flight: { show: true, route: "CGK – DPS PP", airline: "Citilink", arrival: "09:40 / 10:00 - Tiba 12:30 / 12:55 WITA", return: "DPS – CGK • 19:30 WITA", pricePerPerson: 2150000, paxFlight: 26, complimentary: "FREE bagasi 20 kg" }, included: ["Menginap 2 malam di Sanur Resort Watujimbar (*4)", "Sarapan 2x di hotel", "Makan siang 3x dan makan malam 2x", "Bus 30 seat dengan sopir dan bensin", "Parkir, tol, asuransi, dan tour guide", "Tiket masuk destinasi dan Tari Kecak", "FREE 1x Banana Boat dan air mineral"], excluded: ["Tiket pesawat (estimasi terpisah)", "Tips driver dan guide", "Pengeluaran pribadi"], dpPercent: 30, validityDays: 14, createdAt: "2026-10-03T09:20:00+08:00", updatedAt: "2026-10-04T14:12:00+08:00", sales: "Sari Wulandari",
  },
  {
    id: "proposal-002", number: "PRP/2026/10/0002", version: 1, status: "Menunggu Approval", clientName: "Rina Kurnia", clientPhone: "+62 811 2233 4455", clientEmail: "rina@contoh.co", institution: "Komunitas Jelajah", packageCode: "BTH-4H3M", category: "Paket Eksplorasi Bali 4 Hari 3 Malam", totalParticipants: 42, paidPax: 41, freePax: 1, originCity: "Surabaya", specialFacilities: "", startDate: "2026-11-19", endDate: "2026-11-22", title: "PENAWARAN PAKET TOUR ( 42 PAX )", description: "Eksplorasi lengkap Bali Selatan, Ubud, dan Kintamani dengan tempo perjalanan yang santai.", itinerary: defaultItinerary, options: [{ id: "option-3", name: "Paket Eksplorasi + Hotel Bintang 5", hotelId: "h2", pricePerPerson: 4250000, pricingMode: "kalkulasi", recommended: true }], flight: { show: false, route: "", airline: "", arrival: "", return: "", pricePerPerson: 0, paxFlight: 42, complimentary: "" }, included: ["Menginap 3 malam", "Sarapan 3x di hotel", "Transportasi private", "Tour guide", "Tiket masuk destinasi"], excluded: ["Tiket pesawat", "Tips driver dan guide", "Pengeluaran pribadi"], dpPercent: 30, validityDays: 14, createdAt: "2026-10-08T11:00:00+08:00", updatedAt: "2026-10-08T11:10:00+08:00", sales: "Sari Wulandari",
  },
  {
    id: "proposal-003", number: "PRP/2026/09/0098", version: 2, status: "Disetujui Klien", clientName: "Budi Santoso", clientPhone: "+62 813 9900 1100", clientEmail: "budi@contoh.co", institution: "CV Bali Maju", packageCode: "BTH-3H2M", category: "Paket Tour Bali 3 Hari 2 Malam", totalParticipants: 18, paidPax: 18, freePax: 0, originCity: "Bandung", specialFacilities: "", startDate: "2026-10-14", endDate: "2026-10-16", title: "PENAWARAN PAKET TOUR ( 18 PAX )", description: "Nikmati Bali dari pesisir selatan hingga panorama pegunungan.", itinerary: defaultItinerary, options: [{ id: "option-4", name: "Paket Tour + Hotel Bintang 4", hotelId: "h3", pricePerPerson: 3150000, pricingMode: "manual", recommended: true }], flight: { show: false, route: "", airline: "", arrival: "", return: "", pricePerPerson: 0, paxFlight: 18, complimentary: "" }, included: ["Menginap 2 malam", "Sarapan 2x di hotel", "Transportasi private", "Tour guide"], excluded: ["Tiket pesawat", "Tips driver dan guide", "Pengeluaran pribadi"], dpPercent: 30, validityDays: 14, createdAt: "2026-09-26T08:00:00+08:00", updatedAt: "2026-10-01T16:40:00+08:00", sales: "Dimas Pratama",
  },
];

export function calculatePax(total: number, freeEvery = 25) {
  const safeTotal = Math.max(1, Math.floor(total || 1));
  let free = 0;
  for (let i = 0; i < 20; i += 1) free = Math.floor((safeTotal - free) / freeEvery);
  return { total: safeTotal, free: Math.max(0, free), paid: Math.max(1, safeTotal - free) };
}

export function calculateRoomCount(pax: number, occupancy: number) {
  return Math.max(0, Math.ceil(Math.max(0, pax) / Math.max(1, occupancy)));
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.round(value || 0));
}

export function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function formatDateRange(start: string, end: string) {
  if (!start || !end) return "Tanggal belum diatur";
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  if (sameMonth) return `${s.getDate()} – ${e.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
  return `${s.toLocaleDateString("id-ID", opts)} – ${e.toLocaleDateString("id-ID", opts)}`;
}

export function timeToMinutes(value?: string) {
  if (!value) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function displayTime(value?: string) {
  return value ? value.replace(":", ".") : "—";
}

export function calculateOptionTotal(option: ProposalOption, paidPax: number) {
  return Math.round(option.pricePerPerson * paidPax);
}

export function calculateProposalTotal(proposal: Proposal) {
  return Math.max(...proposal.options.map(option => calculateOptionTotal(option, proposal.paidPax)), 0);
}

export function calculateDP(proposal: Proposal) {
  return calculateProposalTotal(proposal) * (proposal.dpPercent / 100);
}

export function validateItinerary(proposal: Proposal) {
  const errors: string[] = [];
  const warnings: string[] = [];
  proposal.itinerary.forEach(day => {
    const sorted = [...day.activities].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    let previous: Activity | undefined;
    sorted.forEach(activity => {
      if (activity.end && timeToMinutes(activity.end) <= timeToMinutes(activity.start)) errors.push(`${day.title}: waktu selesai kegiatan “${activity.name}” harus setelah waktu mulai.`);
      if (previous?.end && timeToMinutes(activity.start) < timeToMinutes(previous.end)) errors.push(`${day.title}: kegiatan “${activity.name}” bertumpang tindih dengan “${previous.name}”.`);
      if (previous?.end && timeToMinutes(activity.start) - timeToMinutes(previous.end) > 90) warnings.push(`${day.title}: ada celah ${timeToMinutes(activity.start) - timeToMinutes(previous.end)} menit sebelum “${activity.name}”.`);
      if (activity.type === "Makan" && !activity.restaurant) warnings.push(`${day.title}: “${activity.name}” belum memilih restoran master.`);
      previous = activity;
    });
  });
  if (proposal.flight.show && proposal.flight.arrival) {
    const firstArrival = proposal.itinerary[0]?.activities.find(activity => activity.type === "Kedatangan");
    if (firstArrival && timeToMinutes(firstArrival.start) < 12 * 60 && proposal.flight.arrival.includes("12:")) warnings.push("Jam kedatangan itinerary lebih awal dari estimasi flight yang dipilih.");
  }
  if (proposal.flight.show && proposal.flight.paxFlight !== proposal.totalParticipants && !proposal.flight.overrideReason) errors.push("Jumlah pax flight berbeda dari jumlah peserta. Isi alasan override terlebih dahulu.");
  return { errors, warnings };
}

export function getStatusTone(status: ProposalStatus) {
  if (status === "Disetujui Klien") return "success";
  if (status === "Menunggu Approval") return "warning";
  if (status === "Terkirim" || status === "Dilihat Klien") return "info";
  if (status === "Ditolak" || status === "Kedaluwarsa") return "danger";
  return "muted";
}
