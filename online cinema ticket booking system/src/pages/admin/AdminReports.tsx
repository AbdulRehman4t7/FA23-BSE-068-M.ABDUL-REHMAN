import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Download, FileText, Calendar, TrendingUp, Building2, Film, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';

interface Booking {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  seat_numbers?: string[];
  showtimes: {
    date: string;
    time: string;
    hall_number: number;
    price_per_seat: number;
    movies: { title: string };
  };
}

interface MovieRevenue {
  title: string;
  bookings: number;
  revenue: number;
  avgTicketPrice: number;
}

interface HallPerformance {
  hall: number;
  bookings: number;
  revenue: number;
  occupancy: number;
}

interface DayData {
  date: string;
  revenue: number;
  bookings: number;
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Filters
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Report Data
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [movieRevenues, setMovieRevenues] = useState<MovieRevenue[]>([]);
  const [hallPerformances, setHallPerformances] = useState<HallPerformance[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<DayData[]>([]);
  const [bookingsByDay, setBookingsByDay] = useState<DayData[]>([]);
  
  // Comparison Data
  const [comparisonData, setComparisonData] = useState<{
    currentPeriod: { revenue: number; bookings: number };
    previousPeriod: { revenue: number; bookings: number };
    revenueChange: number;
    bookingsChange: number;
  } | null>(null);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, showtimes(date, time, hall_number, price_per_seat, movies(title))')
      .eq('status', 'confirmed');

    setAllBookings((bookings ?? []) as Booking[]);
    setLoading(false);
  };

  useEffect(() => {
    if (allBookings.length === 0) return;
    
    const fromDate = parseISO(dateFrom);
    const toDate = parseISO(dateTo);
    
    const filtered = allBookings.filter(b => {
      const bookingDate = parseISO(b.created_at);
      return isWithinInterval(bookingDate, { start: fromDate, end: toDate });
    });

    setFilteredBookings(filtered);
    calculateReports(filtered);
    calculateComparison(filtered);
  }, [allBookings, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateReports = (bookings: Booking[]) => {
    // Total revenue and bookings
    const revenue = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
    setTotalRevenue(revenue);
    setTotalBookings(bookings.length);

    // Movie-wise revenue
    const movieMap: Record<string, { bookings: number; revenue: number }> = {};
    bookings.forEach(b => {
      const title = b.showtimes?.movies?.title ?? 'Unknown';
      if (!movieMap[title]) movieMap[title] = { bookings: 0, revenue: 0 };
      movieMap[title].bookings++;
      movieMap[title].revenue += Number(b.total_amount);
    });
    
    const movieData: MovieRevenue[] = Object.entries(movieMap).map(([title, data]) => ({
      title,
      bookings: data.bookings,
      revenue: data.revenue,
      avgTicketPrice: Math.round(data.revenue / data.bookings),
    })).sort((a, b) => b.revenue - a.revenue);
    
    setMovieRevenues(movieData);

    // Hall-wise performance
    const hallMap: Record<number, { bookings: number; revenue: number; seats: number }> = {};
    bookings.forEach(b => {
      const hall = b.showtimes?.hall_number ?? 1;
      if (!hallMap[hall]) hallMap[hall] = { bookings: 0, revenue: 0, seats: 0 };
      hallMap[hall].bookings++;
      hallMap[hall].revenue += Number(b.total_amount);
      hallMap[hall].seats += Math.round(Number(b.total_amount) / Number(b.showtimes?.price_per_seat || 500));
    });

    const hallData: HallPerformance[] = Object.entries(hallMap).map(([hall, data]) => ({
      hall: Number(hall),
      bookings: data.bookings,
      revenue: data.revenue,
      occupancy: Math.min(100, Math.round((data.seats / 100) * 100)), // Assuming 100 seats per hall
    })).sort((a, b) => b.revenue - a.revenue);

    setHallPerformances(hallData);

    // Revenue by day
    const dayMap: Record<string, { revenue: number; bookings: number }> = {};
    const fromDate = parseISO(dateFrom);
    const toDate = parseISO(dateTo);
    
    // Initialize all days in range
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      const key = format(d, 'MMM d');
      dayMap[key] = { revenue: 0, bookings: 0 };
    }

    bookings.forEach(b => {
      const key = format(parseISO(b.created_at), 'MMM d');
      if (dayMap[key]) {
        dayMap[key].revenue += Number(b.total_amount);
        dayMap[key].bookings++;
      }
    });

    const dayData = Object.entries(dayMap).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      bookings: data.bookings,
    }));

    setRevenueByDay(dayData);
    setBookingsByDay(dayData);
  };

  const calculateComparison = (currentBookings: Booking[]) => {
    const fromDate = parseISO(dateFrom);
    const toDate = parseISO(dateTo);
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const previousFrom = subDays(fromDate, daysDiff);
    const previousTo = subDays(fromDate, 1);

    const previousBookings = allBookings.filter(b => {
      const bookingDate = parseISO(b.created_at);
      return isWithinInterval(bookingDate, { start: previousFrom, end: previousTo });
    });

    const currentRevenue = currentBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
    const previousRevenue = previousBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);

    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const bookingsChange = previousBookings.length > 0 ? ((currentBookings.length - previousBookings.length) / previousBookings.length) * 100 : 0;

    setComparisonData({
      currentPeriod: { revenue: currentRevenue, bookings: currentBookings.length },
      previousPeriod: { revenue: previousRevenue, bookings: previousBookings.length },
      revenueChange,
      bookingsChange,
    });
  };

  const exportToCSV = () => {
    const headers = ['Movie', 'Hall', 'Date', 'Time', 'Seats', 'Amount (PKR)', 'Booked On'];
    const rows = filteredBookings.map(b => [
      b.showtimes?.movies?.title ?? 'Unknown',
      b.showtimes?.hall_number ?? 1,
      b.showtimes?.date ?? '',
      b.showtimes?.time?.slice(0, 5) ?? '',
      b.seat_numbers?.join('-') ?? '',
      b.total_amount,
      format(parseISO(b.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cinema-report-${dateFrom}-to-${dateTo}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    // Create a printable HTML report
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cinema Report - ${dateFrom} to ${dateTo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #D97706; border-bottom: 2px solid #D97706; padding-bottom: 10px; }
          h2 { color: #1f2937; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; }
          .summary { display: flex; gap: 20px; margin: 20px 0; }
          .summary-card { background: #f9fafb; padding: 15px 25px; border-radius: 8px; }
          .summary-card h3 { margin: 0; color: #6b7280; font-size: 14px; }
          .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #D97706; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>🎬 CineGold Cinema Report</h1>
        <p>Period: ${dateFrom} to ${dateTo}</p>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Revenue</h3>
            <p>PKR ${totalRevenue.toLocaleString()}</p>
          </div>
          <div class="summary-card">
            <h3>Total Bookings</h3>
            <p>${totalBookings}</p>
          </div>
          <div class="summary-card">
            <h3>Avg. Ticket Price</h3>
            <p>PKR ${totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0}</p>
          </div>
        </div>

        <h2>Movie-wise Revenue</h2>
        <table>
          <thead>
            <tr><th>Movie</th><th>Bookings</th><th>Revenue (PKR)</th></tr>
          </thead>
          <tbody>
            ${movieRevenues.map(m => `<tr><td>${m.title}</td><td>${m.bookings}</td><td>${m.revenue.toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>Hall Performance</h2>
        <table>
          <thead>
            <tr><th>Hall</th><th>Bookings</th><th>Revenue (PKR)</th></tr>
          </thead>
          <tbody>
            ${hallPerformances.map(h => `<tr><td>Hall ${h.hall}</td><td>${h.bookings}</td><td>${h.revenue.toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>

        <p style="margin-top: 40px; color: #9ca3af; font-size: 12px;">Generated on ${format(new Date(), 'PPP')}</p>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-4xl text-foreground">
          Reports & <span className="text-primary">Analytics</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border mb-8">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <Select value={reportType} onValueChange={(v) => {
                setReportType(v as 'daily' | 'weekly' | 'monthly');
                const today = new Date();
                if (v === 'daily') {
                  setDateFrom(format(subDays(today, 7), 'yyyy-MM-dd'));
                  setDateTo(format(today, 'yyyy-MM-dd'));
                } else if (v === 'weekly') {
                  setDateFrom(format(subDays(today, 30), 'yyyy-MM-dd'));
                  setDateTo(format(today, 'yyyy-MM-dd'));
                } else if (v === 'monthly') {
                  setDateFrom(format(subDays(today, 90), 'yyyy-MM-dd'));
                  setDateTo(format(today, 'yyyy-MM-dd'));
                }
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Last 7 Days</SelectItem>
                  <SelectItem value="weekly">Last 30 Days</SelectItem>
                  <SelectItem value="monthly">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading text-primary">PKR {totalRevenue.toLocaleString()}</p>
            {comparisonData && (
              <p className={`text-xs mt-1 flex items-center ${comparisonData.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {comparisonData.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(comparisonData.revenueChange).toFixed(1)}% vs previous period
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Bookings</CardTitle>
            <Calendar className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading text-foreground">{totalBookings}</p>
            {comparisonData && (
              <p className={`text-xs mt-1 flex items-center ${comparisonData.bookingsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {comparisonData.bookingsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(comparisonData.bookingsChange).toFixed(1)}% vs previous period
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg. Ticket Price</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading text-foreground">
              PKR {totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString() : 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Halls</CardTitle>
            <Building2 className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading text-foreground">{hallPerformances.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="halls">Halls</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByDay.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data for selected period</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 18%)" />
                      <XAxis dataKey="date" tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(240, 15%, 8%)', border: '1px solid hsl(240, 10%, 18%)' }}
                        labelStyle={{ color: 'hsl(0, 0%, 100%)' }}
                        formatter={(value) => [`PKR ${value}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(38, 92%, 50%)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Bookings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsByDay.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data for selected period</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 18%)" />
                      <XAxis dataKey="date" tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(240, 15%, 8%)', border: '1px solid hsl(240, 10%, 18%)' }}
                        labelStyle={{ color: 'hsl(0, 0%, 100%)' }}
                        formatter={(value) => [value, 'Bookings']}
                      />
                      <Bar dataKey="bookings" fill="hsl(219, 79%, 52%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Movies Tab */}
        <TabsContent value="movies" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Film className="h-5 w-5 text-primary" /> Movie-wise Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movieRevenues.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data for selected period</p>
              ) : (
                <>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={movieRevenues.slice(0, 6)}
                          dataKey="revenue"
                          nameKey="title"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                        >
                          {movieRevenues.slice(0, 6).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`PKR ${value}`, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      {movieRevenues.map((movie, index) => (
                        <div key={movie.title} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <div>
                              <p className="font-medium text-foreground">{movie.title}</p>
                              <p className="text-xs text-muted-foreground">{movie.bookings} bookings</p>
                            </div>
                          </div>
                          <p className="font-bold text-primary">PKR {movie.revenue.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-muted-foreground">Movie</th>
                          <th className="text-right p-3 text-muted-foreground">Bookings</th>
                          <th className="text-right p-3 text-muted-foreground">Revenue</th>
                          <th className="text-right p-3 text-muted-foreground">Avg. Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movieRevenues.map(m => (
                          <tr key={m.title} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-3 text-foreground">{m.title}</td>
                            <td className="p-3 text-right text-muted-foreground">{m.bookings}</td>
                            <td className="p-3 text-right text-primary font-medium">PKR {m.revenue.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">PKR {m.avgTicketPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Halls Tab */}
        <TabsContent value="halls" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Hall Performance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hallPerformances.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data for selected period</p>
              ) : (
                <>
                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hallPerformances} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 18%)" />
                        <XAxis type="number" tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} />
                        <YAxis dataKey="hall" type="category" tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} tickFormatter={(v) => `Hall ${v}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(240, 15%, 8%)', border: '1px solid hsl(240, 10%, 18%)' }}
                          labelStyle={{ color: 'hsl(0, 0%, 100%)' }}
                          formatter={(value, name) => [name === 'revenue' ? `PKR ${value}` : value, name === 'revenue' ? 'Revenue' : 'Bookings']}
                        />
                        <Bar dataKey="revenue" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hallPerformances}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 18%)" />
                        <XAxis dataKey="hall" tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} tickFormatter={(v) => `H${v}`} />
                        <YAxis tick={{ fill: 'hsl(215, 16%, 62%)', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(240, 15%, 8%)', border: '1px solid hsl(240, 10%, 18%)' }}
                          labelStyle={{ color: 'hsl(0, 0%, 100%)' }}
                          formatter={(value) => [`${value}%`, 'Occupancy']}
                        />
                        <Bar dataKey="occupancy" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-muted-foreground">Hall</th>
                          <th className="text-right p-3 text-muted-foreground">Bookings</th>
                          <th className="text-right p-3 text-muted-foreground">Revenue</th>
                          <th className="text-right p-3 text-muted-foreground">Occupancy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hallPerformances.map(h => (
                          <tr key={h.hall} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-3 text-foreground font-medium">Hall {h.hall}</td>
                            <td className="p-3 text-right text-muted-foreground">{h.bookings}</td>
                            <td className="p-3 text-right text-primary font-medium">PKR {h.revenue.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-1 rounded text-xs ${h.occupancy >= 70 ? 'bg-green-500/20 text-green-500' : h.occupancy >= 40 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                                {h.occupancy}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {comparisonData && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Revenue Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Previous Period</p>
                      <p className="text-2xl font-bold text-muted-foreground">PKR {comparisonData.previousPeriod.revenue.toLocaleString()}</p>
                    </div>
                    <div className={`text-4xl ${comparisonData.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {comparisonData.revenueChange >= 0 ? '→' : '←'}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Current Period</p>
                      <p className="text-2xl font-bold text-primary">PKR {comparisonData.currentPeriod.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${comparisonData.revenueChange >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {comparisonData.revenueChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(comparisonData.revenueChange).toFixed(1)}% change
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Bookings Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Previous Period</p>
                      <p className="text-2xl font-bold text-muted-foreground">{comparisonData.previousPeriod.bookings}</p>
                    </div>
                    <div className={`text-4xl ${comparisonData.bookingsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {comparisonData.bookingsChange >= 0 ? '→' : '←'}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Current Period</p>
                      <p className="text-2xl font-bold text-primary">{comparisonData.currentPeriod.bookings}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${comparisonData.bookingsChange >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {comparisonData.bookingsChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(comparisonData.bookingsChange).toFixed(1)}% change
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
