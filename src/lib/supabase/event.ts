import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function getEventWithRelations(id: string) {
  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        organizers (
          id,
          name,
          instagram,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (eventError) {
      console.error('Event query error:', eventError);
      return null;
    }

    if (!event) return null;

    const [
      { data: eventLevels },
      { data: eventFields }, 
      { data: prices },
      { data: partnership }
    ] = await Promise.all([

      supabase
        .from('event_levels')
        .select(`
          levels (
            id,
            name
          )
        `)
        .eq('event_id', id),

      supabase
        .from('event_fields')
        .select(`
          fields (
            id,
            name
          )
        `)
        .eq('event_id', id),

      supabase
        .from('prices')
        .select('*')
        .eq('event_id', id)
        .order('start_date', { ascending: true }),

      event.partnership_id
        ? supabase
            .from('partnerships')
            .select(`
              *,
              packages (*)
            `)
            .eq('id', event.partnership_id)
            .single()
        : Promise.resolve({ data: null })
    ]);

    return {
      ...event,
      levels: eventLevels?.map(el => el.levels).filter(Boolean) || null,
      fields: eventFields?.map(ef => ef.fields).filter(Boolean) || null,
      prices: prices || null,
      partnerships: partnership || null,
    };

  } catch (error) {
    console.error('Error in getEventWithRelations:', error);
    return null;
  }
}

export async function getEventsByCategory(category: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizers (
          name,
          instagram
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Events by category error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEventsByCategory:', error);
    return [];
  }
}