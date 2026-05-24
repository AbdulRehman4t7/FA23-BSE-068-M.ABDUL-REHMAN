import { cn } from '@/lib/utils';

interface Seat {
  id: string;
  seat_number: string;
  status: string;
}

interface SeatGridProps {
  seats: Seat[];
  selectedIds: string[];
  onToggle: (seatId: string, seatNumber: string) => void;
}

export function SeatGrid({ seats, selectedIds, onToggle }: SeatGridProps) {
  const rows = 'ABCDEFGHIJ'.split('');

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="text-center mb-8">
        <div className="w-3/4 mx-auto h-2 bg-primary/60 rounded-full mb-2 glow-gold" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Screen</p>
      </div>

      {/* Seats */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        {rows.map(row => (
          <div key={row} className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-6 text-xs text-muted-foreground text-right font-mono">{row}</span>
            {Array.from({ length: 10 }, (_, i) => {
              const seatNumber = `${row}${i + 1}`;
              const seat = seats.find(s => s.seat_number === seatNumber);
              if (!seat) return <div key={seatNumber} className="w-6 h-6 sm:w-8 sm:h-8" />;

              const isBooked = seat.status === 'booked';
              const isSelected = selectedIds.includes(seat.id);

              return (
                <button
                  key={seat.id}
                  disabled={isBooked}
                  onClick={() => onToggle(seat.id, seat.seat_number)}
                  className={cn(
                    'w-6 h-6 sm:w-8 sm:h-8 rounded-t-lg text-[10px] sm:text-xs font-mono transition-all duration-200 border',
                    isBooked && 'bg-destructive/20 border-destructive/40 text-destructive/40 cursor-not-allowed',
                    isSelected && 'bg-primary border-primary text-primary-foreground scale-110',
                    !isBooked && !isSelected && 'bg-transparent border-success/50 text-success/70 hover:border-primary hover:bg-primary/10 cursor-pointer'
                  )}
                  title={seatNumber}
                >
                  {i + 1}
                </button>
              );
            })}
            <span className="w-6 text-xs text-muted-foreground font-mono">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-5 h-5 rounded-t-lg border border-success/50" />
          Available
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-5 h-5 rounded-t-lg bg-primary border border-primary" />
          Selected
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-5 h-5 rounded-t-lg bg-destructive/20 border border-destructive/40" />
          Booked
        </div>
      </div>
    </div>
  );
}
