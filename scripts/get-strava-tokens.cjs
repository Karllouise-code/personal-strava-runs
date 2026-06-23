// Run: node scripts/get-strava-tokens.cjs
// Step 1: Visit the auth URL below, authorize, then copy the "code" from the redirect URL
// Step 2: Paste the code into the prompt to exchange for access + refresh tokens

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const axios = require("axios");
const readline = require("readline");

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all,read`;

console.log("\n1. Visit this URL in your browser:\n");
console.log("  " + authUrl + "\n");
console.log("2. Authorize the app.");
console.log("3. You'll be redirected to http://localhost/?state=&code=XXXXXXXX");
console.log("   Copy the `code` value from the URL.\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("4. Paste the code here: ", async (code) => {
  try {
    const resp = await axios.post("https://www.strava.com/oauth/token", {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code.trim(),
      grant_type: "authorization_code",
    });
    console.log("\nDone! Update your .env with:\n");
    console.log(`STRAVA_ACCESS_TOKEN=${resp.data.access_token}`);
    console.log(`STRAVA_REFRESH_TOKEN=${resp.data.refresh_token}\n`);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
  rl.close();
});
