<template>
  <div class="bg-page min-h-screen text-[#f5f5f7] antialiased">
    <SetupPrompt v-if="showSetup" @setup="handleSetup" />

    <header class="sticky top-0 z-20 bg-page/80 backdrop-blur-xl border-b border-zinc-800">
      <div class="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <h1 class="text-base font-semibold text-white shrink-0"><span class="hidden sm:inline">My Running Journey</span><span class="sm:hidden">MRJ</span></h1>
        <nav class="hidden md:flex items-center gap-0.5">
          <a v-for="s in navSections" :key="s.id" :href="'#'+s.id" @click.prevent="scrollToSection(s.id)" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" :class="activeSection === s.id ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200'">{{ s.label }}</a>
        </nav>
        <div class="flex items-center gap-1 sm:gap-3 overflow-hidden">
          <template v-if="authLoading">
            <span class="text-xs text-zinc-400 whitespace-nowrap">Loading...</span>
          </template>
          <template v-else-if="authUser">
            <button @click="fetchActivities" title="Refresh data" class="text-zinc-400 hover:text-accent transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <svg :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/></svg>
            </button>
            <span class="text-xs text-zinc-400 truncate min-w-0">{{ authUser.firstname }} <span class="hidden sm:inline">{{ authUser.lastname }}</span></span>
            <button @click="logout" class="text-xs text-accent hover:text-accent/80 transition-colors shrink-0 whitespace-nowrap">Logout</button>
          </template>
          <template v-else>
            <a :href="authLoginUrl" class="text-xs text-accent hover:text-accent/80 font-medium transition-colors">Login with Strava</a>
          </template>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-10 pb-24 md:pb-10 space-y-14">
      <StatsSection :activities="statsSourceActivities" :combine="combine" :active-tab="activeTab" :is-loading="isLoading" :insight-text="insightText" />
      <OverallGoalSection :goal-start-date="goalStartDate" :goal-end-date="goalEndDate" :goal-kilometers="goalKilometers" :goal-distance="goalDistance" :goal-activities="goalActivities" :combine="combine" :is-loading="isLoading" @update:goal-start-date="goalStartDate = $event" @update:goal-end-date="goalEndDate = $event" @update:goal-kilometers="goalKilometers = $event" />
      <WeeklyGoalSection :weekly-goal-kilometers="weeklyGoalKilometers" :weekly-goal-distance="weeklyGoalDistance" :weekly-goal-activities="weeklyGoalActivities" :weekly-start-date="weeklyStartDate" :combine="combine" :is-loading="isLoading" @update:weekly-goal-kilometers="weeklyGoalKilometers = $event" />
      <ActivitiesSection :activities="sortedActivities" :combine="combine" :active-tab="activeTab" :is-loading="isLoading" :per-page="perPage" :search-name="searchName" :start-date="startDate" :end-date="endDate" :sort-key="sortKey" :sort-order="sortOrder" :start-date-min="startDateMin" :start-date-max="startDateMax" :end-date-min="endDateMin" :end-date-max="endDateMax" @update:combine="combine = $event" @update:active-tab="activeTab = $event" @update:search-name="searchName = $event" @update:start-date="onStartDateChange" @update:end-date="onEndDateChange" @update:per-page="perPage = $event" @sort="sortBy" @set-this-month="setThisMonth" />
    </main>

    <footer class="border-t border-zinc-800 text-center py-6">
      <p class="text-xs text-zinc-500">© 2025 Karl Louise Rito</p>
    </footer>
    <nav class="fixed bottom-0 left-0 right-0 z-20 bg-page/90 backdrop-blur-xl border-t border-zinc-800 md:hidden flex safe-area-bottom">
      <a v-for="s in navSections" :key="s.id" @click.prevent="scrollToSection(s.id)" class="flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[56px] justify-center cursor-pointer transition-colors" :class="activeSection === s.id ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300'">
        <span class="text-[10px] font-medium leading-none">{{ s.label }}</span>
      </a>
    </nav>
  </div>
</template>

<script>
import StatsSection from "./components/StatsSection.vue";
import OverallGoalSection from "./components/OverallGoalSection.vue";
import WeeklyGoalSection from "./components/WeeklyGoalSection.vue";
import ActivitiesSection from "./components/ActivitiesSection.vue";
import SetupPrompt from "./components/SetupPrompt.vue";
import { db } from "./services/firebase.js";

export default {
  components: { StatsSection, OverallGoalSection, WeeklyGoalSection, ActivitiesSection, SetupPrompt },
  data() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      activities: [],
      sortKey: "start_date_local",
      sortOrder: -1,
      searchName: "",
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
      perPage: "10",
      activeTab: "runs",
      combine: false,
      goalStartDate: localStorage.getItem("goalStartDate") || "",
      goalEndDate: localStorage.getItem("goalEndDate") || "",
      goalKilometers: Number(localStorage.getItem("goalKilometers")) || 500,
      weeklyGoalKilometers: Number(localStorage.getItem("weeklyGoalKilometers")) || 38,
      isLoading: false,
      fetchTimeout: null,
      authUser: null,
      authLoading: true,
      showSetup: false,
      navSections: [
        { id: 'stats', label: 'Stats' },
        { id: 'overall-goals', label: 'Goals' },
        { id: 'weekly-goals', label: 'Weekly' },
        { id: 'recent-activities', label: 'Activities' },
      ],
      activeSection: 'stats',
      observer: null,
    };
  },
  computed: {
    baseFilteredActivities() {
      let filtered = [...this.activities];
      if (this.searchName) {
        filtered = filtered.filter((activity) => activity.name.toLowerCase().includes(this.searchName.toLowerCase()));
      }
      if (this.startDate) {
        filtered = filtered.filter((activity) => new Date(activity.start_date_local) >= new Date(this.startDate));
      }
      if (this.endDate) {
        filtered = filtered.filter((activity) => new Date(activity.start_date_local) <= new Date(this.endDate));
      }
      return filtered;
    },
    tableActivities() {
      if (this.combine) return this.baseFilteredActivities;
      return this.baseFilteredActivities.filter((activity) => activity.type === (this.activeTab === "runs" ? "Run" : "Walk"));
    },
    sortedActivities() {
      const sortKey = this.sortKey;
      const order = this.sortOrder;
      return [...this.tableActivities].sort((a, b) => {
        if (sortKey === "start_date_local") return order * (new Date(b[sortKey]) - new Date(a[sortKey]));
        if (sortKey === "pace") return order * (b.moving_time / 60 / (b.distance / 1000) - a.moving_time / 60 / (a.distance / 1000));
        return order * (b[sortKey] - a[sortKey]);
      });
    },
    apiBase() {
      const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
      return url.replace(/\/api\/activities\/?$/, "").replace(/\/api\/?$/, "");
    },
    authLoginUrl() {
      if (import.meta.env.DEV) return "/auth/strava/login";
      return `${this.apiBase}/auth/strava/login`;
    },
    statsSourceActivities() {
      if (this.combine) return [...this.activities];
      return this.activities.filter((activity) => activity.type === (this.activeTab === "runs" ? "Run" : "Walk"));
    },
    goalActivities() {
      let filtered = [...this.activities];
      if (this.combine) {
        if (this.goalStartDate) {
          filtered = filtered.filter((activity) => new Date(activity.start_date_local) >= new Date(this.goalStartDate));
        }
        return filtered;
      }
      filtered = filtered.filter((activity) => activity.type === (this.activeTab === "runs" ? "Run" : "Walk"));
      if (this.goalStartDate) {
        filtered = filtered.filter((activity) => new Date(activity.start_date_local) >= new Date(this.goalStartDate));
      }
      return filtered;
    },
    goalDistance() {
      const distance = this.goalActivities.reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;
      console.log("Goal Distance:", distance, "Activities:", this.goalActivities);
      return distance.toFixed(1);
    },
    weeklyStartDate() {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return start.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    },
    weeklyGoalActivities() {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      let filtered = this.activities.filter((activity) => new Date(activity.start_date_local) >= startOfWeek && new Date(activity.start_date_local) <= endOfWeek);
      if (!this.combine) {
        filtered = filtered.filter((activity) => activity.type === (this.activeTab === "runs" ? "Run" : "Walk"));
      }
      return filtered;
    },
    weeklyGoalDistance() {
      const distance = this.weeklyGoalActivities.reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;
      console.log("Weekly Goal Distance:", distance, "Activities:", this.weeklyGoalActivities);
      return distance.toFixed(1);
    },
    startDateMax() {
      if (!this.startDate) return null;
      const d = new Date(this.startDate);
      d.setMonth(d.getMonth() + 5);
      return d.toISOString().split("T")[0];
    },
    endDateMin() {
      if (!this.endDate || !this.startDate) return null;
      return this.startDate;
    },
    endDateMax() {
      if (!this.startDate) return null;
      const d = new Date(this.startDate);
      d.setMonth(d.getMonth() + 5);
      return d.toISOString().split("T")[0];
    },
    startDateMin() {
      if (!this.endDate) return null;
      const d = new Date(this.endDate);
      d.setMonth(d.getMonth() - 5);
      return d.toISOString().split("T")[0];
    },
    insightText() {
      if (!this.activities.length) return null;
      const weeklyKm = Number(this.weeklyGoalDistance);
      const weeklyTarget = this.weeklyGoalKilometers;
      if (weeklyTarget > 0 && weeklyKm > 0) {
        const remaining = weeklyTarget - weeklyKm;
        if (remaining > 0) return `${remaining.toFixed(1)} km left to hit this week's ${weeklyTarget} km goal`;
        if (remaining <= 0) return `Weekly goal reached — ${weeklyKm.toFixed(1)} / ${weeklyTarget} km`;
      }
      const streak = this.currentStreak;
      if (streak > 1) return `${streak}-day streak — keep it going`;
      return `${this.activities.length} activities in this period`;
    },
    currentStreak() {
      if (!this.activities.length) return 0;
      const dateSet = new Set();
      this.activities.forEach(a => { dateSet.add(a.start_date_local.split('T')[0]); });
      const dates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a));
      if (!dates.length) return 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const mostRecent = new Date(dates[0] + 'T12:00:00');
      if (Math.round((today - mostRecent) / 86400000) > 1) return 0;
      let streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i-1] + 'T12:00:00');
        const curr = new Date(dates[i] + 'T12:00:00');
        if (Math.round((prev - curr) / 86400000) === 1) streak++;
        else break;
      }
      return streak;
    },
  },
  methods: {
    sortBy(key) {
      this.sortOrder = this.sortKey === key ? -this.sortOrder : -1;
      this.sortKey = key === "pace" ? "pace" : key;
    },
    apiUrl(path) {
      if (import.meta.env.DEV) return path;
      return `${this.apiBase}${path}`;
    },
    authHeaders() {
      const tokens = sessionStorage.getItem("stravaTokens");
      if (!tokens) return {};
      const parsed = JSON.parse(tokens);
      return { Authorization: `Bearer ${parsed.accessToken}`, "X-Refresh-Token": parsed.refreshToken };
    },
    async fetchActivities() {
      this.isLoading = true;
      try {
        console.log("Fetching activities from", this.apiUrl("/api/activities"));
        const params = new URLSearchParams();

        const fromDates = [];
        if (this.startDate) fromDates.push(new Date(this.startDate));
        if (this.goalStartDate) fromDates.push(new Date(this.goalStartDate));
        if (fromDates.length > 0) {
          const earliest = new Date(Math.min(...fromDates));
          params.append("after", earliest.toISOString().split("T")[0]);
        }

        if (this.endDate) params.append("before", this.endDate);

        params.append("per_page", this.goalStartDate ? "200" : String(Math.max(50, parseInt(this.perPage))));

        if (!this.combine && !this.goalStartDate) params.append("type", this.activeTab === "runs" ? "Run" : "Walk");

        const headers = { ...this.authHeaders() };
        const response = await fetch(`${this.apiUrl("/api/activities")}?${params.toString()}`, { method: "GET", headers });

        const newAccess = response.headers.get("X-New-Access-Token");
        if (newAccess) {
          const tokens = JSON.parse(sessionStorage.getItem("stravaTokens") || "{}");
          tokens.accessToken = newAccess;
          tokens.refreshToken = response.headers.get("X-New-Refresh-Token") || tokens.refreshToken;
          sessionStorage.setItem("stravaTokens", JSON.stringify(tokens));
        }

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched activities:", data);
        this.activities = data;
      } catch (error) {
        console.error("Error fetching activities:", error.message);
      } finally {
        this.isLoading = false;
      }
    },
    debouncedFetch() {
      if (this.fetchTimeout) clearTimeout(this.fetchTimeout);
      this.fetchTimeout = setTimeout(() => {
        this.fetchActivities();
      }, 500);
    },
    setThisMonth() {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      this.startDate = firstDay.toISOString().split("T")[0];
      this.endDate = lastDay.toISOString().split("T")[0];
      this.fetchActivities();
    },
    async checkAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const authParam = params.get("auth");
        if (authParam) {
          const data = JSON.parse(atob(authParam));
          this.authUser = data.athlete;
          sessionStorage.setItem("stravaAthlete", JSON.stringify(data.athlete));
          sessionStorage.setItem("stravaTokens", JSON.stringify({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
          window.history.replaceState({}, "", window.location.pathname);
          this.authLoading = false;
          return;
        }

        const stored = sessionStorage.getItem("stravaAthlete");
        if (stored) {
          this.authUser = JSON.parse(stored);
          this.authLoading = false;
          return;
        }

        const opts = { method: "GET" };
        if (import.meta.env.PROD) opts.credentials = "include";
        const res = await fetch(this.apiUrl("/api/auth/me"), opts);
        const data = await res.json();
        if (data.loggedIn) {
          this.authUser = data.athlete;
          sessionStorage.setItem("stravaAthlete", JSON.stringify(data.athlete));
        }
      } catch (e) {
        console.error("Auth check failed:", e.message);
      } finally {
        this.authLoading = false;
      }
    },
    async logout() {
      this.authUser = null;
      sessionStorage.removeItem("stravaAthlete");
      sessionStorage.removeItem("stravaTokens");
      try {
        const opts = { method: "POST", headers: { "Content-Type": "application/json" } };
        if (import.meta.env.PROD) opts.credentials = "include";
        await fetch(this.apiUrl("/api/auth/logout"), opts);
      } catch (e) {
        console.error("Logout failed:", e.message);
      }
    },
    scrollToSection(sectionId) {
      console.log("Scrolling to section:", sectionId);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        console.warn(`Section with ID ${sectionId} not found`);
      }
    },
    handleSetup(data) {
      this.showSetup = false;
      localStorage.setItem("onboardingComplete", "true");
      if (data) {
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        localStorage.setItem("onboardingStartDate", data.startDate);
        localStorage.setItem("onboardingEndDate", data.endDate);
      }
      this.fetchActivities();
    },
    onStartDateChange(val) {
      this.startDate = val;
      if (this.startDate && this.endDate) {
        const maxEnd = new Date(this.startDate);
        maxEnd.setMonth(maxEnd.getMonth() + 5);
        const maxEndStr = maxEnd.toISOString().split("T")[0];
        if (this.endDate > maxEndStr) this.endDate = maxEndStr;
      }
    },
    onEndDateChange(val) {
      this.endDate = val;
      if (this.startDate && this.endDate) {
        const minStart = new Date(this.endDate);
        minStart.setMonth(minStart.getMonth() - 5);
        const minStartStr = minStart.toISOString().split("T")[0];
        if (this.startDate < minStartStr) this.startDate = minStartStr;
      }
    },
    initObserver() {
      this.observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          this.activeSection = visible[0].target.id;
        }
      }, { rootMargin: '-100px 0px -40% 0px', threshold: 0 });
      for (const s of this.navSections) {
        const el = document.getElementById(s.id);
        if (el) this.observer.observe(el);
      }
    },
  },
  watch: {
    startDate() {
      if (this.startDate && this.endDate) this.debouncedFetch();
    },
    endDate() {
      if (this.startDate && this.endDate) this.debouncedFetch();
    },
    activeTab(newTab) {
      this.activities = [];
      if (!this.combine) this.debouncedFetch();
    },
    combine(newVal) {
      this.activities = [];
      this.debouncedFetch();
    },
    goalStartDate(val) {
      localStorage.setItem("goalStartDate", val);
      this.debouncedFetch();
    },
    goalEndDate(val) {
      localStorage.setItem("goalEndDate", val);
    },
    goalKilometers(val) {
      localStorage.setItem("goalKilometers", val);
      if (this.goalKilometers < 1) this.goalKilometers = 1;
    },
    weeklyGoalKilometers(val) {
      localStorage.setItem("weeklyGoalKilometers", val);
      if (this.weeklyGoalKilometers < 1) this.weeklyGoalKilometers = 1;
    },
  },
    mounted() {
    this.$nextTick(() => this.initObserver());
    this.checkAuth().then(() => {
      if (!this.authUser) return;
      const onboardingDone = localStorage.getItem("onboardingComplete");
      if (!onboardingDone) {
        const savedStart = localStorage.getItem("onboardingStartDate");
        const savedEnd = localStorage.getItem("onboardingEndDate");
        if (savedStart && savedEnd) {
          this.startDate = savedStart;
          this.endDate = savedEnd;
          this.fetchActivities();
        } else {
          this.showSetup = true;
        }
      } else {
        this.fetchActivities();
      }
    });
  },
};
</script>



