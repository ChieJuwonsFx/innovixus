import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateUploadSignature } from '@/lib/cloudinary.action';

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

async function uploadToCloudinary(imageDataUrl: string): Promise<string> {
  const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const { timestamp, signature } = await generateUploadSignature('instagram-posts');
  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'image/png' }), 'instagram-post.png');
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
    const { imageDataUrl, caption } = await req.json();
    if (!imageDataUrl || !caption)
      return NextResponse.json({ error: 'imageDataUrl and caption required' }, { status: 400 });

    const token = await getToken();
    const userId = process.env.IG_ACCOUNT_ID!;
    if (!token) return NextResponse.json({ error: 'IG token not found' }, { status: 400 });

    const imageUrl = await uploadToCloudinary(imageDataUrl);

    // 1. Create media container
    const createRes = await fetch(`${IG_API}/${userId}/media?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(createData.error?.message || 'Media creation failed');

    // 2. Publish
    const pubRes = await fetch(`${IG_API}/${userId}/media_publish?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: createData.id }),
    });
    const pubData = await pubRes.json();
    if (!pubRes.ok) throw new Error(pubData.error?.message || 'Publish failed');

    return NextResponse.json({ success: true, mediaId: pubData.id, url: imageUrl });
  } catch (e) {
    console.error('Instagram post error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to post' }, { status: 500 });
  }
}
