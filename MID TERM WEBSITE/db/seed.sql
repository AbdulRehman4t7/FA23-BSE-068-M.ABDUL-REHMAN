insert into public.categories (name, slug) values
('Real Estate', 'real-estate'),
('Electronics', 'electronics'),
('Vehicles', 'vehicles'),
('Services', 'services'),
('Fashion', 'fashion'),
('Jobs', 'jobs'),
('Collectibles', 'collectibles')
on conflict do nothing;

insert into public.cities (name, slug) values
('Karachi', 'karachi'),
('Lahore', 'lahore'),
('Islamabad', 'islamabad'),
('Rawalpindi', 'rawalpindi'),
('Faisalabad', 'faisalabad'),
('Multan', 'multan'),
('Peshawar', 'peshawar'),
('Quetta', 'quetta')
on conflict do nothing;

insert into public.packages (name, slug, price, duration_days, weight, featured_boost) values
('Basic', 'basic', 0, 7, 1, 0),
('Standard', 'standard', 500, 15, 2, 10),
('Premium', 'premium', 1500, 30, 3, 50)
on conflict do nothing;

-- Sample app data should include at least 15 ads; reuse the seeded demo catalog from lib/mock-db.ts.
-- In a live Supabase setup, pair this file with generated UUID users and insert ads/payments/status history accordingly.
