-- Migration: Add INSERT policy for profiles table to support client-side upsert
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
