// scripts/verify-admin-pages.mjs
async function testUrls() {
  const routes = [
    '/admin',
    '/admin/orders',
    '/admin/products',
    '/admin/promotions',
    '/admin/reports',
    '/admin/reviews',
    '/admin/chat',
    '/admin/settings',
    '/admin/store-settings',
    '/cart',
    '/'
  ];

  console.log('Testing routes on http://localhost:3000...\n');
  let hasError = false;

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      const text = await res.text();
      const status = res.status;
      if (status >= 200 && status < 400) {
        console.log(`✅ [${status}] ${route} (Length: ${text.length})`);
      } else {
        console.error(`❌ [${status}] ${route}`);
        hasError = true;
      }
    } catch (err) {
      console.error(`❌ Error connecting to ${route}:`, err.message);
      hasError = true;
    }
  }

  if (hasError) {
    console.error('\nSome routes failed verification.');
    process.exit(1);
  } else {
    console.log('\nAll tested routes returned HTTP 200 OK!');
    process.exit(0);
  }
}

testUrls();
