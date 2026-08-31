const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findWaba() {
  const config = await prisma.whatsappConfig.findFirst();
  const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${config.accessToken}&access_token=${config.accessToken}`);
  const debugData = await debugRes.json();
  console.log("Granular scopes:", JSON.stringify(debugData.data?.granular_scopes, null, 2));

  const targetIds = debugData.data?.granular_scopes
    ?.flatMap(s => s.target_ids || []);
  console.log("Target IDs:", targetIds);

  for (const tid of new Set(targetIds)) {
    const res = await fetch(`https://graph.facebook.com/v18.0/${tid}/message_templates`, {
      headers: { "Authorization": `Bearer ${config.accessToken}` }
    });
    const data = await res.json();
    if (data.data) {
      console.log(`\n=== FOUND TEMPLATES FOR WABA ID ${tid} ===`);
      console.log(JSON.stringify(data.data, null, 2));
    }
  }
}

findWaba()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
