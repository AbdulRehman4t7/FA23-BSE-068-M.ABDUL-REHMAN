import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME, decodeSessionFromToken } from '@/lib/auth';
import ModeratorClientGuard from '@/components/auth/moderator-client-guard';

function isModeratorRole(role: unknown) {
  const normalized = String(role || '').toUpperCase();
  return ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(normalized);
}

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value || null;
  const user = decodeSessionFromToken(token);

  if (!user) {
    redirect('/moderator-login');
  }

  if (!isModeratorRole(user.role)) {
    redirect('/unauthorized');
  }

  return <ModeratorClientGuard>{children}</ModeratorClientGuard>;
}
