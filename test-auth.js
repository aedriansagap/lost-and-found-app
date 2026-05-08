const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = 'testuser12345@test.edu';
  const password = 'Password123!';
  
  console.log('Signing up...');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.log('Signup error:', error);
    console.log('Trying to login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      console.log('Login error:', loginError);
      return;
    }
  }
  
  console.log('Logged in. Fetching profile...');
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    console.log('No user ID found in session');
    return;
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  console.log('Profile fetch result:', { profile, profileError });
}

test();
