-- Das Lernprotokoll wird nur angefügt (CLAUDE.md §8). UPDATE geht nie, DELETE
-- nur in der Transaktion, die ein Konto löscht und dafür
-- `set local ouf.konto_loeschen = 'an'` setzt.
CREATE FUNCTION protokoll_nur_anfuegen() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('ouf.konto_loeschen', true) = 'an' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Das Lernprotokoll wird nur angefügt (%).', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER reviews_nur_anfuegen BEFORE UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION protokoll_nur_anfuegen();
--> statement-breakpoint
CREATE TRIGGER review_undos_nur_anfuegen BEFORE UPDATE OR DELETE ON review_undos
  FOR EACH ROW EXECUTE FUNCTION protokoll_nur_anfuegen();
