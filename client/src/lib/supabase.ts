import { createClient } from "@supabase/supabase-js";
import type { Proposal } from "./proposal-engine";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isSupabaseConfigured = Boolean(supabase);

export async function saveProposalToSupabase(proposal: Proposal, actor?: string) {
  if (!supabase) return { ok: false, reason: "demo-mode" } as const;
  const { error } = await supabase.from("proposals").upsert({
    id: proposal.id,
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
