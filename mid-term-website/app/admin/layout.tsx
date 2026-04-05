import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME, decodeSessionFromToken } from '@/lib/auth';
import AdminClientGuard from '@/components/auth/admin-client-guard';

function isAdminRole(role: unknown) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value || null;
  const user = decodeSessionFromToken(token);

  if (!user) {
    redirect('/admin-login');
  }

  if (!isAdminRole(user.role)) {
    redirect('/unauthorized');
  }

  return <AdminClientGuard>{children}</AdminClientGuard>;
}
