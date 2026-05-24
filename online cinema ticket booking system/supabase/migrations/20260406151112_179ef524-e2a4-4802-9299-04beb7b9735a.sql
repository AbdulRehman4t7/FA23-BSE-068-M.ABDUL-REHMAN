
DROP POLICY "Authenticated users can update seats" ON public.seats;
CREATE POLICY "Authenticated users can book available seats" ON public.seats FOR UPDATE TO authenticated USING (status = 'available');
