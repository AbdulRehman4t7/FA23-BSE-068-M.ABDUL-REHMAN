import { supabase } from "./supabase";

export async function getProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ ...profile, id: 1 })
    .select()
    .single();
  if (error) throw error;
  return data;
}
