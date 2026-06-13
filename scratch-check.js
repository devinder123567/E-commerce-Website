const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const brand = 'Sony,Apple';
  const brandList = brand.split(',').map(b => b.trim());
  const orConditions = [];
  brandList.forEach(b => {
    orConditions.push(`metadata->>brand.eq."${b}"`);
    orConditions.push(`name.ilike.%${b}%`);
  });

  console.log('Or conditions:', orConditions.join(','));

  const { data, error } = await supabase
    .from('products')
    .select('id, name, metadata')
    .or(orConditions.join(','));

  if (error) {
    console.error('Error running query:', error);
  } else {
    console.log(`Success! Found ${data.length} products for brands ${brand}`);
    data.slice(0, 5).forEach(p => {
      console.log(`- ${p.name} (${p.metadata?.brand})`);
    });
  }
}

run();
