import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SeatGrid } from '@/components/SeatGrid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useBookingStore } from '@/store/booking-store';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Seat {
  id: string;
  seat_number: string;
  status: string;
}

export default function SeatSelection() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showtimeInfo, setShowtimeInfo] = useState<any>(null);

  const { selectedSeatIds, selectedSeatNumbers, totalAmount, setShowtime, toggleSeat } = useBookingStore();

  useEffect(() => {
    if (!showtimeId) return;

    const fetchData = async () => {
      const { data: stData } = await supabase
        .from('showtimes')
        .select('*, movies(title)')
        .eq('id', showtimeId)
        .single();

      if (stData) {
        const movieTitle = (stData as any).movies?.title ?? '';
        setShowtimeInfo(stData);
        setShowtime({
          showtimeId,
          movieTitle,
          date: stData.date as string,
          time: stData.time as string,
          hallNumber: stData.hall_number as number,
          pricePerSeat: Number(stData.price_per_seat),
        });
      }

      const { data: seatData } = await supabase
        .from('seats')
        .select('*')
        .eq('showtime_id', showtimeId)
        .order('seat_number');

      setSeats((seatData ?? []) as Seat[]);
      setLoading(false);
    };

    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel(`seats-${showtimeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'seats',
        filter: `showtime_id=eq.${showtimeId}`,
      }, (payload) => {
        setSeats(prev => prev.map(s =>
          s.id === (payload.new as Seat).id ? payload.new as Seat : s
        ));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showtimeId, setShowtime]);

  const handleToggle = (seatId: string, seatNumber: string) => {
    toggleSeat(seatId, seatNumber, showtimeInfo?.price_per_seat ? Number(showtimeInfo.price_per_seat) : 0);
  };

  const handleConfirm = () => {
    if (selectedSeatIds.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    navigate(`/booking/${showtimeId}/confirm`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-32 container mx-auto px-4">
        <div className="animate-fade-in">
          <h1 className="font-heading text-4xl sm:text-5xl text-foreground mb-2">
            Select <span className="text-primary">Seats</span>
          </h1>

          {showtimeInfo && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
              <span className="text-foreground font-medium">{(showtimeInfo as any).movies?.title}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(showtimeInfo.date as string), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {(showtimeInfo.time as string).slice(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Hall {showtimeInfo.hall_number}
              </span>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-4 sm:p-8 overflow-x-auto">
            <SeatGrid seats={seats} selectedIds={selectedSeatIds} onToggle={handleToggle} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-dark border-t border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">
              Selected: <span className="text-foreground font-medium">{selectedSeatIds.length} seats</span>
            </span>
            <span className="ml-4 text-sm text-muted-foreground">
              Total: <span className="text-primary font-bold text-lg">PKR {totalAmount}</span>
            </span>
          </div>
          <Button variant="hero" onClick={handleConfirm} disabled={selectedSeatIds.length === 0}>
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
