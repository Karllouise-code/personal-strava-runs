<template>
  <div class="bg-[#0a0a0b] min-h-screen text-[#f5f5f7] antialiased relative">
    <header class="sticky top-0 z-20 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-white/[0.06]">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold tracking-tight">My Running Journey</h1>
        <span class="text-xs text-[#86868b]">Powered by Strava</span>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8 space-y-10">
      <StatsSection :activities="statsSourceActivities" :combine="combine" :active-tab="activeTab" :is-loading="isLoading" />
      <OverallGoalSection :goal-start-date="goalStartDate" :goal-kilometers="goalKilometers" :goal-distance="goalDistance" :goal-activities="goalActivities" :combine="combine" @update:goal-start-date="goalStartDate = $event" @update:goal-kilometers="goalKilometers = $event" />
      <WeeklyGoalSection :weekly-goal-kilometers="weeklyGoalKilometers" :weekly-goal-distance="weeklyGoalDistance" :weekly-goal-activities="weeklyGoalActivities" :weekly-start-date="weeklyStartDate" :combine="combine" @update:weekly-goal-kilometers="weeklyGoalKilometers = $event" />
      <ActivitiesSection :activities="sortedTableActivities" :combine="combine" :active-tab="activeTab" :is-loading="isLoading" :per-page="perPage" :search-name="searchName" :start-date="startDate" :end-date="endDate" :sort-key="sortKey" :sort-order="sortOrder" @update:combine="combine = $event" @update:active-tab="activeTab = $event" @update:search-name="searchName = $event" @update:start-date="startDate = $event" @update:end-date="endDate = $event" @update:per-page="perPage = $event" @sort="sortBy" @set-this-month="setThisMonth" />
    </main>

    <nav class="fixed top-1/2 right-6 transform -translate-y-1/2 bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-2xl p-3 z-30 hidden md:block">
      <ul class="space-y-1">
        <li><a href="#stats" @click.prevent="scrollToSection('stats')" class="block px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#fc4c02] rounded-xl hover:bg-white/[0.05] transition-colors">Stats</a></li>
        <li><a href="#overall-goals" @click.prevent="scrollToSection('overall-goals')" class="block px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#fc4c02] rounded-xl hover:bg-white/[0.05] transition-colors">Goals</a></li>
        <li><a href="#weekly-goals" @click.prevent="scrollToSection('weekly-goals')" class="block px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#fc4c02] rounded-xl hover:bg-white/[0.05] transition-colors">Weekly</a></li>
        <li><a href="#recent-activities" @click.prevent="scrollToSection('recent-activities')" class="block px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#fc4c02] rounded-xl hover:bg-white/[0.05] transition-colors">Activities</a></li>
      </ul>
    </nav>

    <footer class="border-t border-white/[0.06] text-center py-5">
      <p class="text-xs text-[#86868b]">© 2025 Karl Louise Rito</p>
    </footer>
  </div>
</template>

<script>
import StatsSection from "./components/StatsSection.vue";
import OverallGoalSection from "./components/OverallGoalSection.vue";
import WeeklyGoalSection from "./components/WeeklyGoalSection.vue";
import ActivitiesSection from "./components/ActivitiesSection.vue";
import { db } from "./services/firebase.js";

export default {
  components: { StatsSection, OverallGoalSection, WeeklyGoalSection, ActivitiesSection },
  data() {
    return {
      activities: [],
      sortKey: "start_date_local",
      sortOrder: -1,
      searchName: "",
      startDate: "",
      endDate: "",
      perPage: "10",
      activeTab: "runs",
      combine: false,
      goalStartDate: localStorage.getItem("goalStartDate") || "",
      goalKilometers: Number(localStorage.getItem("goalKilometers")) || 500,
      weeklyGoalKilometers: Number(localStorage.getItem("weeklyGoalKilometers")) || 38,
      isLoading: false,
      fetchTimeout: null,
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
    sortedTableActivities() {
      const sortKey = this.sortKey;
      const order = this.sortOrder;
      return [...this.tableActivities]
        .sort((a, b) => {
          if (sortKey === "start_date_local") return order * (new Date(b[sortKey]) - new Date(a[sortKey]));
          if (sortKey === "pace") return order * (b.moving_time / 60 / (b.distance / 1000) - a.moving_time / 60 / (a.distance / 1000));
          return order * (b[sortKey] - a[sortKey]);
        })
        .slice(0, parseInt(this.perPage));
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
  },
  methods: {
    sortBy(key) {
      this.sortOrder = this.sortKey === key ? -this.sortOrder : -1;
      this.sortKey = key === "pace" ? "pace" : key;
    },
    async fetchActivities() {
      this.isLoading = true;
      try {
        console.log("Fetching activities from", import.meta.env.VITE_API_URL);
        const params = new URLSearchParams();

        // Fetch from the earliest relevant date (table filter or goal start)
        const fromDates = [];
        if (this.startDate) fromDates.push(new Date(this.startDate));
        if (this.goalStartDate) fromDates.push(new Date(this.goalStartDate));
        if (fromDates.length > 0) {
          const earliest = new Date(Math.min(...fromDates));
          params.append("after", earliest.toISOString().split("T")[0]);
        }

        if (this.endDate) params.append("before", this.endDate);

        // Fetch enough to cover goals when goal start is set
        params.append("per_page", this.goalStartDate ? "200" : this.perPage);

        // When goal start is set, always fetch all types (filtering is client-side)
        if (!this.combine && !this.goalStartDate) params.append("type", this.activeTab === "runs" ? "Run" : "Walk");
        const response = await fetch(`${import.meta.env.VITE_API_URL}?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
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
    scrollToSection(sectionId) {
      console.log("Scrolling to section:", sectionId);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        console.warn(`Section with ID ${sectionId} not found`);
      }
    },
  },
  watch: {
    perPage() {
      this.debouncedFetch();
    },
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
    this.setThisMonth();
  },
};
</script>

