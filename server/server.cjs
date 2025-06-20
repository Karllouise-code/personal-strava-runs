require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const port = 3000;

// Initialize Firebase Admin with explicit service account path
const serviceAccount = require("./personal-strava-runs-firebase-adminsdk-fbsvc-e577d85c90.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Strava API credentials
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
let STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

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
    console.log("Access token refreshed:", STRAVA_ACCESS_TOKEN.slice(0, 10) + "...");
    return STRAVA_ACCESS_TOKEN;
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    throw error;
  }
}

app.use(cors({
  origin: 'https://karlritostrava.netlify.app' // Uncomment to restrict CORS
}));

app.get("/", (req, res) => {
  res.send("Welcome to My Running Site Backend! Use /api/activities to fetch run or walk data.");
});

app.get("/api/activities", async (req, res) => {
  try {
    const { per_page = 10, after, before, type } = req.query;
    const perPage = Math.min(parseInt(per_page, 10), 200); // Cap at Strava's max
    const afterTimestamp = after ? Math.floor(new Date(after).getTime() / 1000) : 0;
    const beforeTimestamp = before ? Math.floor(new Date(before).getTime() / 1000) : Math.floor(Date.now() / 1000);
    const activityType = type === 'Run' || type === 'Walk' ? type : null; // Validate type

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
    console.log("Fetching from Strava with token:", STRAVA_ACCESS_TOKEN.slice(0, 10) + "...");
    let allActivities = [];
    let page = 1;
    let fetchedActivities = [];

    // Fetch enough activities to satisfy perPage of the specific type
    do {
      const params = { per_page: 50, page }; // Fetch in batches
      if (afterTimestamp) params.after = afterTimestamp;
      if (beforeTimestamp) params.before = beforeTimestamp;
      const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
        headers: { Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}` },
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
    } while (fetchedActivities.length > 0 && allActivities.length < perPage);

    // Take only the requested number of activities
    const activities = allActivities.slice(0, perPage);

    // Save to Firestore
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

    res.json(activities);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("Token expired, refreshing...");
      try {
        await refreshAccessToken();
        const { per_page = 10, after, before, type } = req.query;
        const perPage = Math.min(parseInt(per_page, 10), 200);
        const afterTimestamp = after ? Math.floor(new Date(after).getTime() / 1000) : 0;
        const beforeTimestamp = before ? Math.floor(new Date(before).getTime() / 1000) : Math.floor(Date.now() / 1000);
        const activityType = type === 'Run' || type === 'Walk' ? type : null;

        let allActivities = [];
        let page = 1;
        let fetchedActivities = [];

        do {
          const params = { per_page: 50, page };
          if (afterTimestamp) params.after = afterTimestamp;
          if (beforeTimestamp) params.before = beforeTimestamp;
          const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
            headers: { Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}` },
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
        } while (fetchedActivities.length > 0 && allActivities.length < perPage);

        const activities = allActivities.slice(0, perPage);

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
        res.json(activities);
      } catch (retryError) {
        console.error("Error after refreshing token:", retryError.message);
        res.status(500).json({ error: "Failed to fetch activities" });
      }
    } else {
      console.error("Error fetching Strava data:", error.message);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});