import { supabase } from './supabase';

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Supabase connection failed:', error.message);
    return false;
  }

  console.log('Supabase connection successful!');
  console.log('Categories:', data);

  return true;
}