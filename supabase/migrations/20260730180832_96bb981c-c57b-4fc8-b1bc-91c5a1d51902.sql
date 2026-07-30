CREATE TABLE public.room_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_name TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.room_notifications TO anon;
GRANT INSERT ON public.room_notifications TO authenticated;
GRANT ALL ON public.room_notifications TO service_role;

ALTER TABLE public.room_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request a room notification"
  ON public.room_notifications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_room_notifications_updated_at
BEFORE UPDATE ON public.room_notifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();