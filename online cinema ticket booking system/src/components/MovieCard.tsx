import { useNavigate } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MovieCardProps {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: string;
  poster_url: string;
}

export function MovieCard({ id, title, genre, duration, rating, poster_url }: MovieCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:glow-gold">
      <div className="aspect-[2/3] overflow-hidden bg-secondary">
        {poster_url ? (
          <img
            src={poster_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-2xl">
            🎬
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-heading text-xl text-foreground truncate">{title}</h3>
        <p className="text-sm text-primary font-medium">{genre}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {duration} min
          </span>
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-primary fill-primary" /> {rating}
            </span>
          )}
        </div>
        <Button
          variant="hero"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate(`/movies/${id}`)}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}
