"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function isAdminRole(role: unknown) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}

export default function AdminClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await res.json();
        const role = data?.user?.role;

        if (!res.ok || !isAdminRole(role)) {
          router.replace('/unauthorized');
          return;
        }
      } catch (_error) {
        router.replace('/admin-login');
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
    return <div className="p-8 text-sm text-muted-foreground">Validating admin session...</div>;
  }

  return <>{children}</>;
}
