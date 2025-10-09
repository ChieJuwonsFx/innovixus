import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deleteMultipleCloudinaryImages } from '@/lib/cloudinary.action';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    console.log(`Cleaning up events closed before: ${sevenDaysAgoStr}`);

    const { data: oldEvents, error: fetchError } = await supabase
      .from('events')
      .select('id, poster, kategori, close_date, extend_date')
      .not('close_date', 'is', null);

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch events', details: fetchError.message },
        { status: 500 }
      );
    }

    const eventsToDelete = oldEvents?.filter(event => {
      const finalCloseDate = event.extend_date || event.close_date;
      if (!finalCloseDate) return false;
      
      const closeDate = new Date(finalCloseDate);
      return closeDate < sevenDaysAgo;
    }) || [];

    if (eventsToDelete.length === 0) {
      console.log('No old events to delete');
      return NextResponse.json({
        success: true,
        message: 'No events to cleanup',
        deleted: 0
      });
    }

    console.log(`Found ${eventsToDelete.length} events to delete`);

    let deletedCount = 0;
    const errors = [];

    for (const event of eventsToDelete) {
      try {
        if (event.poster && Array.isArray(event.poster)) {
          const imageUrls = event.poster
            .map((p: { url: string }) => p.url)
            .filter(Boolean);
          
          if (imageUrls.length > 0) {
            console.log(`Deleting ${imageUrls.length} images for event ${event.id}`);
            await deleteMultipleCloudinaryImages(imageUrls);
          }
        }
        
        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .eq('id', event.id);

        if (deleteError) {
          console.error(`Failed to delete event ${event.id}:`, deleteError);
          errors.push({ eventId: event.id, error: deleteError.message });
        } else {
          deletedCount++;
          console.log(`Successfully deleted event: ${event.id}`);
        }
      } catch (err) {
        console.error(`Error processing event ${event.id}:`, err);
        errors.push({ eventId: event.id, error: String(err) });
      }
    }

    console.log(`Cleanup completed: ${deletedCount}/${eventsToDelete.length} events deleted`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed`,
      deleted: deletedCount,
      total: eventsToDelete.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Unexpected error during cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}