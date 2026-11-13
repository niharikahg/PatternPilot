CREATE TABLE public.problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  problem_text text NOT NULL,
  pattern text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Medium',
  confidence int NOT NULL DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
  breakdown jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.problems TO authenticated;
GRANT ALL ON public.problems TO service_role;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.problems FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.problems FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.problems FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.problems FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX problems_user_idx ON public.problems(user_id, created_at DESC);