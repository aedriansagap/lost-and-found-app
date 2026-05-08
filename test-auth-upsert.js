const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = 'testuser12345@test.edu';
  const password = 'Password123!';
  
  console.log('Login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) {
    console.log('Login error:', loginError);
    return;
  }
  
  const userId = loginData.session?.user?.id;
  console.log('Upserting profile for user', userId);
  
  const { data: upsertData, error: upsertError } = await supabase.from('profiles').upsert({
    id: userId,
    email: email,
    full_name: 'Test User',
  }, { onConflict: 'id' });
  
  console.log('Upsert result:', { upsertData, upsertError });
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  console.log('Profile fetch result after upsert:', { profile, profileError });
}

test();
