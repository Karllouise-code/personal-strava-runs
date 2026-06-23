<template>
  <section id="stats">
    <h2 class="text-xl font-semibold tracking-tight mb-5">{{ combine ? "Activity" : activeTab === "runs" ? "Run" : "Walk" }} Stats</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
        <p class="text-xs font-medium uppercase tracking-wider text-[#86868b]">Total Distance</p>
        <template v-if="isLoading">
          <div class="animate-pulse mt-2 space-y-2">
            <div class="h-8 w-28 bg-white/[0.08] rounded-lg" />
          </div>
        </template>
        <p class="text-3xl font-semibold tracking-tight text-white mt-2" v-else-if="activities.length"><Counter :end-val="parseFloat(totalDistance)" :duration="2000" :decimals="1" /> <span class="text-lg font-normal text-[#86868b]">km</span></p>
        <p class="text-sm text-[#86868b] mt-2" v-else>—</p>
      </div>
      <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
        <p class="text-xs font-medium uppercase tracking-wider text-[#86868b]">Average Pace</p>
        <template v-if="isLoading">
          <div class="animate-pulse mt-2 space-y-2">
            <div class="h-8 w-24 bg-white/[0.08] rounded-lg" />
          </div>
        </template>
        <p class="text-3xl font-semibold tracking-tight text-white mt-2" v-else-if="activities.length"><Counter :end-val="parseFloat(averagePace)" :duration="2000" :decimals="2" /> <span class="text-lg font-normal text-[#86868b]">min/km</span></p>
        <p class="text-sm text-[#86868b] mt-2" v-else>—</p>
      </div>
      <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
        <p class="text-xs font-medium uppercase tracking-wider text-[#86868b]">Longest {{ combine ? "Activity" : activeTab === "runs" ? "Run" : "Walk" }}</p>
        <template v-if="isLoading">
          <div class="animate-pulse mt-2 space-y-2">
            <div class="h-6 w-44 bg-white/[0.08] rounded-lg" />
          </div>
        </template>
        <p class="text-lg font-semibold tracking-tight text-white mt-2" v-else-if="activities.length">{{ longestActivity }}</p>
        <p class="text-sm text-[#86868b] mt-2" v-else>—</p>
      </div>
    </div>
  </section>
</template>

<script>
import Counter from "./Counter.vue";

export default {
  components: { Counter },
  props: {
    activities: { type: Array, required: true },
    totalDistance: { type: String, required: true },
    averagePace: { type: String, required: true },
    longestActivity: { type: String, required: true },
    combine: { type: Boolean, required: true },
    activeTab: { type: String, required: true },
    isLoading: { type: Boolean, required: true },
  },
};
</script>
