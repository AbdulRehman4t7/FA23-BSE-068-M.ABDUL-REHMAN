import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.");
}

const mockBuilder = {
  select: () => mockBuilder,
  single: () => Promise.resolve({ data: null, error: null }),
  order: () => mockBuilder,
  eq: () => mockBuilder,
  insert: () => mockBuilder,
  update: () => mockBuilder,
  upsert: () => mockBuilder,
  delete: () => mockBuilder,
  then: (resolve) => resolve({ data: null, error: null }),
};

const mockSupabase = {
  from: () => mockBuilder,
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;

/**
 * Upload an image to Supabase Storage and return its public URL
 * @param {File} file 
 * @param {string} folder optional folder name
 * @returns {Promise<string>} public URL of the uploaded image
 */
export async function uploadImage(file, folder = "uploads") {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('portfolio-images') // Bucket name in Supabase
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error.message);
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

