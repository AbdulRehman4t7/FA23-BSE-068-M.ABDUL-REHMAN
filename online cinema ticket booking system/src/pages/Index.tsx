import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import heroBg from '@/assets/hero-cinema.jpg';

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: string;
  poster_url: string;
}

export default function Index() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('movies').select('*').order('created_at', { ascending: false }).limit(8)
      .then(({ data }) => {
        setMovies((data ?? []) as Movie[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Cinema interior"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <h1 className="font-heading text-6xl sm:text-8xl md:text-9xl text-foreground leading-none mb-4">
            <span className="text-gradient-gold">CINE</span>GOLD
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-md mx-auto mb-8">
            Your premium cinema experience. Book tickets instantly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/movies">Browse Movies</Link>
            </Button>
            <Button variant="gold_outline" size="lg" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Now Showing */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-4xl sm:text-5xl text-foreground">
            Now <span className="text-primary">Showing</span>
          </h2>
          <Button variant="gold_outline" size="sm" asChild>
            <Link to="/movies">View All</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-heading text-3xl mb-2">No movies yet</p>
            <p className="text-sm">Check back soon for new releases!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {movies.map(movie => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
