import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-heading text-3xl tracking-wider text-primary">
          CINEGOLD
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/movies" className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm">
            Movies
          </Link>
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full border border-primary/30">
                      <User className="h-4 w-4 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="hero" size="sm" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-dark border-b border-border/50 p-4 flex flex-col gap-3 animate-fade-in">
          <Link to="/movies" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
            Movies
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              {role === 'admin' && (
                <Link to="/admin" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-destructive text-left py-2">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Login</Button>
              <Button variant="hero" size="sm" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Register</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
