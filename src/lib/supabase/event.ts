import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function getEventWithRelations(id: string) {
  try {
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(`
        *,
        organizers (id, name, instagram, created_at, updated_at),
        event_levels (levels (id, name, created_at, updated_at)),
        event_fields (fields (id, name, only_lomba, created_at, updated_at)),
        prices (*)
      `)
      .eq("id", id)
      .single();

    if (eventError) {
      console.error("Event query error:", eventError);
      return null;
    }

    if (!event) return null;

    let partnership = null;
    if (event.partnership_id) {
      const { data: p } = await supabase
        .from("partnerships")
        .select("*, packages (*)")
        .eq("id", event.partnership_id)
        .single();
      partnership = p;
    }

    return {
      ...event,
      levels: (event as any).event_levels?.map((el: any) => el.levels).filter(Boolean) || null,
      fields: (event as any).event_fields?.map((ef: any) => ef.fields).filter(Boolean) || null,
      prices: (event as any).prices || null,
      partnerships: partnership,
    };
  } catch (error) {
    console.error("Error in getEventWithRelations:", error);
    return null;
  }
}

export async function getEventsByCategory(
  category: string,
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        organizers (
          name,
          instagram
        )
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Events by category error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getEventsByCategory:", error);
    return [];
  }
}
