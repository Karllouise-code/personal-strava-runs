<template>
  <div class="bg-dark min-h-screen text-light font-roboto relative">
    <header class="bg-gradient-to-r from-gray-800 to-green-900 text-white text-center py-5 sticky top-0 z-20 shadow-lg">
      <h1 class="text-2xl font-bold animate-fade-in">My Running Journey</h1>
      <p class="mt-2 text-sm">Powered by Strava | Coding Fast, Running Faster! 🏃‍♂️</p>
    </header>

    <main class="max-w-4xl mx-auto p-6">
      <section class="my-6" id="recent-activities">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-white">Recent Activities</h2>
          <label class="flex items-center text-sm text-teal-400">
            <input type="checkbox" v-model="combineActivities" class="mr-2 focus:ring-orange-600" />
            Combine
          </label>
        </div>
        <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl mb-6">
          <!-- Existing Recent Activities content -->
          <div class="flex border-b border-gray-600 mb-6">
            <button :class="['flex-1 py-3 text-center text-sm font-medium', activeTab === 'runs' ? 'bg-orange-600 text-white' : 'text-teal-400 hover:bg-teal-600/20']" @click="activeTab = 'runs'">Runs 🏃‍♂️</button>
            <button :class="['flex-1 py-3 text-center text-sm font-medium', activeTab === 'walks' ? 'bg-orange-600 text-white' : 'text-teal-400 hover:bg-teal-600/20']" @click="activeTab = 'walks'">Walks 🚶‍♂️</button>
          </div>
          <div class="mb-6 flex flex-col sm:flex-row gap-3 items-center">
            <input v-model="searchName" placeholder="Search by name (e.g., AGILA)" class="bg-dark border-0 border-b-2 border-teal-500 text-light placeholder-gray-500 p-3 rounded focus:border-orange-600 focus:ring-0 transition-all flex-1" />
            <input type="date" v-model="startDate" class="bg-dark border-0 border-b-2 border-teal-500 text-light p-3 rounded focus:border-orange-600 focus:ring-0 transition-all w-full sm:w-auto text-sm" />
            <input type="date" v-model="endDate" class="bg-dark border-0 border-b-2 border-teal-500 text-light p-3 rounded focus:border-orange-600 focus:ring-0 transition-all w-full sm:w-auto text-sm" />
            <select v-model="perPage" class="bg-dark border-0 border-b-2 border-teal-500 text-light p-3 rounded focus:border-orange-600 focus:ring-0 transition-all w-full sm:w-auto text-sm">
              <option value="10">10 Activities</option>
              <option value="20">20 Activities</option>
              <option value="50">50 Activities</option>
            </select>
            <button @click="setThisMonth" class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-500 transition-all text-sm">This Month</button>
          </div>
          <p v-if="!sortedTableActivities.length" class="text-gray-400">No {{ combineActivities ? "activities" : activeTab === "runs" ? "runs" : "walks" }} match your filters. Try adjusting them!</p>
          <table v-else class="w-full text-left">
            <thead>
              <tr class="border-b border-gray-600">
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('start_date_local')">Date {{ sortKey === "start_date_local" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('distance')">Distance {{ sortKey === "distance" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('moving_time')">Time {{ sortKey === "moving_time" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('pace')">Pace {{ sortKey === "pace" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 text-orange-500" v-if="combineActivities">Type</th>
                <th class="py-3 text-orange-500">Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in sortedTableActivities" :key="activity.id" :class="isPR(activity, combineActivities ? null : activeTab === 'runs' ? 'Run' : 'Walk') ? 'bg-orange-600/20' : ''" class="hover:scale-102 transition-transform duration-200 border-b border-gray-700 last:border-0 text-sm">
                <td class="py-3">{{ formatDate(activity.start_date_local) }}</td>
                <td class="py-3 text-right">{{ (activity.distance / 1000).toFixed(1) }} km</td>
                <td class="py-3 text-right">{{ formatTime(activity.moving_time) }}</td>
                <td class="py-3 text-right">{{ (activity.moving_time / 60 / (activity.distance / 1000)).toFixed(2) }} min/km</td>
                <td class="py-3" v-if="combineActivities">{{ activity.type }}</td>
                <td class="py-3">{{ activity.type === "Run" ? "🏃‍♂️" : "🚶‍♂️" }} {{ activity.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-10" id="stats">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-white">{{ combineStats ? "Activity" : activeTab === "runs" ? "Run" : "Walk" }} Stats</h2>
          <label class="flex items-center text-sm text-teal-400">
            <input type="checkbox" v-model="combineStats" class="mr-2 focus:ring-orange-600" />
            Combine
          </label>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-orange-600/20 hover:scale-102 transition-transform">
            <h3 class="text-lg font-medium text-teal-400">Total Distance</h3>
            <p class="text-lg text-white mt-2" v-if="statsActivities.length"><Counter :end-val="parseFloat(totalDistance)" :duration="2000" :decimals="1" /> km</p>
            <p class="text-lg text-gray-400 mt-2" v-else>Loading...</p>
          </div>
          <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-orange-600/20 hover:scale-102 transition-all">
            <h3 class="text-lg font-medium text-teal-400">Average Pace</h3>
            <p class="text-lg text-white mt-2" v-if="statsActivities.length"><Counter :end-val="parseFloat(averagePace)" :duration="2000" :decimals="2" /> min/km</p>
            <p class="text-lg text-gray-400 mt-2" v-else>Loading...</p>
          </div>
          <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-orange-600/20 hover:scale-102 transition-all">
            <h3 class="text-lg font-medium text-teal-400">Longest {{ combineStats ? "Activity" : activeTab === "runs" ? "Run" : "Walk" }}</h3>
            <p class="text-lg text-white mt-2" v-if="statsActivities.length">{{ longestActivity }}</p>
            <p class="text-lg text-gray-400 mt-2" v-else>Loading...</p>
          </div>
        </div>
      </section>

      <section class="my-6" id="weekly-progress">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-white">{{ combineChart ? "Activity" : activeTab === "runs" ? "Run" : "Walk" }} Weekly Progress</h2>
          <label class="flex items-center text-sm text-orange-400">
            <input type="checkbox" v-model="combineChart" class="mr-2 focus:ring-orange-600" />
            Combine
          </label>
        </div>
        <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl">
          <WeeklyChart v-if="chartActivities.length" :runs="chartActivities" />
          <p v-else class="text-gray-400">No data to display.</p>
        </div>
      </section>

      <section class="my-6" id="overall-goals">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-teal-400">{{ goalKilometers }} km Goal</h3>
          <label class="flex items-center text-sm text-orange-400">
            <input type="checkbox" v-model="combineGoals" class="mr-2 focus:ring-0" />
            Combine
          </label>
        </div>
        <div class="bg-card rounded-xl p-6">
          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <div class="flex flex-col">
              <label for="goalStartDate" class="text-sm text-teal-400 mb-1">Start Date</label>
              <input id="goalStartDate" type="date" v-model="goalStartDate" class="bg-dark text-white border-0 border-b-2 border-gray-600 p-2 rounded focus:border-orange-500 focus:ring-0 transition-all w-full sm:w-auto text-sm" />
            </div>
            <div class="flex flex-col">
              <label for="goalKilometers" class="text-sm text-teal-400 mb-1">Goal (km)</label>
              <input id="goalKilometers" type="number" v-model.number="goalKilometers" min="1" step="1" placeholder="500" class="bg-dark text-white border-0 border-b-2 border-gray-600 p-2 rounded focus:border-orange-500 focus:ring-0 transition-all w-full sm:w-auto text-sm" />
            </div>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div :style="{ width: Math.min((goalDistance / goalKilometers) * 100, 100) + '%' }" class="bg-orange-600 h-2.5 rounded-full"></div>
          </div>
          <p class="text-white mt-2">
            {{ goalDistance }} / {{ goalKilometers }} km
            <small class="text-gray-400 text-xs mt-1">({{ ((goalDistance / goalKilometers) * 100).toFixed(1) }}% of goal)</small>
          </p>
          <div v-if="combineGoals">
            <p class="text-gray-400 text-sm mt-1">Run: {{ (goalActivities.filter((activity) => activity.type === "Run").reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000).toFixed(1) }} km</p>
            <p class="text-gray-400 text-sm mt-1">Walk: {{ (goalActivities.filter((activity) => activity.type === "Walk").reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000).toFixed(1) }} km</p>
          </div>
        </div>
      </section>

      <section class="my-6" id="weekly-goals">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-teal-400">{{ weeklyGoalKilometers }} km Weekly Goal</h3>
          <label class="flex items-center text-sm text-orange-400">
            <input type="checkbox" v-model="combineGoals" class="mr-2 focus:ring-0" />
            Combine
          </label>
        </div>
        <div class="bg-card rounded-xl p-6">
          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <div class="flex flex-col">
              <label for="weeklyGoalKilometers" class="text-sm text-teal-400 mb-1">Weekly Goal (km)</label>
              <input id="weeklyGoalKilometers" type="number" v-model.number="weeklyGoalKilometers" min="1" step="1" placeholder="38" class="bg-dark text-white border-0 border-b-2 border-gray-600 p-2 rounded focus:border-orange-500 focus:ring-0 transition-all w-full sm:w-auto text-sm" @input="logWeeklyGoalChange" />
            </div>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div :style="{ width: Math.min((weeklyGoalDistance / weeklyGoalKilometers) * 100, 100) + '%' }" class="bg-orange-600 h-2.5 rounded-full"></div>
          </div>
          <p class="text-white mt-2">
            {{ weeklyGoalDistance }} / {{ weeklyGoalKilometers }} km
            <small class="text-gray-400 text-xs mt-1">({{ ((weeklyGoalDistance / weeklyGoalKilometers) * 100).toFixed(1) }}% of goal, {{ (weeklyGoalKilometers - weeklyGoalDistance).toFixed(1) }} km remaining)</small>
          </p>
          <div v-if="combineGoals">
            <p class="text-gray-400 text-sm mt-1">Run: {{ (weeklyGoalActivities.filter((activity) => activity.type === "Run").reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000).toFixed(1) }} km</p>
            <p class="text-gray-400 text-sm mt-1">Walk: {{ (weeklyGoalActivities.filter((activity) => activity.type === "Walk").reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000).toFixed(1) }} km</p>
          </div>
        </div>
      </section>
    </main>

    <nav class="fixed top-1/2 right-4 transform -translate-y-1/2 bg-card bg-opacity-80 backdrop-blur-lg rounded-lg shadow-xl p-4 z-30 hidden md:block">
      <ul class="space-y-2">
        <li><a href="#recent-activities" @click.prevent="scrollToSection('recent-activities')" class="text-teal-400 hover:text-orange-500 text-sm transition-colors cursor-pointer">Recent Activities</a></li>
        <li><a href="#stats" @click.prevent="scrollToSection('stats')" class="text-teal-400 hover:text-orange-500 text-sm transition-colors cursor-pointer">Stats</a></li>
        <li><a href="#weekly-progress" @click.prevent="scrollToSection('weekly-progress')" class="text-teal-400 hover:text-orange-500 text-sm transition-colors cursor-pointer">Weekly Progress</a></li>
        <li><a href="#overall-goals" @click.prevent="scrollToSection('overall-goals')" class="text-teal-400 hover:text-orange-500 text-sm transition-colors cursor-pointer">Overall Goals</a></li>
        <li><a href="#weekly-goals" @click.prevent="scrollToSection('weekly-goals')" class="text-teal-400 hover:text-orange-500 text-sm transition-colors cursor-pointer">Weekly Goals</a></li>
      </ul>
    </nav>

    <footer class="bg-gray-900 text-gray-400 text-center py-6">
      <p>© 2025 Karl Louise Rito. Built with 🏃‍♂️ and 💻</p>
    </footer>
  </div>
</template>

<script>
import WeeklyChart from "./components/WeeklyChart.vue";
import Counter from "./components/Counter.vue";
import { db } from "./services/firebase.js";

export default {
  components: { WeeklyChart, Counter },
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
      combineActivities: false,
      combineStats: false,
      combineChart: false,
      combineGoals: false,
      goalStartDate: "",
      goalKilometers: 500,
      weeklyGoalKilometers: 38,
      isLoading: false,
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
      if (this.combineActivities) return this.baseFilteredActivities;
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
    statsActivities() {
      if (this.combineStats) return this.baseFilteredActivities;
      return this.baseFilteredActivities.filter((activity) => activity.type === (this.activeTab === "runs" ? "Run" : "Walk"));
    },
    chartActivities() {
      if (this.combineChart) return this.baseFilteredActivities;
      return this.baseFilteredActivities.filter((activity) => activity.type === (this.activeTab === "runs" ? "Run" : "Walk"));
    },
    goalActivities() {
      let filtered = this.baseFilteredActivities;
      if (this.combineGoals) {
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
    totalDistance() {
      const distance = this.statsActivities.reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;
      console.log("Total Distance (Stats):", distance, "Activities:", this.statsActivities);
      return distance.toFixed(1);
    },
    goalDistance() {
      const distance = this.goalActivities.reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;
      console.log("Goal Distance:", distance, "Activities:", this.goalActivities);
      return distance.toFixed(1);
    },
    averagePace() {
      const totalTime = this.statsActivities.reduce((sum, activity) => sum + Number(activity.moving_time || 0), 0) / 60;
      const totalDistance = this.statsActivities.reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;
      const pace = totalDistance ? totalTime / totalDistance : 0;
      console.log("Average Pace:", pace, "Total Time:", totalTime, "Total Distance:", totalDistance);
      return pace.toFixed(2);
    },
    longestActivity() {
      const activity = this.statsActivities.reduce((max, activity) => (Number(activity.distance || 0) > Number(max.distance || 0) ? activity : max), { distance: 0 });
      return activity.distance ? `${(activity.distance / 1000).toFixed(1)} km${this.combineStats ? ` (${activity.type})` : ""} on ${this.formatDate(activity.start_date_local)}` : "N/A";
    },
    weeklyGoalActivities() {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      let filtered = this.baseFilteredActivities.filter((activity) => new Date(activity.start_date_local) >= startOfWeek && new Date(activity.start_date_local) <= endOfWeek);
      if (!this.combineGoals) {
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
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    formatTime(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },
    async fetchActivities() {
      this.isLoading = true;
      try {
        console.log("Fetching activities from", import.meta.env.VITE_API_URL);
        const params = new URLSearchParams();
        params.append("per_page", this.perPage);
        if (this.startDate) params.append("after", this.startDate);
        if (this.endDate) params.append("before", this.endDate);
        if (!this.combineActivities) params.append("type", this.activeTab === "runs" ? "Run" : "Walk");
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
    isPR(activity, type = null) {
      const relevantActivities = type ? this.tableActivities.filter((a) => a.type === type) : this.tableActivities;
      const pace = activity.moving_time / 60 / (activity.distance / 1000);
      const paces = relevantActivities.map((a) => a.moving_time / 60 / (a.distance / 1000)).filter((p) => !isNaN(p));
      const fastest = Math.min(...paces);
      return pace === fastest && !isNaN(pace);
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
    logWeeklyGoalChange(event) {
      console.log("Weekly Goal Changed:", event.target.value, "weeklyGoalKilometers:", this.weeklyGoalKilometers);
    },
  },
  watch: {
    perPage() {
      this.fetchActivities();
    },
    startDate() {
      if (this.startDate && this.endDate) this.fetchActivities();
    },
    endDate() {
      if (this.startDate && this.endDate) this.fetchActivities();
    },
    activeTab(newTab) {
      this.activities = [];
      if (!this.combineActivities) this.fetchActivities();
    },
    combineActivities(newVal) {
      this.activities = [];
      this.fetchActivities();
    },
    combineStats() {},
    combineChart() {},
    combineGoals() {},
    goalStartDate() {},
    goalKilometers() {
      if (this.goalKilometers < 1) this.goalKilometers = 1;
    },
    weeklyGoalKilometers() {
      console.log("Watcher: weeklyGoalKilometers changed to", this.weeklyGoalKilometers);
      if (this.weeklyGoalKilometers < 1) this.weeklyGoalKilometers = 1;
    },
  },
  mounted() {
    this.setThisMonth();
  },
};
</script>

<style scoped>
.font-roboto {
  font-family: "Roboto", sans-serif;
}
.bg-dark {
  background-color: #1a1a1a;
}
.bg-card {
  background-color: #2d2d2d;
}
.text-light {
  color: #e0e0e0;
}
.text-xsm {
  font-size: 0.75rem;
}
.hover\:scale-102:hover {
  transform: scale(1.02);
}
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>
