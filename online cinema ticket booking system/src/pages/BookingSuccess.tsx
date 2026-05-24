import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, MapPin, Armchair, Mail, Bell } from 'lucide-react';

export default function BookingSuccess() {
  const location = useLocation();
  const state = location.state as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 flex justify-center">
        <div className="max-w-md w-full animate-fade-in text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-success mx-auto animate-scale-in" />
          </div>
          <h1 className="font-heading text-5xl text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-4">Your tickets are ready. Enjoy the show!</p>

          {/* Notification banner */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-6 flex items-center gap-3 text-left">
            <Bell className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="text-sm">
              <p className="text-foreground font-medium">Confirmation Sent</p>
              <p className="text-muted-foreground text-xs">A booking confirmation email has been sent to your registered email address.</p>
            </div>
          </div>

          {state && (
            <div className="bg-card border border-primary/30 rounded-lg p-6 mb-8 text-left glow-gold">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Digital Ticket</p>
                <h2 className="font-heading text-3xl text-primary">{state.movieTitle}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {state.date}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  {state.time?.slice(0, 5)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Hall {state.hallNumber}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Armchair className="h-4 w-4 text-primary" />
                  {state.seatNumbers?.join(', ')}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-xs text-muted-foreground">Booking ID</span>
                <span className="text-xs font-mono text-muted-foreground">{state.bookingId?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm font-bold text-foreground">Total Paid</span>
                <span className="text-primary font-bold">PKR {state.totalAmount}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="hero" className="flex-1" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="gold_outline" className="flex-1" asChild>
              <Link to="/movies">Book Another</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
