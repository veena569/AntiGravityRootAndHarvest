async function testFast2SMS() {
  const apiKey = "fpHwim5ZQaNB3WTgIvs6Vby01tFzXoeS7x2DKRhLClj4OnuGdAWsZ3YfT9BuzyXp2PeQoI6iOMD8dUL7";
  const numbers = "9121603832,9666913832";
  const message = "Root & Harvest: Test order RH-9999 received. Customer: Test. Amount: Rs.99. Payment: Online.";

  console.log("Testing Fast2SMS with numbers:", numbers);
  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",
      message: message,
      numbers: numbers,
    }),
  });

  const text = await response.text();
  console.log("Fast2SMS Response:", text);
}

testFast2SMS().catch(console.error);
