<template>
  <div class="bg-dark min-h-screen text-light font-inter">
    <header class="bg-gradient-to-r from-gray-800 to-green-900 text-white text-center py-5 sticky top-0 z-10 shadow-lg">
      <h1 class="text-2xl font-bold animate-fade-in">My Running Journey</h1>
      <p class="mt-2 text-sm">Powered by Strava | Coding Fast, Running Faster! 🏃‍♂️</p>
    </header>

    <main class="max-w-4xl mx-auto p-6">
      <section class="my-6">
        <h2 class="text-2xl font-semibold text-white mb-6">Recent Activities</h2>
        <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl mb-6">
          <!-- Navigation Tabs -->
          <div class="flex border-b border-gray-600 mb-6">
            <button :class="['flex-1 py-3 text-center text-sm font-medium', activeTab === 'runs' ? 'bg-orange-600 text-white' : 'text-teal-400 hover:bg-teal-600/20']" @click="activeTab = 'runs'">Runs 🏃‍♂️</button>
            <button :class="['flex-1 py-3 text-center text-sm font-medium', activeTab === 'walks' ? 'bg-orange-600 text-white' : 'text-teal-400 hover:bg-teal-600/20']" @click="activeTab = 'walks'">Walks 🚶‍♂️</button>
          </div>

          <!-- Filter Controls -->
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

          <!-- Activity Table -->
          <p v-if="!sortedActivities.length" class="text-gray-400">No {{ activeTab === "runs" ? "runs" : "walks" }} match your filters. Try adjusting them!</p>
          <table v-else class="w-full text-left">
            <thead>
              <tr class="border-b border-gray-600">
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('start_date_local')">Date {{ sortKey === "start_date_local" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('distance')">Distance {{ sortKey === "distance" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('moving_time')">Time {{ sortKey === "moving_time" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 cursor-pointer text-orange-500 hover:text-orange-400 transition-all" @click="sortBy('pace')">Pace {{ sortKey === "pace" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
                <th class="py-3 text-orange-500">Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in sortedActivities" :key="activity.id" :class="isPR(activity) ? 'bg-orange-600/20' : ''" class="hover:scale-102 transition-transform duration-200 border-b border-gray-700 last:border-0 text-sm">
                <td class="py-3">{{ formatDate(activity.start_date_local) }}</td>
                <td class="py-3 text-right">{{ (activity.distance / 1000).toFixed(1) }} km</td>
                <td class="py-3 text-right">{{ formatTime(activity.moving_time) }}</td>
                <td class="py-3 text-right">{{ (activity.moving_time / 60 / (activity.distance / 1000)).toFixed(2) }} min/km</td>
                <td class="py-3">{{ activity.type === "Run" ? "🏃‍♂️" : "🚶‍♂️" }} {{ activity.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-10">
        <h2 class="text-2xl font-semibold mb-6 text-white">{{ activeTab === "runs" ? "Run" : "Walk" }} Stats</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-orange-600/20 hover:scale-102 transition-transform">
            <h3 class="text-lg font-medium text-teal-400">Total Distance</h3>
            <p class="text-lg text-white mt-2" v-if="filteredActivities.length"><Counter :end-val="parseFloat(totalDistance)" :duration="2000" :decimals="1" /> km</p>
            <p class="text-lg text-gray-400 mt-2" v-else>Loading...</p>
          </div>
          <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-orange-600/20 hover:scale-102 transition-transform">
            <h3 class="text-lg font-medium text-teal-400">Average Pace</h3>
            <p class="text-lg text-white mt-2"><Counter :end-val="parseFloat(averagePace)" :duration="2000" :decimals="2" /> min/km</p>
          </div>
          <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-orange-600/20 hover:scale-102 transition-transform">
            <h3 class="text-lg font-medium text-teal-400">Longest {{ activeTab === "runs" ? "Run" : "Walk" }}</h3>
            <p class="text-lg text-white mt-2">{{ longestActivity }}</p>
          </div>
        </div>
      </section>

      <section class="my-10">
        <h2 class="text-2xl font-semibold mb-6 text-white">{{ activeTab === "runs" ? "Run" : "Walk" }} Weekly Progress</h2>
        <div class="bg-card bg-opacity-80 backdrop-blur-lg rounded-xl p-6 shadow-xl">
          <WeeklyChart v-if="filteredActivities.length" :runs="filteredActivities" />
          <p v-else class="text-gray-400">No data to display.</p>
        </div>
      </section>

      <div class="bg-card rounded-xl p-6">
        <h3 class="text-lg font-medium text-teal-400">500 km Goal</h3>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
          <div :style="{ width: (totalDistance / 500) * 100 + '%' }" class="bg-orange-600 h-2.5 rounded-full"></div>
        </div>
        <p class="text-white mt-2">{{ totalDistance }} / 500 km</p>
      </div>
    </main>
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
      activeTab: "runs", // Default to Runs tab
    };
  },
  computed: {
    filteredActivities() {
      let filtered = this.activities.filter((activity) => activity.type === (this.activeTab === "runs" ? "Run" : "Walk"));
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
    sortedActivities() {
      const sortKey = this.sortKey;
      const order = this.sortOrder;
      return [...this.filteredActivities].sort((a, b) => {
        if (sortKey === "start_date_local") return order * (new Date(b[sortKey]) - new Date(a[sortKey]));
        if (sortKey === "pace") return order * (b.moving_time / 60 / (b.distance / 1000) - a.moving_time / 60 / (a.distance / 1000));
        return order * (b[sortKey] - a[sortKey]);
      });
    },
    totalDistance() {
      const distance = this.filteredActivities.reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;
      console.log("Total Distance:", distance, "Activities:", this.filteredActivities);
      return distance.toFixed(1);
    },
    averagePace() {
      const totalTime = this.filteredActivities.reduce((sum, activity) => sum + Number(activity.moving_time || 0), 0) / 60;
      const totalDistance = this.filteredActivities.reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;
      const pace = totalDistance ? totalTime / totalDistance : 0;
      console.log("Average Pace:", pace, "Total Time:", totalTime, "Total Distance:", totalDistance);
      return pace.toFixed(2);
    },
    longestActivity() {
      const activity = this.filteredActivities.reduce((max, activity) => (Number(activity.distance || 0) > Number(max.distance || 0) ? activity : max), { distance: 0 });
      return activity.distance ? `${(activity.distance / 1000).toFixed(1)} km on ${this.formatDate(activity.start_date_local)}` : "N/A";
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
      try {
        console.log("Fetching activities from http://localhost:3000/api/activities");
        const params = new URLSearchParams();
        params.append("per_page", this.perPage);
        if (this.startDate) params.append("after", this.startDate);
        if (this.endDate) params.append("before", this.endDate);
        const response = await fetch(`http://localhost:3000/api/activities?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched activities:", data);
        this.activities = data;
      } catch (error) {
        console.error("Error fetching activities:", error.message);
      }
    },
    isPR(activity) {
      const pace = activity.moving_time / 60 / (activity.distance / 1000);
      const paces = this.filteredActivities.map((a) => a.moving_time / 60 / (a.distance / 1000)).filter((p) => !isNaN(p));
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
    activeTab() {
      // No fetch needed, just re-filter activities
    },
  },
  mounted() {
    this.setThisMonth(); // Default to current month
  },
};
</script>

<style scoped>
.font-inter {
  font-family: "Inter", sans-serif;
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
