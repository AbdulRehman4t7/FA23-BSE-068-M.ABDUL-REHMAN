"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function isModeratorRole(role: unknown) {
  const normalized = String(role || '').toUpperCase();
  return ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(normalized);
}

export default function ModeratorClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await res.json();
        const role = data?.user?.role;

        if (!res.ok || !isModeratorRole(role)) {
          router.replace('/unauthorized');
          return;
        }
      } catch (_error) {
        router.replace('/moderator-login');
        return;
      }

      if (mounted) setChecking(false);
    }

    verify();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return <div className="p-8 text-sm text-muted-foreground">Validating moderator session...</div>;
  }

  return <>{children}</>;
}
