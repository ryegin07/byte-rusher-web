
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { GoogleUser } from "@/lib/google-auth";

type GoogleLoginButtonProps = {
  onSuccess?: (user: GoogleUser) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
};

declare global {
  interface Window { google?: any }
}

export function GoogleLoginButton({ onSuccess, onError, disabled }: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [rendered, setRendered] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '109015417527-pqpv7b86d0a2q5lie42relrcv4vu5hl8.apps.googleusercontent.com';

  // Load script (if not already) and mark ready
  useEffect(() => {
    if (!clientId) return; // no client id configured
    const exists = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
    if (exists && (window as any).google?.accounts?.id) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    s.onerror = () => console.error("Failed to load Google script");
    document.head.appendChild(s);
  }, [clientId]);

  // Render the official Google button once
  useEffect(() => {
    if (!ready || rendered) return;
    if (!clientId) return;
    if (!containerRef.current) return;
    try {
      window.google!.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          try {
            const r = await fetch('/api/auth/google-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ credential: resp?.credential, userType: 'resident' }),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok || !data?.ok) {
              const msg = data?.message || 'Google sign-in failed';
              onError ? onError(msg) : alert(msg);
              return;
            }
            onSuccess?.(data.user as GoogleUser);
            window.location.href = '/resident/dashboard';
          } catch (e: any) {
            onError ? onError(e?.message || 'Google sign-in failed') : alert('Google sign-in failed');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup',
      });
      window.google!.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 320,
      });
      setRendered(true);
    } catch (e) {
      console.error(e);
    }
  }, [ready, rendered, clientId, onSuccess, onError]);

  if (!clientId) {
    return (
      <Button type="button" className="w-full" disabled>
        Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in
      </Button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      {/* Google renders its official button inside this container */}
      <div ref={containerRef} />
    </div>
  );
}
