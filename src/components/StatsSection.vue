<template>
  <section id="stats">
    <div v-if="insightText && !isLoading" class="bg-accent/10 rounded-lg px-4 py-2 mb-4 leading-snug">
      <p class="text-sm text-accent font-medium">{{ insightText }}</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
      <div class="bg-card border border-zinc-800 rounded-xl p-4">
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-zinc-800 rounded" /><div class="h-7 w-20 bg-zinc-800 rounded" /></div>
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-0.5">Avg pace</p>
          <p class="text-2xl font-bold text-white">{{ formattedPace }}</p>
          <p class="text-sm text-zinc-600">/km</p>
        </template>
      </div>
      <div class="bg-card border border-zinc-800 rounded-xl p-4">
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-zinc-800 rounded" /><div class="h-7 w-20 bg-zinc-800 rounded" /></div>
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-0.5">This week</p>
          <p class="text-2xl font-bold text-white">{{ weeklyKm }}</p>
          <p class="text-sm text-zinc-600">km</p>
          <p v-if="kmVsLastWeek !== null" class="text-xs mt-1" :class="kmVsLastWeek > 0 ? 'text-accent' : kmVsLastWeek < 0 ? 'text-warning' : 'text-zinc-500'">{{ kmVsLastWeek > 0 ? '+' : '' }}{{ kmVsLastWeek.toFixed(1) }} vs last week</p>
        </template>
      </div>
      <div class="bg-card border border-zinc-800 rounded-xl p-4">
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-zinc-800 rounded" /><div class="h-7 w-20 bg-zinc-800 rounded" /></div>
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-0.5">Heart rate</p>
          <p class="text-2xl font-bold text-white">{{ avgHeartRate }}</p>
          <p class="text-sm text-zinc-600">bpm</p>
        </template>
      </div>
      <div class="bg-card border border-zinc-800 rounded-xl p-4">
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-16 bg-zinc-800 rounded" /><div class="h-7 w-20 bg-zinc-800 rounded" /></div>
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-0.5">Elevation</p>
          <p class="text-2xl font-bold text-white">{{ totalElevation }}</p>
          <p class="text-sm text-zinc-600">m</p>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 mb-2">
      <div class="bg-card border border-zinc-800 rounded-xl p-4">
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-20 bg-zinc-800 rounded" /><div class="h-7 w-16 bg-zinc-800 rounded" /></div>
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-0.5">This month</p>
          <p class="text-2xl font-bold text-white">{{ monthKm }}</p>
          <p class="text-sm text-zinc-600">km</p>
          <p v-if="monthVsLastMonth" class="text-xs mt-1" :class="monthVsLastMonth > 0 ? 'text-accent' : 'text-warning'">{{ monthVsLastMonth > 0 ? '+' : '' }}{{ monthVsLastMonth }}% vs last month</p>
        </template>
      </div>
      <div class="bg-card border border-zinc-800 rounded-xl p-4">
        <template v-if="isLoading">
          <div class="animate-pulse space-y-2"><div class="h-3 w-20 bg-zinc-800 rounded" /><div class="h-7 w-16 bg-zinc-800 rounded" /></div>
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-0.5">Activities</p>
          <p class="text-2xl font-bold text-white">{{ activities.length }}</p>
          <p class="text-sm text-zinc-600">total</p>
        </template>
      </div>
    </div>

    <div class="bg-card border border-zinc-800 rounded-xl p-6">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm font-medium text-zinc-400">Weekly distance</p>
        <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="weeklyTrend >= 0 ? 'text-accent bg-accent/10' : 'text-warning bg-warning/10'">{{ weeklyTrend >= 0 ? '+' : '' }}{{ weeklyTrend }}%</span>
      </div>
      <template v-if="isLoading">
        <div class="animate-pulse flex items-end gap-3 h-[260px]">
          <div v-for="i in 6" :key="i" class="flex-1 bg-zinc-800 rounded-t-lg" :class="['h-3/4','h-1/2','h-5/6','h-2/3','h-4/5','h-3/5'][i-1]" />
        </div>
      </template>
      <LineChart v-else-if="activities.length" :runs="activities" />
      <p v-else class="text-sm text-zinc-500 text-center py-12">No activity data — adjust filters or log a run to see weekly trends.</p>
    </div>

    <div class="bg-card border border-zinc-800 rounded-xl p-6">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm font-medium text-zinc-400">Pace trend</p>
      </div>
      <template v-if="isLoading">
        <div class="animate-pulse flex items-end gap-3 h-[200px]">
          <div v-for="i in 6" :key="i" class="flex-1 bg-zinc-800 rounded-t-lg" :class="['h-3/4','h-1/2','h-5/6','h-2/3','h-4/5','h-3/5'][i-1]" />
        </div>
      </template>
      <PaceChart v-else-if="activities.length" :runs="activities" />
      <p v-else class="text-sm text-zinc-500 text-center py-12">No activity data yet.</p>
    </div>
  </section>
</template>

<script>
import LineChart from "./LineChart.vue";
import PaceChart from "./PaceChart.vue";

export default {
  components: { LineChart, PaceChart },
  props: {
    activities: { type: Array, required: true },
    combine: { type: Boolean, required: true },
    activeTab: { type: String, required: true },
    isLoading: { type: Boolean, required: true },
    insightText: { type: String, default: null },
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
    kmVsLastWeek() {
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
      if (!lastKm) return null;
      return thisKm - lastKm;
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
    monthKm() {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const km = this.activities.filter((a) => {
        const d = new Date(a.start_date_local); return d >= start && d <= end;
      }).reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      return km.toFixed(1);
    },
    monthVsLastMonth() {
      const now = new Date();
      const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
      const endThis = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLast = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const thisKm = this.activities.filter((a) => {
        const d = new Date(a.start_date_local); return d >= startThis && d <= endThis;
      }).reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      const lastKm = this.activities.filter((a) => {
        const d = new Date(a.start_date_local); return d >= startLast && d <= endLast;
      }).reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      if (!lastKm) return thisKm > 0 ? null : null;
      return Math.round(((thisKm - lastKm) / lastKm) * 100);
    },
  },
};
</script>