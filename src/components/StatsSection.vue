<template>
  <section id="stats">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2 text-xs text-[#86868b] uppercase tracking-wider">
        <span class="text-white font-semibold">Dashboard</span>
        <span>/</span>
        <span>Overview</span>
      </div>
      <span class="text-xs text-[#00e5ff] font-semibold uppercase tracking-wider">Live</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div class="relative bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-4 shadow-2xl overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400 rounded-l-2xl" />
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-white/[0.08] rounded" /><div class="h-7 w-20 bg-white/[0.08] rounded" /><div class="h-3 w-10 bg-white/[0.08] rounded" /></div>
        </template>
        <template v-else>
          <p class="text-xs text-[#86868b] uppercase tracking-wider">avg pace</p>
          <p class="text-2xl font-bold tracking-tight mt-1 text-white">{{ formattedPace }}</p>
          <p class="text-xs text-[#86868b]">/km</p>
        </template>
      </div>
      <div class="relative bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-4 shadow-2xl overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500 rounded-l-2xl" />
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-white/[0.08] rounded" /><div class="h-7 w-20 bg-white/[0.08] rounded" /><div class="h-3 w-10 bg-white/[0.08] rounded" /></div>
        </template>
        <template v-else>
          <p class="text-xs text-[#86868b] uppercase tracking-wider">this week</p>
          <p class="text-2xl font-bold tracking-tight mt-1 text-white">{{ weeklyKm }}</p>
          <p class="text-xs text-[#86868b]">km</p>
        </template>
      </div>
      <div class="relative bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-4 shadow-2xl overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-red-400 rounded-l-2xl" />
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-white/[0.08] rounded" /><div class="h-7 w-20 bg-white/[0.08] rounded" /><div class="h-3 w-10 bg-white/[0.08] rounded" /></div>
        </template>
        <template v-else>
          <p class="text-xs text-[#86868b] uppercase tracking-wider">heart rate</p>
          <p class="text-2xl font-bold tracking-tight mt-1 text-white">{{ avgHeartRate }}</p>
          <p class="text-xs text-[#86868b]">avg bpm</p>
        </template>
      </div>
      <div class="relative bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-4 shadow-2xl overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-400 rounded-l-2xl" />
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-white/[0.08] rounded" /><div class="h-7 w-20 bg-white/[0.08] rounded" /><div class="h-3 w-10 bg-white/[0.08] rounded" /></div>
        </template>
        <template v-else>
          <p class="text-xs text-[#86868b] uppercase tracking-wider">elevation</p>
          <p class="text-2xl font-bold tracking-tight mt-1 text-white">{{ totalElevation }}</p>
          <p class="text-xs text-[#86868b]">m</p>
        </template>
      </div>
    </div>

    <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl mb-6">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs text-[#86868b] uppercase tracking-wider">weekly distance</p>
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="weeklyTrend >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'">{{ weeklyTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(weeklyTrend) }}%</span>
      </div>
      <template v-if="isLoading">
        <div class="animate-pulse flex items-end gap-3 h-[200px]">
          <div v-for="i in 6" :key="i" class="flex-1 bg-white/[0.06] rounded-t-lg" :class="['h-3/4','h-1/2','h-5/6','h-2/3','h-4/5','h-3/5'][i-1]" />
        </div>
      </template>
      <LineChart v-else-if="activities.length" :runs="activities" />
      <p v-else class="text-sm text-[#86868b] text-center py-8">No data to display.</p>
    </div>
  </section>
</template>

<script>
import LineChart from "./LineChart.vue";

export default {
  components: { LineChart },
  props: {
    activities: { type: Array, required: true },
    combine: { type: Boolean, required: true },
    activeTab: { type: String, required: true },
    isLoading: { type: Boolean, required: true },
  },
  computed: {
    formattedPace() {
      const totalTime = this.activities.reduce((sum, a) => sum + Number(a.moving_time || 0), 0) / 60;
      const totalDist = this.activities.reduce((sum, a) => sum + Number(a.distance || 0), 0) / 1000;
      if (!totalDist) return "—";
      const paceMin = totalTime / totalDist;
      const mins = Math.floor(paceMin);
      const secs = Math.round((paceMin - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
    weeklyKm() {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const weekly = this.activities.filter((a) => {
        const d = new Date(a.start_date_local);
        return d >= startOfWeek && d <= endOfWeek;
      });
      const km = weekly.reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      return km.toFixed(1);
    },
    weeklyTrend() {
      const now = new Date();
      const startThisWeek = new Date(now);
      startThisWeek.setDate(now.getDate() - now.getDay());
      startThisWeek.setHours(0, 0, 0, 0);
      const endThisWeek = new Date(startThisWeek);
      endThisWeek.setDate(startThisWeek.getDate() + 6);
      endThisWeek.setHours(23, 59, 59, 999);
      const startLastWeek = new Date(startThisWeek);
      startLastWeek.setDate(startThisWeek.getDate() - 7);
      const endLastWeek = new Date(startLastWeek);
      endLastWeek.setDate(startLastWeek.getDate() + 6);
      endLastWeek.setHours(23, 59, 59, 999);
      const thisKm = this.activities.filter((a) => {
        const d = new Date(a.start_date_local); return d >= startThisWeek && d <= endThisWeek;
      }).reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      const lastKm = this.activities.filter((a) => {
        const d = new Date(a.start_date_local); return d >= startLastWeek && d <= endLastWeek;
      }).reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      if (!lastKm) return thisKm > 0 ? 100 : 0;
      return Math.round(((thisKm - lastKm) / lastKm) * 100);
    },
    avgHeartRate() {
      const hrs = this.activities.map((a) => Number(a.average_heartrate)).filter((h) => h > 0);
      if (!hrs.length) return "—";
      return Math.round(hrs.reduce((s, h) => s + h, 0) / hrs.length);
    },
    totalElevation() {
      const elev = this.activities.reduce((s, a) => s + Number(a.total_elevation_gain || 0), 0);
      return Math.round(elev);
    },
  },
};
</script>
