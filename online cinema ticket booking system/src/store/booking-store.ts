import { create } from 'zustand';

interface BookingState {
  showtimeId: string | null;
  movieTitle: string;
  date: string;
  time: string;
  hallNumber: number;
  pricePerSeat: number;
  selectedSeatIds: string[];
  selectedSeatNumbers: string[];
  totalAmount: number;
  setShowtime: (data: {
    showtimeId: string;
    movieTitle: string;
    date: string;
    time: string;
    hallNumber: number;
    pricePerSeat: number;
  }) => void;
  toggleSeat: (seatId: string, seatNumber: string, price: number) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  showtimeId: null,
  movieTitle: '',
  date: '',
  time: '',
  hallNumber: 0,
  pricePerSeat: 0,
  selectedSeatIds: [],
  selectedSeatNumbers: [],
  totalAmount: 0,
  setShowtime: (data) => set({
    showtimeId: data.showtimeId,
    movieTitle: data.movieTitle,
    date: data.date,
    time: data.time,
    hallNumber: data.hallNumber,
    pricePerSeat: data.pricePerSeat,
    selectedSeatIds: [],
    selectedSeatNumbers: [],
    totalAmount: 0,
  }),
  toggleSeat: (seatId, seatNumber, price) => set((state) => {
    const isSelected = state.selectedSeatIds.includes(seatId);
    if (isSelected) {
      return {
        selectedSeatIds: state.selectedSeatIds.filter(id => id !== seatId),
        selectedSeatNumbers: state.selectedSeatNumbers.filter(n => n !== seatNumber),
        totalAmount: state.totalAmount - price,
      };
    }
    return {
      selectedSeatIds: [...state.selectedSeatIds, seatId],
      selectedSeatNumbers: [...state.selectedSeatNumbers, seatNumber],
      totalAmount: state.totalAmount + price,
    };
  }),
  clearBooking: () => set({
    showtimeId: null,
    movieTitle: '',
    date: '',
    time: '',
    hallNumber: 0,
    pricePerSeat: 0,
    selectedSeatIds: [],
    selectedSeatNumbers: [],
    totalAmount: 0,
  }),
}));
