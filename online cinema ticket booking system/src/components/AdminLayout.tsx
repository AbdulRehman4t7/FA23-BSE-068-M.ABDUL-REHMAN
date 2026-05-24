import { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { AdminSidebar } from '@/components/AdminSidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 pt-20 pb-12 px-4 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
