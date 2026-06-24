require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cookieSession = require("cookie-session");
const admin = require("firebase-admin");

const app = express();
const port = 3000;

// Initialize Firebase Admin with explicit service account path
const serviceAccount = require("./personal-strava-runs-firebase-adminsdk-fbsvc-c46d021586.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Strava API credentials (env fallback)
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
let STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
let STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || "http://localhost:5173/auth/strava/callback";
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

// Session middleware
app.use(
  cookieSession({
    name: "session",
    secret: process.env.SESSION_SECRET || "strava-session-secret-change-in-prod",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  })
);

const ALLOWED_ORIGINS = [FRONTEND_URL.replace(/\/+$/, ""), "https://karlritostrava.netlify.app", "http://localhost:5173"];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(express.json());

// --- Helpers ---

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getTokens(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return {
      accessToken: auth.slice(7),
      refreshToken: req.headers["x-refresh-token"] || null,
      isSession: false,
    };
  }
  if (req.session && req.session.accessToken) {
    return {
      accessToken: req.session.accessToken,
      refreshToken: req.session.refreshToken,
      isSession: true,
    };
  }
  return {
    accessToken: STRAVA_ACCESS_TOKEN,
    refreshToken: STRAVA_REFRESH_TOKEN,
    isSession: false,
  };
}

async function refreshTokens(req, res, tokens, isBearer) {
  try {
    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    });
    const newAccess = response.data.access_token;
    const newRefresh = response.data.refresh_token || tokens.refreshToken;

    if (isBearer && res) {
      res.set("X-New-Access-Token", newAccess);
      res.set("X-New-Refresh-Token", newRefresh);
    } else if (tokens.isSession) {
      req.session.accessToken = newAccess;
      req.session.refreshToken = newRefresh;
    } else {
      STRAVA_ACCESS_TOKEN = newAccess;
      STRAVA_REFRESH_TOKEN = newRefresh;
    }
    console.log("Access token refreshed:", newAccess.slice(0, 10) + "...");
    return newAccess;
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    throw error;
  }
}

async function fetchStravaActivities(accessToken, perPage, afterTimestamp, beforeTimestamp, activityType) {
  let allActivities = [];
  let page = 1;
  let fetchedActivities = [];

  do {
    const params = { per_page: 50, page };
    if (afterTimestamp) params.after = afterTimestamp;
    if (beforeTimestamp) params.before = beforeTimestamp;
    const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    fetchedActivities = response.data.filter(
      (activity) =>
        (!activityType || activity.type === activityType) &&
        Number(activity.distance) > 0 &&
        Number(activity.moving_time) > 0
    );
    allActivities = allActivities.concat(fetchedActivities);
    page++;
    if (fetchedActivities.length > 0 && allActivities.length < perPage) await sleep(250);
  } while (fetchedActivities.length > 0 && allActivities.length < perPage);

  return allActivities.slice(0, perPage);
}

// --- Auth Routes ---

app.get("/auth/strava/login", (req, res) => {
  const url = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${STRAVA_REDIRECT_URI}&response_type=code&approval_prompt=auto&scope=read,activity:read_all`;
  res.redirect(url);
});

app.get("/auth/strava/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    });

    const athlete = response.data.athlete;
    const athleteData = { id: athlete.id, firstname: athlete.firstname, lastname: athlete.lastname, avatar: athlete.profile_medium };
    const authData = { athlete: athleteData, accessToken: response.data.access_token, refreshToken: response.data.refresh_token, expiresAt: response.data.expires_at };
    req.session.accessToken = response.data.access_token;
    req.session.refreshToken = response.data.refresh_token;
    req.session.athlete = athleteData;
    req.session.tokenExpiresAt = response.data.expires_at;

    const encoded = Buffer.from(JSON.stringify(authData)).toString("base64");
    res.redirect(`${FRONTEND_URL}?auth=${encoded}`);
  } catch (error) {
    console.error("Strava OAuth callback error:", error.response?.data || error.message);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/me", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  if (req.session && req.session.athlete) {
    return res.json({
      loggedIn: true,
      athlete: {
        id: req.session.athlete.id,
        firstname: req.session.athlete.firstname,
        lastname: req.session.athlete.lastname,
        avatar: req.session.athlete.profile_medium,
      },
    });
  }
  res.json({ loggedIn: false });
});

app.post("/api/auth/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

// --- Activities Route ---

app.get("/", (req, res) => {
  res.send("Welcome to My Running Site Backend! Use /api/activities to fetch run or walk data.");
});

app.get("/api/activities", async (req, res) => {
  const tokens = getTokens(req);
  if (!tokens.accessToken) {
    return res.status(401).json({ error: "No Strava token available. Log in or configure env vars." });
  }

  try {
    const { per_page = 10, after, before, type } = req.query;
    const perPage = Math.min(parseInt(per_page, 10), 200);
    const afterTimestamp = after ? Math.floor(new Date(after).getTime() / 1000) : 0;
    const beforeTimestamp = before ? Math.floor(new Date(before).getTime() / 1000) : Math.floor(Date.now() / 1000);
    const activityType = type === "Run" || type === "Walk" ? type : null;

    // Check Firestore cache first
    let query = db.collection("activities");
    if (activityType) query = query.where("type", "==", activityType);
    if (after) query = query.where("start_date_local", ">=", new Date(after).toISOString());
    if (before) query = query.where("start_date_local", "<=", new Date(before).toISOString());
    const activitiesSnapshot = await query.orderBy("start_date_local", "desc").limit(perPage).get();
    const cachedActivities = activitiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const lastSync = (await db.collection("metadata").doc("sync").get()).data()?.lastSync || 0;
    const oneDay = 24 * 60 * 60 * 1000;

    if (cachedActivities.length >= perPage && Date.now() - lastSync < oneDay) {
      console.log("Serving cached activities:", cachedActivities.length);
      return res.json(cachedActivities);
    }

    // Fetch from Strava
    console.log("Fetching from Strava");
    const activities = await fetchStravaActivities(tokens.accessToken, perPage, afterTimestamp, beforeTimestamp, activityType);

    // Save to Firestore (best-effort — never block the response)
    try {
      const batch = db.batch();
      activities.forEach((activity) => {
        const activityRef = db.collection("activities").doc(activity.id.toString());
        batch.set(activityRef, {
          ...activity,
          distance: Number(activity.distance),
          moving_time: Number(activity.moving_time),
          start_date_local: new Date(activity.start_date_local).toISOString(),
          type: activity.type,
        });
      });
      batch.set(db.collection("metadata").doc("sync"), { lastSync: Date.now() });
      await batch.commit();
      console.log("Saved to Firestore:", activities.length, "activities");
    } catch (writeErr) {
      console.warn("Firestore write failed (serving Strava data anyway):", writeErr.message);
    }

    res.json(activities);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("Token expired, refreshing...");
      try {
        const isBearer = !!req.headers.authorization?.startsWith("Bearer ");
        const newAccess = await refreshTokens(req, res, tokens, isBearer);
        const { per_page = 10, after, before, type } = req.query;
        const perPage = Math.min(parseInt(per_page, 10), 200);
        const afterTimestamp = after ? Math.floor(new Date(after).getTime() / 1000) : 0;
        const beforeTimestamp = before ? Math.floor(new Date(before).getTime() / 1000) : Math.floor(Date.now() / 1000);
        const activityType = type === "Run" || type === "Walk" ? type : null;

        const activities = await fetchStravaActivities(newAccess, perPage, afterTimestamp, beforeTimestamp, activityType);

        try {
          const batch = db.batch();
          activities.forEach((activity) => {
            const activityRef = db.collection("activities").doc(activity.id.toString());
            batch.set(activityRef, {
              ...activity,
              distance: Number(activity.distance),
              moving_time: Number(activity.moving_time),
              start_date_local: new Date(activity.start_date_local).toISOString(),
              type: activity.type,
            });
          });
          batch.set(db.collection("metadata").doc("sync"), { lastSync: Date.now() });
          await batch.commit();
        } catch (writeErr) {
          console.warn("Firestore write failed (serving Strava data anyway):", writeErr.message);
        }
        res.json(activities);
      } catch (retryError) {
        console.error("Error after refreshing token:", retryError.message);
        res.status(500).json({ error: "Failed to fetch activities" });
      }
    } else if (error.response && error.response.status === 429) {
      console.warn("Strava rate limited (429), serving stale cache");
      try {
        let fallbackQuery = db.collection("activities");
        const { after, before, type } = req.query;
        if (type === "Run" || type === "Walk") fallbackQuery = fallbackQuery.where("type", "==", type);
        if (after) fallbackQuery = fallbackQuery.where("start_date_local", ">=", new Date(after).toISOString());
        if (before) fallbackQuery = fallbackQuery.where("start_date_local", "<=", new Date(before).toISOString());
        const snapshot = await fallbackQuery.orderBy("start_date_local", "desc").limit(200).get();
        const cached = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (cached.length > 0) return res.json(cached);
      } catch (cacheErr) {
        console.error("Cache fallback also failed:", cacheErr.message);
      }
      res.status(429).json({ error: "Rate limited. Try again later." });
    } else {
      console.error("Error fetching Strava data:", error.message);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
