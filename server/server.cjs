require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = 3000;

// Strava API credentials
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
let STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
console.log("Using Strava credentials:", {
  clientId: CLIENT_ID,
  accessToken: STRAVA_ACCESS_TOKEN ? STRAVA_ACCESS_TOKEN.slice(0, 10) + "..." : "Not set",
  refreshToken: STRAVA_REFRESH_TOKEN ? STRAVA_REFRESH_TOKEN.slice(0, 10) + "..." : "Not set",
});

// Refresh token function
async function refreshAccessToken() {
  try {
    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    });
    STRAVA_ACCESS_TOKEN = response.data.access_token;
    console.log("Access token refreshed:", STRAVA_ACCESS_TOKEN);
    return STRAVA_ACCESS_TOKEN;
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    if (error.response) {
      console.error("Refresh error status:", error.response.status);
      console.error("Refresh error data:", error.response.data);
    }
    throw error;
  }
}

app.use(cors());

// Root route for testing
app.get("/", (req, res) => {
  res.send("Welcome to My Running Site Backend! Use /api/runs to fetch run data.");
});

app.get("/api/runs", async (req, res) => {
  try {
    console.log("Making Strava API request with token:", STRAVA_ACCESS_TOKEN.slice(0, 10) + "...");
    const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
      headers: {
        Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}`,
      },
      params: {
        per_page: 10,
      },
    });
    console.log("Strava API response:", response.data.length, "activities");
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("Token expired, refreshing...");
      try {
        await refreshAccessToken();
        const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
          headers: {
            Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}`,
          },
          params: {
            per_page: 10,
          },
        });
        console.log("Strava API response after refresh:", response.data.length, "activities");
        res.json(response.data);
      } catch (retryError) {
        console.error("Error after refreshing token:", retryError.message);
        if (retryError.response) {
          console.error("Retry error status:", retryError.response.status);
          console.error("Retry error data:", retryError.response.data);
        }
        res.status(500).json({ error: "Failed to fetch runs" });
      }
    } else {
      console.error("Error fetching Strava data:", error.message);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      res.status(500).json({ error: "Failed to fetch runs" });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
