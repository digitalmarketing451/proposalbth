import { createClient } from "@supabase/supabase-js";
import type { Proposal } from "./proposal-engine";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isSupabaseConfigured = Boolean(supabase);

function stableUuid(seed: string) {
  let hash = 2166136261;
  const chunks: string[] = [];
  for (let chunk = 0; chunk < 4; chunk += 1) {
    for (const character of `${seed}:${chunk}`) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    chunks.push((hash >>> 0).toString(16).padStart(8, "0"));
  }
  const hex = chunks.join("").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function uuidForProposal(proposal: Proposal, actor?: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(proposal.id)
    ? proposal.id
    : stableUuid(`${actor ?? proposal.sales}:${proposal.id}`);
}

export async function saveProposalToSupabase(proposal: Proposal, actor?: string) {
  if (!supabase) return { ok: false, reason: "demo-mode" } as const;
  const syncedId = uuidForProposal(proposal, actor);
  proposal.id = syncedId;
  const { error } = await supabase.from("proposals").upsert({
    id: syncedId,
    proposal_number: proposal.number,
    version: proposal.version,
    status: proposal.status,
    client_name: proposal.clientName,
    client_phone: proposal.clientPhone,
    client_email: proposal.clientEmail,
    institution: proposal.institution,
    package_code: proposal.packageCode,
    category: proposal.category,
    total_participants: proposal.totalParticipants,
    paid_pax: proposal.paidPax,
    free_pax: proposal.freePax,
    origin_city: proposal.originCity,
    special_facilities: proposal.specialFacilities ? [proposal.specialFacilities] : [],
    title: proposal.title,
    description: proposal.description,
    dp_percent: proposal.dpPercent,
    validity_days: proposal.validityDays,
    created_by: actor ?? proposal.sales,
    updated_at: proposal.updatedAt,
  });
  if (error) return { ok: false, reason: error.message } as const;
  return { ok: true } as const;
}

export async function listSupabaseProposals() {
  if (!supabase) return [] as Proposal[];
  const { data } = await supabase.from("proposals").select("*").order("updated_at", { ascending: false }).limit(50);
  return (data ?? []) as unknown as Proposal[];
}
