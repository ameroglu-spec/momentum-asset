-- Momentum Hub V7.0 Sprint 1A.1
-- Finance Seed Data
-- Run after finance_schema.sql while logged in user exists.
-- NOTE: Uses auth.uid(); run from Supabase SQL Editor after authentication context may be unavailable.
-- If auth.uid() is null in SQL Editor, replace auth.uid() with your user UUID.

insert into public.finance_categories (user_id, name, type, color, icon, is_default)
select auth.uid(), x.name, x.type, x.color, x.icon, true
from (values
  ('Maaş','income','#22c55e','wallet'),
  ('Kira Geliri','income','#16a34a','home'),
  ('Faiz / Getiri','income','#0ea5e9','trending-up'),
  ('Diğer Gelir','income','#64748b','plus'),
  ('Market','expense','#f97316','shopping-cart'),
  ('Yakıt','expense','#ef4444','fuel'),
  ('Sigorta','expense','#8b5cf6','shield'),
  ('Vergi','expense','#dc2626','receipt'),
  ('Sağlık','expense','#06b6d4','heart'),
  ('Eğitim','expense','#3b82f6','book'),
  ('Fatura','expense','#f59e0b','file-text'),
  ('Diğer Gider','expense','#64748b','minus'),
  ('Transfer','transfer','#2563eb','repeat'),
  ('Finansman Ödemesi','financing','#7c3aed','landmark'),
  ('Yatırım','investment','#14b8a6','bar-chart')
) as x(name, type, color, icon)
where auth.uid() is not null
on conflict do nothing;
