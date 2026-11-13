CREATE TABLE public.practice_progress (user_id uuid NOT NULL DEFAULT auth.uid(), key text NOT NULL, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,key));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_progress TO authenticated;
GRANT ALL ON public.practice_progress TO service_role;
ALTER TABLE public.practice_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress only" ON public.practice_progress FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);