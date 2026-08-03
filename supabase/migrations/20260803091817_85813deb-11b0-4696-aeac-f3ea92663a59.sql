CREATE POLICY "Partners can view their own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Partners can upload their own documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Partners can update their own documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Partners can delete their own documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);