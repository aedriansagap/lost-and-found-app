const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// This requires the SERVICE ROLE KEY to bypass RLS and update all users' posts
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in the environment variables.');
  console.log('Please provide your Supabase Service Role Key so the migration script can bypass RLS.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OLD_PROJECT_ID = 'ejusjkegshuiubzkezzl';
const NEW_PROJECT_ID = 'bfbleggwrmvyxarfmcqf';
const OLD_DOMAIN = `${OLD_PROJECT_ID}.supabase.co`;
const NEW_DOMAIN = `${NEW_PROJECT_ID}.supabase.co`;

async function migrateImages() {
  console.log('Starting migration...');

  // 1. Migrate Profiles
  console.log('Fetching profiles...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .ilike('avatar_url', `%${OLD_DOMAIN}%`);

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else if (profiles && profiles.length > 0) {
    console.log(`Found ${profiles.length} profiles with old image URLs. Updating...`);
    for (const profile of profiles) {
      const newAvatarUrl = profile.avatar_url.replace(OLD_DOMAIN, NEW_DOMAIN);
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', profile.id);
      
      if (error) console.error(`Failed to update profile ${profile.id}:`, error);
    }
    console.log('Profiles migration completed.');
  } else {
    console.log('No profiles needed updating.');
  }

  // 2. Migrate Posts
  console.log('Fetching posts...');
  // Since 'images' is a text array, we can't simply use ilike on the array column easily in JS
  // We'll fetch all posts that have images and filter locally for safety and simplicity.
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, images')
    .not('images', 'eq', '{}');

  if (postsError) {
    console.error('Error fetching posts:', postsError);
  } else if (posts && posts.length > 0) {
    let updatedCount = 0;
    
    for (const post of posts) {
      if (!post.images || !Array.isArray(post.images)) continue;
      
      let needsUpdate = false;
      const newImages = post.images.map(img => {
        if (img && img.includes(OLD_DOMAIN)) {
          needsUpdate = true;
          return img.replace(OLD_DOMAIN, NEW_DOMAIN);
        }
        return img;
      });

      if (needsUpdate) {
        const { error } = await supabase
          .from('posts')
          .update({ images: newImages })
          .eq('id', post.id);
          
        if (error) {
          console.error(`Failed to update post ${post.id}:`, error);
        } else {
          updatedCount++;
        }
      }
    }
    console.log(`Updated ${updatedCount} posts with old image URLs.`);
  } else {
    console.log('No posts needed updating.');
  }

  console.log('Migration finished!');
}

migrateImages().catch(console.error);
