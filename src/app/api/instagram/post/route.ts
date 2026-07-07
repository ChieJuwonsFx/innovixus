import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateUploadSignature, deleteMultipleCloudinaryImages } from '@/lib/cloudinary.action';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const IG_API = 'https://graph.instagram.com/v25.0';

async function getToken(): Promise<string> {
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'ig_access_token').maybeSingle();
  if (data?.value) return data.value;
  return (process.env.IG_ACCESS_TOKEN || '').trim();
}

async function uploadToCloudinary(imageDataUrl: string, idx: number): Promise<string> {
  const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const { timestamp, signature } = await generateUploadSignature('instagram-posts');
  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'image/png' }), `instagram-post-${idx}.png`);
  formData.append('api_key', apiKey!);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', 'instagram-posts');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
  return data.secure_url;
}

export async function POST(req: Request) {
  try {
    const { imageDataUrls, caption } = await req.json();
    if (!imageDataUrls?.length || !caption)
      return NextResponse.json({ error: 'imageDataUrls[] and caption required' }, { status: 400 });

    const token = await getToken();
    const userId = process.env.IG_ACCOUNT_ID!;
    if (!token) return NextResponse.json({ error: 'IG token not found' }, { status: 400 });

    const urls = imageDataUrls.slice(0, 10);
    const publicUrls: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      publicUrls.push(await uploadToCloudinary(urls[i], i));
    }

    if (publicUrls.length === 1) {
      const createRes = await fetch(`${IG_API}/${userId}/media?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: publicUrls[0], caption }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error?.message || 'Media creation failed');

      const pubRes = await fetch(`${IG_API}/${userId}/media_publish?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: createData.id }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error?.message || 'Publish failed');

      try { await deleteMultipleCloudinaryImages(publicUrls); } catch {}
      return NextResponse.json({ success: true, mediaId: pubData.id, urls: publicUrls });
    }

    const childIds: string[] = [];
    for (const url of publicUrls) {
      const res = await fetch(`${IG_API}/${userId}/media?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, is_carousel_item: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Fallback to single image if carousel items fail
        console.error('Carousel item failed, falling back to single:', data);
        break;
      }
      childIds.push(data.id);
    }

    // If carousel items failed, try single image with first URL
    if (childIds.length < 2) {
      const singleRes = await fetch(`${IG_API}/${userId}/media?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: publicUrls[0], caption }),
      });
      const singleData = await singleRes.json();
      if (!singleRes.ok) throw new Error(singleData.error?.message || 'Single media creation failed');

      const pubRes = await fetch(`${IG_API}/${userId}/media_publish?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: singleData.id }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error?.message || 'Publish failed');
      try { await deleteMultipleCloudinaryImages(publicUrls); } catch {}
      return NextResponse.json({ success: true, mediaId: pubData.id, urls: publicUrls.slice(0, 1) });
    }

    // Carousel
    let carData;
    for (let attempt = 0; attempt < 3; attempt++) {
      const carRes = await fetch(`${IG_API}/${userId}/media?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds, caption }),
      });
      carData = await carRes.json();
      if (carRes.ok) break;
      await new Promise(r => setTimeout(r, 2000));
    }
    if (!carData?.id) throw new Error(carData?.error?.message || 'Carousel creation failed');

    // Publish with retry
    let pubData;
    for (let attempt = 0; attempt < 3; attempt++) {
      const pubRes = await fetch(`${IG_API}/${userId}/media_publish?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: carData.id }),
      });
      pubData = await pubRes.json();
      if (pubRes.ok) break;
      await new Promise(r => setTimeout(r, 3000));
    }
    if (!pubData?.id) throw new Error(pubData?.error?.message || 'Publish failed');

    try { await deleteMultipleCloudinaryImages(publicUrls); } catch {}
    return NextResponse.json({ success: true, mediaId: pubData.id, urls: publicUrls, childCount: childIds.length });
  } catch (e) {
    console.error('Instagram post error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to post' }, { status: 500 });
  }
}
