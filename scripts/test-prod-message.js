const token1 = 'EAAVT6zoqXSQBSdZCko7fPZCuuVla5skHGyyUrfNhHC3vb8CWfPuhhOXNvKp8paLBw8FFy4pqR1l30oqmb3ANZA9aYCTrxfatHbzhIjBJ0DnI9NxYRVzIXvVU6F1R5ShGBZBZAM4xNAuYCql8iInXz0OkAjLgqpQsYV8URXKDCOKB02LTrEMtMGDZAZCCZCIyIQZDZD';
const token2 = 'EAAVT6zoqXSQBSRFgSYg3uWuFpvnEaZBNMeBxNOCvKOaQFQdfwZAON6UZBwYVgD5OYxbpByCZBgSWA6WKf1SVW94rSdaF7PEiMpgeN8P4VSso45efne6Mddg1AVXl3p5Q9JeAZAsuij8ISZAhfTi6EqpFQ4yBZCQv8k1lXrBNiQWZBGRVfFQfZATxTeYfdk4jJzQZDZD';

const phoneId = '1287131151144457';

async function testTokens() {
  console.log('--- Testing Token 1 (System User Token) ---');
  const res1 = await fetch(`https://graph.facebook.com/v18.0/${phoneId}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  console.log('Token 1 Response:', await res1.json());

  console.log('\n--- Testing Token 2 (Temporary Developer Token) ---');
  const res2 = await fetch(`https://graph.facebook.com/v18.0/${phoneId}`, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  console.log('Token 2 Response:', await res2.json());
}

testTokens();
