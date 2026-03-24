import { Platform } from 'react-native';

// ─── Backend URL Configuration ───────────────────────────────────────────────
// For local development:   http://10.0.2.2:3000  (Android emulator)
// For physical device:     http://<your-local-ip>:3000
// For production APK:      Set DEPLOYED_BACKEND_URL below to your Railway/Render URL
//
// HOW TO SWITCH:
//   1. Deploy backend to Railway (see README / walkthrough)
//   2. Replace the empty string below with your deployed URL, e.g:
//      const DEPLOYED_BACKEND_URL = 'https://clipart-backend.up.railway.app';
//   3. Rebuild the APK via: eas build --platform android --profile preview

const DEPLOYED_BACKEND_URL = ''; // ← Paste your Railway/Render URL here when deployed

const getApiBase = () => {
  if (DEPLOYED_BACKEND_URL) return DEPLOYED_BACKEND_URL;
  return Platform.select({
    android: 'http://10.0.2.2:3000',   // Android emulator → localhost
    default: 'http://localhost:3000',  // Web / iOS sim
  }) as string;
};

const API_BASE_URL = getApiBase();

interface GenerateResponse {
  predictionId?: string;
  output?: string[];
  error?: string;
}

interface StatusResponse {
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string[];
  error?: string;
}

export async function generateClipart(imageBase64: string, style: string): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64, style }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function pollStatus(predictionId: string): Promise<string> {
  const MAX_ATTEMPTS = 90;  // 3 minutes max (flux-kontext-pro can take ~60s)
  const INTERVAL = 2000;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const response = await fetch(`${API_BASE_URL}/api/status/${predictionId}`);

    if (!response.ok) {
      throw new Error('Failed to check status');
    }

    const data: StatusResponse = await response.json();

    if (data.status === 'succeeded' && data.output && data.output.length > 0) {
      return data.output[0];
    }

    if (data.status === 'failed') {
      throw new Error(data.error || 'Image generation failed. Please try again.');
    }

    await new Promise(resolve => setTimeout(resolve, INTERVAL));
  }

  throw new Error('Generation timed out. Please try again.');
}
