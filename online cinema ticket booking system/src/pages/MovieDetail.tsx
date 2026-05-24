import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Star, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: string;
  description: string;
  poster_url: string;
}

interface Showtime {
  id: string;
  date: string;
  time: string;
  hall_number: number;
  price_per_seat: number;
  available_seats?: number;
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const [movieRes, showtimeRes] = await Promise.all([
        supabase.from('movies').select('*').eq('id', id).single(),
        supabase.from('showtimes').select('*').eq('movie_id', id).order('date').order('time'),
      ]);

      setMovie(movieRes.data as Movie | null);

      const sts = (showtimeRes.data ?? []) as Showtime[];

      // Fetch available seat counts
      const enriched = await Promise.all(
        sts.map(async (st) => {
          const { count } = await supabase
            .from('seats')
            .select('*', { count: 'exact', head: true })
            .eq('showtime_id', st.id)
            .eq('status', 'available');
          return { ...st, available_seats: count ?? 0 };
        })
      );

      setShowtimes(enriched);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-80 aspect-[2/3] rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">
          <p className="font-heading text-3xl">Movie not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 flex-1">
        <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
          {/* Poster */}
          <div className="w-full md:w-80 shrink-0">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full rounded-lg border border-border"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-[2/3] rounded-lg bg-secondary flex items-center justify-center text-6xl">
                🎬
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="font-heading text-5xl sm:text-6xl text-foreground">{movie.title}</h1>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="text-primary border-primary/30">{movie.genre}</Badge>
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" /> {movie.duration} min
              </span>
              {movie.rating && (
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 text-primary fill-primary" /> {movie.rating}
                </span>
              )}
            </div>
            {movie.description && (
              <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
            )}
          </div>
        </div>

        {/* Showtimes */}
        <div className="mt-12">
          <h2 className="font-heading text-3xl text-foreground mb-6">
            Available <span className="text-primary">Showtimes</span>
          </h2>

          {showtimes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
              <p className="font-heading text-2xl mb-1">No showtimes available</p>
              <p className="text-sm">Check back later for new screenings</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showtimes.map(st => (
                <div key={st.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">
                      {format(new Date(st.date), 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-heading text-foreground">{st.time.slice(0, 5)}</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Hall {st.hall_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-primary font-bold text-lg">PKR {st.price_per_seat}</span>
                      <span className="text-muted-foreground text-xs ml-1">/seat</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{st.available_seats} seats left</span>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => navigate(`/booking/${st.id}/seats`)}
                  >
                    Select Seats
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
