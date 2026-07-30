/**
 * Vercel serverless upload — stores images in Supabase Storage when browser upload is blocked.
 * Requires env vars in Vercel Project Settings (see frontend/.env.example).
 */
import { createClient } from '@supabase/supabase-js';

function getEnv() {
  return {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, anonKey, serviceKey } = getEnv();

    if (!url || !anonKey || !serviceKey) {
      return res.status(500).json({
        error:
          'Server upload is not configured. In Vercel, set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY, then redeploy.',
      });
    }

    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized — sign in again' });
    }

    const authClient = createClient(url, anonKey);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { base64, fileName, bucket = 'produce', contentType } = req.body || {};

    if (!base64 || !fileName) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    if (!['produce', 'avatars'].includes(bucket)) {
      return res.status(400).json({ error: 'Invalid storage bucket' });
    }

    const base64Data = String(base64).includes(',') ? String(base64).split(',')[1] : String(base64);
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large (max 4MB after compression)' });
    }

    const safeName = String(fileName).replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'image.jpg';
    const storagePath =
      bucket === 'avatars'
        ? `${user.id}/profile-${Date.now()}.jpg`
        : `${user.id}/${Date.now()}-${safeName}`;

    const admin = createClient(url, serviceKey);
    const { error: uploadError } = await admin.storage.from(bucket).upload(storagePath, buffer, {
      upsert: true,
      contentType: contentType || 'image/jpeg',
      cacheControl: '3600',
    });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: publicUrlData } = admin.storage.from(bucket).getPublicUrl(storagePath);
    return res.status(200).json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('upload-image API error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};
