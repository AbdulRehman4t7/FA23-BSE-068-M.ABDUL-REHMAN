import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { movieSchema, type MovieFormData } from '@/lib/validations';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: string;
  description: string;
  poster_url: string;
}

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
  });

  const fetchMovies = async () => {
    const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
    setMovies((data ?? []) as Movie[]);
    setLoading(false);
  };

  useEffect(() => { fetchMovies(); }, []);

  const openAdd = () => {
    setEditingId(null);
    reset({ title: '', genre: '', duration: 120, rating: '', description: '', poster_url: '' });
    setDialogOpen(true);
  };

  const openEdit = (movie: Movie) => {
    setEditingId(movie.id);
    reset({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      rating: movie.rating,
      description: movie.description || '',
      poster_url: movie.poster_url || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: MovieFormData) => {
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from('movies').update(data).eq('id', editingId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Movie updated');
    } else {
      const { error } = await supabase.from('movies').insert([{ title: data.title, genre: data.genre, duration: data.duration, rating: data.rating, description: data.description || '', poster_url: data.poster_url || '' }]);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Movie added');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchMovies();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('movies').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Movie deleted');
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-4xl text-foreground">
          Manage <span className="text-primary">Movies</span>
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add Movie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Movie' : 'Add Movie'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input {...register('title')} />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Genre</Label>
                  <Input {...register('genre')} />
                  {errors.genre && <p className="text-destructive text-xs">{errors.genre.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Duration (min)</Label>
                  <Input type="number" {...register('duration')} />
                  {errors.duration && <p className="text-destructive text-xs">{errors.duration.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Rating</Label>
                  <Input placeholder="8.5/10" {...register('rating')} />
                  {errors.rating && <p className="text-destructive text-xs">{errors.rating.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Poster URL</Label>
                  <Input placeholder="https://..." {...register('poster_url')} />
                  {errors.poster_url && <p className="text-destructive text-xs">{errors.poster_url.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea {...register('description')} rows={3} />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Movie' : 'Add Movie'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : movies.length === 0 ? (
        <p className="text-muted-foreground">No movies added yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">Title</th>
                <th className="p-3">Genre</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className="p-3 text-foreground font-medium">{m.title}</td>
                  <td className="p-3 text-muted-foreground">{m.genre}</td>
                  <td className="p-3 text-muted-foreground">{m.duration} min</td>
                  <td className="p-3 text-primary">{m.rating}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{m.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will also delete all associated showtimes and seats.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(m.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
