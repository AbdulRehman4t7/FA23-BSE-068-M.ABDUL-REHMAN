import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData, changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations';
import { sendCancellationNotification } from '@/lib/notifications';
import { toast } from 'sonner';
import { User, Pencil, KeyRound } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  seat_ids: string[];
  seat_numbers: string[];
  total_amount: number;
  status: string;
  created_at: string;
  showtime_id: string;
  showtimes: {
    date: string;
    time: string;
    hall_number: number;
    movies: { title: string };
  };
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const { register: registerPwd, handleSubmit: handleSubmitPwd, formState: { errors: errorsPwd }, reset: resetPwd } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, phone: profile.phone });
    }
  }, [profile, reset]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bookings')
      .select('*, showtimes(date, time, hall_number, movies(title))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data ?? []) as unknown as Booking[]);
        setLoading(false);
      });
  }, [user]);

  const onSaveProfile = async (data: ProfileFormData) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name: data.name,
      phone: data.phone,
    }).eq('id', user.id);
    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated');
      setEditOpen(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    if (!user) return;
    setSaving(true);

    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.currentPassword,
    });

    if (signInError) {
      setSaving(false);
      toast.error('Current password is incorrect');
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    setSaving(false);

    if (updateError) {
      toast.error(updateError.message);
    } else {
      toast.success('Password changed successfully');
      setPasswordOpen(false);
      resetPwd();
    }
  };

  const handleCancel = async (bookingId: string, seatIds: string[], movieTitle: string, showDate: string) => {
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    if (error) { toast.error(error.message); return; }

    // Free up seats
    for (const seatId of seatIds) {
      await supabase.from('seats').update({ status: 'available' }).eq('id', seatId);
    }

    // Send cancellation notification
    if (profile) {
      await sendCancellationNotification({
        email: profile.email,
        name: profile.name,
        movieTitle,
        date: showDate,
        bookingId,
      });
    }

    toast.success('Booking cancelled. Confirmation email sent.');
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 flex-1">
        <h1 className="font-heading text-5xl text-foreground mb-8">
          My <span className="text-primary">Dashboard</span>
        </h1>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">{profile?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-xs text-muted-foreground">{profile?.phone}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <KeyRound className="h-3 w-3 mr-1" /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitPwd(onChangePassword)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" {...registerPwd('currentPassword')} />
                    {errorsPwd.currentPassword && <p className="text-destructive text-xs">{errorsPwd.currentPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" {...registerPwd('newPassword')} />
                    {errorsPwd.newPassword && <p className="text-destructive text-xs">{errorsPwd.newPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" {...registerPwd('confirmNewPassword')} />
                    {errorsPwd.confirmNewPassword && <p className="text-destructive text-xs">{errorsPwd.confirmNewPassword.message}</p>}
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={saving}>
                    {saving ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="gold_outline" size="sm">
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input {...register('name')} />
                    {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...register('phone')} />
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Booking History */}
        <h2 className="font-heading text-3xl text-foreground mb-4">
          Booking <span className="text-primary">History</span>
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border text-muted-foreground">
            <p className="font-heading text-2xl mb-1">No bookings yet</p>
            <p className="text-sm">Browse movies and book your first ticket!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{b.showtimes?.movies?.title ?? 'Movie'}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.showtimes?.date && format(new Date(b.showtimes.date), 'MMM d, yyyy')} · {b.showtimes?.time?.slice(0, 5)} · Hall {b.showtimes?.hall_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seats: {b.seat_numbers?.join(', ')} · PKR {b.total_amount}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'}>
                    {b.status}
                  </Badge>
                  {b.status === 'confirmed' && b.showtimes?.date && new Date(b.showtimes.date) >= new Date() && (
                    <Button variant="outline" size="sm" onClick={() => handleCancel(b.id, b.seat_ids, b.showtimes?.movies?.title ?? 'Movie', b.showtimes.date)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
