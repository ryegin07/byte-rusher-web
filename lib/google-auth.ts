
export type GoogleUser = {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  type?: 'resident' | 'staff';
};

export interface GoogleAuthResponse {
  success: boolean;
  user?: GoogleUser;
  error?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window not available'));
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) { existing.addEventListener('load', () => resolve()); if ((existing as any).loaded) resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => { (s as any).loaded = true; resolve(); };
    s.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(s);
  });
}

export async function signInWithGoogle(userType: 'resident' | 'staff' = 'resident'): Promise<GoogleAuthResponse> {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '109015417527-pqpv7b86d0a2q5lie42relrcv4vu5hl8.apps.googleusercontent.com';
    if (!clientId) {
      return { success: false, error: 'Google Client ID is not configured' };
    }
    await loadScript('https://accounts.google.com/gsi/client');
    if (!window.google || !window.google.accounts?.id) {
      return { success: false, error: 'Google Identity Services not available' };
    }
    const credential: string = await new Promise((resolve, reject) => {
      let resolved = false;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: any) => { if (!resolved) { resolved = true; resolve(resp?.credential); } },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      // Use a momentary prompt as a popup-like flow
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // fallback: force a new window pop-up
          try {
            window.google.accounts.id.prompt();
          } catch (e) { if (!resolved) reject(new Error('Sign-in was canceled')); }
        }
      });
      // Also add a 20s timeout to avoid hanging
      setTimeout(() => { if (!resolved) reject(new Error('Google sign-in timed out')); }, 20000);
    });
    if (!credential) return { success: false, error: 'No credential returned' };

    // Send credential to API to verify & create session
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential, userType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      return { success: false, error: data?.message || 'Sign-in failed' };
    }
    return { success: true, user: data.user as GoogleUser };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Google sign-in failed' };
  }
}

export function isGoogleConfigured(): boolean {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '109015417527-pqpv7b86d0a2q5lie42relrcv4vu5hl8.apps.googleusercontent.com';
  return !!clientId && clientId !== 'your-google-client-id-here';
}
