import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Film, Clock, Ticket, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface BookingData {
  total_amount: number;
  status: string;
}

interface RecentBooking {
  id: string;
  total_amount: number;
  status: string;
  seat_numbers: string[];
  profiles: { name: string } | null;
  showtimes: {
    date: string;
    time: string;
    movies: { title: string } | null;
  } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ movies: 0, showtimes: 0, bookings: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [moviesRes, showtimesRes, bookingsRes] = await Promise.all([
        supabase.from('movies').select('*', { count: 'exact', head: true }),
        supabase.from('showtimes').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_amount, status'),
      ]);

      const confirmedBookings = (bookingsRes.data ?? []).filter((b: BookingData) => b.status === 'confirmed');
      const revenue = confirmedBookings.reduce((sum: number, b: BookingData) => sum + Number(b.total_amount), 0);

      setStats({
        movies: moviesRes.count ?? 0,
        showtimes: showtimesRes.count ?? 0,
        bookings: (bookingsRes.data ?? []).length,
        revenue,
      });

      const { data: recent } = await supabase
        .from('bookings')
        .select('*, profiles(name), showtimes(date, time, movies(title))')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentBookings(recent ?? []);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Movies', value: stats.movies, icon: Film, color: 'text-primary' },
    { label: 'Total Showtimes', value: stats.showtimes, icon: Clock, color: 'text-blue-400' },
    { label: 'Total Bookings', value: stats.bookings, icon: Ticket, color: 'text-green-400' },
    { label: 'Revenue', value: `PKR ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <AdminLayout>
      <h1 className="font-heading text-4xl text-foreground mb-8">
        Admin <span className="text-primary">Dashboard</span>
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <Card key={s.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-heading text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-heading text-2xl text-foreground mb-4">Recent Bookings</h2>
      {loading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : recentBookings.length === 0 ? (
        <p className="text-muted-foreground text-sm">No bookings yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">User</th>
                <th className="p-3">Movie</th>
                <th className="p-3">Date</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-border/50">
                  <td className="p-3 text-foreground">{b.profiles?.name || 'N/A'}</td>
                  <td className="p-3 text-foreground">{b.showtimes?.movies?.title || 'N/A'}</td>
                  <td className="p-3 text-muted-foreground">
                    {b.showtimes?.date && format(new Date(b.showtimes.date), 'MMM d')}
                  </td>
                  <td className="p-3 text-muted-foreground">{b.seat_numbers?.join(', ')}</td>
                  <td className="p-3 text-primary font-medium">PKR {b.total_amount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      b.status === 'confirmed' ? 'bg-success/10 text-success' :
                      b.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
