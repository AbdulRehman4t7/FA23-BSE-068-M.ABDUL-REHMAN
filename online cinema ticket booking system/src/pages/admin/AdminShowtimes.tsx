import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Movie { id: string; title: string; }
interface Showtime {
  id: string;
  movie_id: string;
  date: string;
  time: string;
  hall_number: number;
  price_per_seat: number;
  movies: { title: string };
}

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ movie_id: '', date: '', time: '', hall_number: '1', price_per_seat: '500' });

  const fetchData = async () => {
    const [stRes, mRes] = await Promise.all([
      supabase.from('showtimes').select('*, movies(title)').order('date', { ascending: false }),
      supabase.from('movies').select('id, title'),
    ]);
    setShowtimes((stRes.data ?? []) as unknown as Showtime[]);
    setMovies((mRes.data ?? []) as Movie[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!formData.movie_id || !formData.date || !formData.time) {
      toast.error('Fill all required fields');
      return;
    }
    setSaving(true);

    const { data: st, error } = await supabase.from('showtimes').insert({
      movie_id: formData.movie_id,
      date: formData.date,
      time: formData.time,
      hall_number: Number(formData.hall_number),
      price_per_seat: Number(formData.price_per_seat),
    }).select().single();

    if (error || !st) { toast.error(error?.message || 'Failed'); setSaving(false); return; }

    // Generate 100 seats (A1-J10)
    const rows = 'ABCDEFGHIJ'.split('');
    const seatInserts = rows.flatMap(row =>
      Array.from({ length: 10 }, (_, i) => ({
        showtime_id: st.id,
        seat_number: `${row}${i + 1}`,
        status: 'available',
      }))
    );

    await supabase.from('seats').insert(seatInserts);

    toast.success('Showtime added with 100 seats');
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('showtimes').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Showtime deleted');
    setShowtimes(prev => prev.filter(s => s.id !== id));
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-4xl text-foreground">
          Manage <span className="text-primary">Showtimes</span>
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="h-4 w-4 mr-1" /> Add Showtime</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Showtime</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Movie</Label>
                <Select value={formData.movie_id} onValueChange={v => setFormData(p => ({ ...p, movie_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select movie" /></SelectTrigger>
                  <SelectContent>
                    {movies.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Time</Label>
                  <Input type="time" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Hall Number</Label>
                  <Input type="number" value={formData.hall_number} onChange={e => setFormData(p => ({ ...p, hall_number: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Price/Seat (PKR)</Label>
                  <Input type="number" value={formData.price_per_seat} onChange={e => setFormData(p => ({ ...p, price_per_seat: e.target.value }))} />
                </div>
              </div>
              <Button variant="hero" className="w-full" onClick={handleAdd} disabled={saving}>
                {saving ? 'Creating...' : 'Add Showtime'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : showtimes.length === 0 ? (
        <p className="text-muted-foreground">No showtimes yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">Movie</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Hall</th>
                <th className="p-3">Price</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map(s => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="p-3 text-foreground font-medium">{s.movies?.title}</td>
                  <td className="p-3 text-muted-foreground">{format(new Date(s.date), 'MMM d, yyyy')}</td>
                  <td className="p-3 text-muted-foreground">{s.time.slice(0, 5)}</td>
                  <td className="p-3 text-muted-foreground">Hall {s.hall_number}</td>
                  <td className="p-3 text-primary">PKR {s.price_per_seat}</td>
                  <td className="p-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete showtime?</AlertDialogTitle>
                          <AlertDialogDescription>This will also delete all seats for this showtime.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(s.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
