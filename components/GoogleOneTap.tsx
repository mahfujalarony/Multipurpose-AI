"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { signIn, useSession } from "next-auth/react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  const { status } = useSession();
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (status !== "unauthenticated" || !scriptReady || !window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: true,
      cancel_on_tap_outside: true,
      callback: async ({ credential }) => {
        if (!credential) return;
        await signIn("google-one-tap", {
          credential,
          redirect: false,
        });
      },
    });

    window.google.accounts.id.prompt();

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [scriptReady, status]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => setScriptReady(true)}
    />
  );
}
