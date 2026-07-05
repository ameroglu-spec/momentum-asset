-- Momentum Hub V7.0 Sprint 1A.2
-- Finance Storage Bucket and Policies
-- Run after finance_schema.sql

-- Private bucket for finance documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'finance-documents',
  'finance-documents',
  false,
  52428800,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention:
-- finance-documents/{user_id}/accounts/{account_id}/file.pdf
-- finance-documents/{user_id}/transactions/{transaction_id}/file.pdf
-- finance-documents/{user_id}/financings/{financing_id}/file.pdf
-- finance-documents/{user_id}/goals/{goal_id}/file.pdf

-- Remove existing storage policies safely
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname LIKE 'finance_documents_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- Users can view their own finance files.
create policy "finance_documents_select_own"
on storage.objects for select
using (
  bucket_id = 'finance-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload files only under their own user_id folder.
create policy "finance_documents_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'finance-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update files only under their own user_id folder.
create policy "finance_documents_update_own"
on storage.objects for update
using (
  bucket_id = 'finance-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'finance-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete files only under their own user_id folder.
create policy "finance_documents_delete_own"
on storage.objects for delete
using (
  bucket_id = 'finance-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);
