import { supabase } from "./supabase";

export async function getBlogPosts(publishedOnly = true) {
  let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
  if (publishedOnly) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function getBlogPost(id) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function addBlogPost(post) {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert([post])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlogPost(id, post) {
  const { data, error } = await supabase
    .from("blog_posts")
    .update(post)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}
