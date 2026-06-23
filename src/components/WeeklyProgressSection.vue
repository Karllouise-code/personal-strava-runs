<template>
  <section id="weekly-progress">
    <h2 class="text-xl font-semibold tracking-tight mb-5">{{ combine ? "Activity" : activeTab === "runs" ? "Run" : "Walk" }} Weekly Progress</h2>
    <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
      <template v-if="isLoading">
        <div class="animate-pulse flex items-end gap-3 h-[300px]">
          <div v-for="i in 6" :key="i" class="flex-1 bg-white/[0.06] rounded-t-lg" :class="['h-' + ['3/4','1/2','5/6','2/3','4/5','3/5'][i-1]]" />
        </div>
      </template>
      <WeeklyChart v-else-if="activities.length" :runs="activities" />
      <p v-else class="text-sm text-[#86868b]">No data to display.</p>
    </div>
  </section>
</template>

<script>
import WeeklyChart from "./WeeklyChart.vue";

export default {
  components: { WeeklyChart },
  props: {
    activities: { type: Array, required: true },
    combine: { type: Boolean, required: true },
    activeTab: { type: String, required: true },
    isLoading: { type: Boolean, required: true },
  },
};
</script>
