import { supabase } from "@/integrations/supabase/client";

// Temporary type workaround until Supabase types are fully updated
export const db = supabase as any;
