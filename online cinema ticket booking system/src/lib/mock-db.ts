// Mock database using localStorage for persistence
// Replaces Supabase backend for offline/demo usage

const DB_KEY = 'cinegold_db';

function generateId(): string {
  return crypto.randomUUID();
}

export interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: string;
  description: string | null;
  poster_url: string | null;
  created_at: string;
}

export interface Showtime {
  id: string;
  movie_id: string;
  date: string;
  time: string;
  hall_number: number;
  price_per_seat: number;
  created_at: string;
}

export interface Seat {
  id: string;
  showtime_id: string;
  seat_number: string;
  status: string; // 'available' | 'booked'
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
}

export interface Booking {
  id: string;
  user_id: string;
  showtime_id: string;
  seat_ids: string[];
  seat_numbers: string[];
  total_amount: number;
  status: string; // 'confirmed' | 'cancelled' | 'pending'
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_status: string; // 'success' | 'failed' | 'pending'
  stripe_session_id: string | null;
  payment_date: string;
}

export interface AuthUser {
  id: string;
  email: string;
  password: string; // stored in plain text for mock only
  user_metadata: { name: string; phone: string };
}

export interface Database {
  movies: Movie[];
  showtimes: Showtime[];
  seats: Seat[];
  profiles: Profile[];
  user_roles: UserRole[];
  bookings: Booking[];
  payments: Payment[];
  auth_users: AuthUser[];
}

function generateSeats(showtimeId: string): Seat[] {
  const rows = 'ABCDEFGHIJ'.split('');
  const seats: Seat[] = [];
  for (const row of rows) {
    for (let col = 1; col <= 10; col++) {
      seats.push({
        id: generateId(),
        showtime_id: showtimeId,
        seat_number: `${row}${col}`,
        status: 'available',
      });
    }
  }
  return seats;
}

function createSeedData(): Database {
  const now = new Date().toISOString();

  // Seed movies
  const movies: Movie[] = [
    {
      id: generateId(),
      title: 'Oppenheimer',
      genre: 'Drama',
      duration: 180,
      rating: '8.9/10',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
      poster_url: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      created_at: now,
    },
    {
      id: generateId(),
      title: 'Dune: Part Two',
      genre: 'Sci-Fi',
      duration: 166,
      rating: '8.8/10',
      description: 'Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family, facing a choice between the love of his life and the fate of the universe.',
      poster_url: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: generateId(),
      title: 'The Batman',
      genre: 'Action',
      duration: 176,
      rating: '7.8/10',
      description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
      poster_url: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: generateId(),
      title: 'Spider-Man: Across the Spider-Verse',
      genre: 'Animation',
      duration: 140,
      rating: '8.7/10',
      description: 'Miles Morales catapults across the multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
      poster_url: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: generateId(),
      title: 'Interstellar',
      genre: 'Sci-Fi',
      duration: 169,
      rating: '8.7/10',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: generateId(),
      title: 'Inception',
      genre: 'Thriller',
      duration: 148,
      rating: '8.8/10',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      poster_url: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: generateId(),
      title: 'The Dark Knight',
      genre: 'Action',
      duration: 152,
      rating: '9.0/10',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nFFGT.jpg',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: generateId(),
      title: 'Parasite',
      genre: 'Thriller',
      duration: 132,
      rating: '8.5/10',
      description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    },
  ];

  // Seed showtimes (2-3 per movie for first 4 movies)
  const showtimes: Showtime[] = [];
  const allSeats: Seat[] = [];

  const today = new Date();
  const dates = [
    today.toISOString().split('T')[0],
    new Date(today.getTime() + 86400000).toISOString().split('T')[0],
    new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0],
  ];

  const times = ['10:00', '14:00', '18:00', '21:00'];

  for (let mi = 0; mi < 4; mi++) {
    const movie = movies[mi];
    for (let di = 0; di < 2; di++) {
      for (let ti = 0; ti < 2; ti++) {
        const st: Showtime = {
          id: generateId(),
          movie_id: movie.id,
          date: dates[di],
          time: times[mi % 2 === 0 ? ti : ti + 2],
          hall_number: (mi % 3) + 1,
          price_per_seat: 500,
          created_at: now,
        };
        showtimes.push(st);
        allSeats.push(...generateSeats(st.id));
      }
    }
  }

  // Randomly book some seats (for realism)
  const bookedCount = 15;
  const randomSeats = allSeats.filter(s => s.showtime_id === showtimes[0].id);
  for (let i = 0; i < bookedCount && i < randomSeats.length; i++) {
    randomSeats[i].status = 'booked';
  }

  // Seed admin user
  const adminId = generateId();
  const adminUser: AuthUser = {
    id: adminId,
    email: 'admin@cinegold.com',
    password: 'admin123',
    user_metadata: { name: 'Admin User', phone: '1234567890' },
  };

  const adminProfile: Profile = {
    id: adminId,
    name: 'Admin User',
    email: 'admin@cinegold.com',
    phone: '1234567890',
    created_at: now,
  };

  const adminRole: UserRole = {
    id: generateId(),
    user_id: adminId,
    role: 'admin',
  };

  // Seed a demo user
  const demoUserId = generateId();
  const demoUser: AuthUser = {
    id: demoUserId,
    email: 'user@cinegold.com',
    password: 'user123',
    user_metadata: { name: 'John Doe', phone: '9876543210' },
  };

  const demoProfile: Profile = {
    id: demoUserId,
    name: 'John Doe',
    email: 'user@cinegold.com',
    phone: '9876543210',
    created_at: now,
  };

  const demoRole: UserRole = {
    id: generateId(),
    user_id: demoUserId,
    role: 'user',
  };

  // Create a sample booking for demo user
  const sampleBookingSeatIds = randomSeats.slice(0, 3).map(s => s.id);
  const sampleBookingSeatNumbers = randomSeats.slice(0, 3).map(s => s.seat_number);
  const sampleBooking: Booking = {
    id: generateId(),
    user_id: demoUserId,
    showtime_id: showtimes[0].id,
    seat_ids: sampleBookingSeatIds,
    seat_numbers: sampleBookingSeatNumbers,
    total_amount: 1500,
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  };

  const samplePayment: Payment = {
    id: generateId(),
    booking_id: sampleBooking.id,
    amount: 1500,
    payment_status: 'success',
    stripe_session_id: `sim_${Date.now()}`,
    payment_date: sampleBooking.created_at,
  };

  return {
    movies,
    showtimes,
    seats: allSeats,
    profiles: [adminProfile, demoProfile],
    user_roles: [adminRole, demoRole],
    bookings: [sampleBooking],
    payments: [samplePayment],
    auth_users: [adminUser, demoUser],
  };
}

export function getDb(): Database {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      return JSON.parse(raw) as Database;
    }
  } catch {
    // Corrupt data, re-seed
  }
  const seed = createSeedData();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

export function saveDb(db: Database): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDb(): Database {
  localStorage.removeItem(DB_KEY);
  return getDb();
}
