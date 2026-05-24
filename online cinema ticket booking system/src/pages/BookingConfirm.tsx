import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookingStore } from '@/store/booking-store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  paymentSchema,
  jazzcashPaymentSchema,
  type PaymentFormData,
  type JazzCashPaymentFormData,
} from '@/lib/validations';
import { sendBookingNotifications } from '@/lib/notifications';
import {
  generateJazzCashTxnRef,
  initiateJazzCashMwalletPayment,
  normalizePkMobile,
} from '@/lib/jazzcash-client';
import { Calendar, Clock, MapPin, Armchair, CreditCard, Lock, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Formats a raw numeric string into "XXXX XXXX XXXX XXXX" card format */
const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const chunks = digits.match(/.{1,4}/g) ?? [];
  return chunks.join(' ');
};

/** Formats a raw numeric string into "MM/YY" expiry format */
const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 2
    ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    : digits;
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function BookingConfirm() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const {
    movieTitle,
    date,
    time,
    hallNumber,
    pricePerSeat,
    selectedSeatIds,
    selectedSeatNumbers,
    totalAmount,
    clearBooking,
  } = useBookingStore();

  const cardForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const jazzForm = useForm<JazzCashPaymentFormData>({
    resolver: zodResolver(jazzcashPaymentSchema),
    defaultValues: { mobileNumber: '', cnicLast6: '' },
  });

  // Guard: redirect if no showtime or seats selected
  if (!showtimeId || selectedSeatIds.length === 0) {
    navigate(`/booking/${showtimeId}/seats`);
    return null;
  }

  /** Shared persistence after any successful payment instrument */
  const finalizeBooking = async (gatewayRef: string) => {
    if (!user || !profile) {
      toast.error('Please login first');
      return;
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        showtime_id: showtimeId,
        seat_ids: selectedSeatIds,
        seat_numbers: selectedSeatNumbers,
        total_amount: totalAmount,
        status: 'confirmed',
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    for (const seatId of selectedSeatIds) {
      await supabase.from('seats').update({ status: 'booked' }).eq('id', seatId);
    }

    await supabase.from('payments').insert({
      booking_id: booking.id,
      amount: totalAmount,
      payment_status: 'success',
      stripe_session_id: gatewayRef,
    });

    await sendBookingNotifications(user.email, profile.name, profile.phone, {
      movieTitle,
      date,
      time,
      hallNumber,
      seats: selectedSeatNumbers,
      totalAmount,
      bookingId: booking.id,
    });

    toast.success('Booking confirmed! Check your email for confirmation.');
    clearBooking();

    navigate('/booking/success', {
      state: {
        bookingId: booking.id,
        movieTitle,
        date,
        time,
        hallNumber,
        seatNumbers: selectedSeatNumbers,
        totalAmount,
      },
    });
  };

  const onCardSubmit = cardForm.handleSubmit(async (_data: PaymentFormData) => {
    if (!user || !profile) {
      toast.error('Please login first');
      return;
    }

    setProcessing(true);
    try {
      await finalizeBooking(`card_${Date.now()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  });

  const onJazzCashSubmit = jazzForm.handleSubmit(async (data: JazzCashPaymentFormData) => {
    if (!user || !profile) {
      toast.error('Please login first');
      return;
    }

    setProcessing(true);
    try {
      const txnRefNo = generateJazzCashTxnRef();
      const mobile = normalizePkMobile(data.mobileNumber);

      const result = await initiateJazzCashMwalletPayment({
        txnRefNo,
        mobileNumber: mobile,
        cnicLast6: data.cnicLast6,
        amountPkr: totalAmount,
        billReference: txnRefNo,
        description: `Cinema tickets — ${movieTitle}`,
      });

      if (!result.ok) {
        toast.error(
          result.pp_ResponseMessage || result.detail || result.error || 'JazzCash payment failed',
        );
        return;
      }

      if (result.demo) {
        toast.message(
          'Demo JazzCash: add JAZZCASH_MERCHANT_ID, JAZZCASH_MERCHANT_PASSWORD, JAZZCASH_INTEGRITY_SALT to .env for live sandbox.',
          { duration: 6000 },
        );
      }

      await finalizeBooking(`jazzcash_${txnRefNo}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 container mx-auto px-4 max-w-lg">
        <div className="animate-fade-in">
          <h1 className="font-heading text-4xl sm:text-5xl text-foreground mb-8">
            Confirm <span className="text-primary">Booking</span>
          </h1>

          <BookingSummary
            movieTitle={movieTitle}
            date={date}
            time={time}
            hallNumber={hallNumber}
            pricePerSeat={pricePerSeat}
            selectedSeatIds={selectedSeatIds}
            selectedSeatNumbers={selectedSeatNumbers}
            totalAmount={totalAmount}
            processing={processing}
            onPayClick={() => setShowPaymentForm(true)}
          />

          {showPaymentForm && (
            <PaymentModal
              totalAmount={totalAmount}
              processing={processing}
              registerCard={cardForm.register}
              errorsCard={cardForm.formState.errors}
              registerJazz={jazzForm.register}
              errorsJazz={jazzForm.formState.errors}
              onSubmitCard={onCardSubmit}
              onSubmitJazzCash={onJazzCashSubmit}
              onCancel={() => setShowPaymentForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BookingSummary({
  movieTitle,
  date,
  time,
  hallNumber,
  pricePerSeat,
  selectedSeatIds,
  selectedSeatNumbers,
  totalAmount,
  processing,
  onPayClick,
}: {
  movieTitle: string;
  date: string;
  time: string;
  hallNumber: number;
  pricePerSeat: number;
  selectedSeatIds: string[];
  selectedSeatNumbers: string[];
  totalAmount: number;
  processing: boolean;
  onPayClick: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-5">
      <h2 className="font-heading text-2xl text-primary">{movieTitle}</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          {date && format(new Date(date), 'EEE, MMM d, yyyy')}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          {time?.slice(0, 5)}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Hall {hallNumber}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Armchair className="h-4 w-4 text-primary" />
          {selectedSeatIds.length} seats
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground mb-1">Selected Seats</p>
        <div className="flex flex-wrap gap-2">
          {selectedSeatNumbers.map((s) => (
            <span
              key={s}
              className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-mono font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Price per seat</span>
          <span>PKR {pricePerSeat}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Seats</span>
          <span>× {selectedSeatIds.length}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2">
          <span>Total</span>
          <span className="text-primary">PKR {totalAmount}</span>
        </div>
      </div>

      <Button variant="hero" size="lg" className="w-full" onClick={onPayClick} disabled={processing}>
        <CreditCard className="h-4 w-4 mr-2" />
        Pay PKR {totalAmount}
      </Button>
    </div>
  );
}

function PaymentModal({
  totalAmount,
  processing,
  registerCard,
  errorsCard,
  registerJazz,
  errorsJazz,
  onSubmitCard,
  onSubmitJazzCash,
  onCancel,
}: {
  totalAmount: number;
  processing: boolean;
  registerCard: UseFormRegister<PaymentFormData>;
  errorsCard: FieldErrors<PaymentFormData>;
  registerJazz: UseFormRegister<JazzCashPaymentFormData>;
  errorsJazz: FieldErrors<JazzCashPaymentFormData>;
  onSubmitCard: (e: React.FormEvent) => void;
  onSubmitJazzCash: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-xl text-foreground">Payment</h3>
        </div>

        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Card (demo)
            </TabsTrigger>
            <TabsTrigger value="jazzcash" className="gap-2">
              <Smartphone className="h-4 w-4" />
              JazzCash
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <form onSubmit={onSubmitCard} className="space-y-4">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  {...registerCard('cardNumber')}
                  onChange={(e) => {
                    e.target.value = formatCardNumber(e.target.value);
                  }}
                />
                {errorsCard.cardNumber && (
                  <p className="text-destructive text-xs">{errorsCard.cardNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Name on Card</Label>
                <Input placeholder="John Doe" {...registerCard('cardName')} />
                {errorsCard.cardName && (
                  <p className="text-destructive text-xs">{errorsCard.cardName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    placeholder="MM/YY"
                    maxLength={5}
                    {...registerCard('expiryDate')}
                    onChange={(e) => {
                      e.target.value = formatExpiry(e.target.value);
                    }}
                  />
                  {errorsCard.expiryDate && (
                    <p className="text-destructive text-xs">{errorsCard.expiryDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input placeholder="123" type="password" maxLength={4} {...registerCard('cvv')} />
                  {errorsCard.cvv && (
                    <p className="text-destructive text-xs">{errorsCard.cvv.message}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold text-foreground mb-4">
                  <span>Total Amount</span>
                  <span className="text-primary">PKR {totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={processing}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={processing}>
                  {processing ? 'Processing...' : `Pay PKR ${totalAmount}`}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Card checkout is simulated for coursework demos.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="jazzcash">
            <form onSubmit={onSubmitJazzCash} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pay with your JazzCash mobile wallet. Charges use JazzCash Mobile Account API (MWALLET).
              </p>

              <div className="space-y-2">
                <Label>JazzCash mobile number</Label>
                <Input placeholder="03XXXXXXXXX" {...registerJazz('mobileNumber')} autoComplete="tel" />
                {errorsJazz.mobileNumber && (
                  <p className="text-destructive text-xs">{errorsJazz.mobileNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>CNIC (last 6 digits)</Label>
                <Input placeholder="123456" maxLength={6} {...registerJazz('cnicLast6')} inputMode="numeric" />
                {errorsJazz.cnicLast6 && (
                  <p className="text-destructive text-xs">{errorsJazz.cnicLast6.message}</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold text-foreground mb-4">
                  <span>Total Amount</span>
                  <span className="text-primary">PKR {totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={processing}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={processing}>
                  {processing ? 'Processing...' : `Pay with JazzCash`}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Sandbox keys go in <span className="font-mono">.env</span> (see <span className="font-mono">.env.example</span>
                ). Production builds should set <span className="font-mono">VITE_JAZZCASH_API_URL</span> to your secure backend.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
