// // types/events.ts
// import { Database } from '@/types/database';

// // Base event type
// export type BaseEvent = Database['public']['Tables']['events']['Row'];

// // Event with organizer for slider
// export type EventWithOrganizer = BaseEvent & {
//   organizers: Pick<Database['public']['Tables']['organizers']['Row'], 'name' | 'instagram'> | null;
// };

// // Event with full relations for cards
// export type EventWithRelations = BaseEvent & {
//   organizers: Pick<Database['public']['Tables']['organizers']['Row'], 'name' | 'instagram'> | null;
//   levels: Pick<Database['public']['Tables']['levels']['Row'], 'id' | 'name'>[] | null;
//   fields: Pick<Database['public']['Tables']['fields']['Row'], 'id' | 'name'>[] | null;
// };

// // Utility function to convert slider event to card event
// export function enrichEventForCard(event: EventWithOrganizer): EventWithRelations {
//   return {
//     ...event,
//     levels: event.levels || [],
//     fields: event.fields || [],
//   } as EventWithRelations;
// }