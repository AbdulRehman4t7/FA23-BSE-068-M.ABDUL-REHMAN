import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, Clock, BarChart3, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/movies', label: 'Movies', icon: Film },
  { to: '/admin/showtimes', label: 'Showtimes', icon: Clock },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 hidden lg:block bg-card border-r border-border min-h-screen pt-20 px-4">
      <div className="mb-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
      </div>
      <p className="font-heading text-2xl text-primary mb-6">Admin Panel</p>
      <nav className="space-y-1">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
              location.pathname === link.to
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
