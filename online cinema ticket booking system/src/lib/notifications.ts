// Notification Service for Email/SMS notifications
// In a real application, this would integrate with services like SendGrid, Twilio, etc.

export interface BookingNotification {
  email: string;
  name: string;
  movieTitle: string;
  date: string;
  time: string;
  hallNumber: number;
  seats: string[];
  totalAmount: number;
  bookingId: string;
}

export interface CancellationNotification {
  email: string;
  name: string;
  movieTitle: string;
  date: string;
  bookingId: string;
}

// Simulate email sending (in production, use SendGrid, Mailgun, etc.)
export async function sendBookingConfirmationEmail(data: BookingNotification): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In production, this would call an API endpoint like:
  // POST /api/send-email
  // {
  //   to: data.email,
  //   subject: `Booking Confirmed - ${data.movieTitle}`,
  //   template: 'booking-confirmation',
  //   data: { ... }
  // }

  console.log('📧 Email sent successfully:');
  console.log(`  To: ${data.email}`);
  console.log(`  Subject: Booking Confirmed - ${data.movieTitle}`);
  console.log(`  Movie: ${data.movieTitle}`);
  console.log(`  Date: ${data.date}`);
  console.log(`  Time: ${data.time}`);
  console.log(`  Hall: ${data.hallNumber}`);
  console.log(`  Seats: ${data.seats.join(', ')}`);
  console.log(`  Total: PKR ${data.totalAmount}`);
  console.log(`  Booking ID: ${data.bookingId}`);

  // Store notification in localStorage for demo purposes
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifications.push({
    type: 'email',
    ...data,
    sentAt: new Date().toISOString(),
    status: 'sent',
  });
  localStorage.setItem('notifications', JSON.stringify(notifications));

  return true;
}

// Simulate SMS sending (in production, use Twilio, etc.)
export async function sendBookingConfirmationSMS(phone: string, data: Omit<BookingNotification, 'email' | 'name'>): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // In production, this would call Twilio API or similar
  // POST /api/send-sms
  // {
  //   to: phone,
  //   message: `CineGold: Your booking for ${data.movieTitle} is confirmed! Seats: ${data.seats.join(', ')}. Booking ID: ${data.bookingId}`
  // }

  console.log('📱 SMS sent successfully:');
  console.log(`  To: ${phone}`);
  console.log(`  Message: CineGold: Your booking for ${data.movieTitle} is confirmed! Seats: ${data.seats.join(', ')}. Booking ID: ${data.bookingId.slice(0, 8)}`);

  return true;
}

// Send booking cancellation notification
export async function sendCancellationNotification(data: CancellationNotification): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('📧 Cancellation email sent:');
  console.log(`  To: ${data.email}`);
  console.log(`  Subject: Booking Cancelled - ${data.movieTitle}`);

  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifications.push({
    type: 'cancellation',
    ...data,
    sentAt: new Date().toISOString(),
    status: 'sent',
  });
  localStorage.setItem('notifications', JSON.stringify(notifications));

  return true;
}

// Combined notification sender
export async function sendBookingNotifications(userEmail: string, userName: string, userPhone: string, bookingDetails: Omit<BookingNotification, 'email' | 'name'>): Promise<{ emailSent: boolean; smsSent: boolean }> {
  const emailData: BookingNotification = {
    email: userEmail,
    name: userName,
    ...bookingDetails,
  };

  const [emailSent, smsSent] = await Promise.all([
    sendBookingConfirmationEmail(emailData),
    userPhone ? sendBookingConfirmationSMS(userPhone, bookingDetails) : Promise.resolve(false),
  ]);

  return { emailSent, smsSent };
}

// Get notification history (for demo purposes)
export function getNotificationHistory(): any[] {
  return JSON.parse(localStorage.getItem('notifications') || '[]');
}
