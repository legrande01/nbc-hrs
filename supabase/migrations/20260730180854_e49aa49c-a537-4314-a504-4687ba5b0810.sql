CREATE OR REPLACE FUNCTION public.validate_room_notification()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := btrim(NEW.full_name);
  NEW.email := lower(btrim(NEW.email));
  NEW.phone := btrim(NEW.phone);

  IF char_length(NEW.full_name) < 2 OR char_length(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Invalid full name';
  END IF;

  IF NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR char_length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  IF NEW.phone !~ '^[0-9+()\-\s]{7,20}$' THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;

  IF char_length(NEW.hotel_id) > 100 OR char_length(NEW.room_id) > 100
     OR char_length(coalesce(NEW.room_name, '')) > 200 THEN
    RAISE EXCEPTION 'Invalid room reference';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_room_notifications
BEFORE INSERT OR UPDATE ON public.room_notifications
FOR EACH ROW EXECUTE FUNCTION public.validate_room_notification();