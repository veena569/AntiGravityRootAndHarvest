const apiKey = process.env.INSFORGE_API_KEY || "ik_fb808e1ef4e0399e48c5f3b820aeffc5";

async function checkInsForge() {
  try {
    const res = await fetch("https://insforge.dev/api/v1/projects/bb356f97-0758-4351-974b-a9ee1aafadec/deployments", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "x-api-key": apiKey
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
}

checkInsForge();
