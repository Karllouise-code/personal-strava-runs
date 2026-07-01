<template>
  <section id="weekly-goals">
    <h2 class="text-xl font-semibold tracking-tight mb-5">Weekly Goal</h2>
    <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
      <p class="text-xs text-[#86868b] mb-4">Week of {{ weeklyStartDate }}</p>
      <div class="flex flex-col sm:flex-row gap-4 mb-5">
        <div class="flex flex-col gap-1.5">
          <label for="weeklyGoalKilometers" class="text-xs font-medium uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#5a5a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Weekly Target
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5a5a5e] pointer-events-none font-medium">km</span>
            <input id="weeklyGoalKilometers" type="number" :value="weeklyGoalKilometers" @input="$emit('update:weeklyGoalKilometers', Number($event.target.value))" min="1" step="1" placeholder="38" class="w-full sm:w-32 bg-white/[0.04] border border-white/[0.07] text-[#f5f5f7] pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/60 focus:bg-white/[0.06] focus:shadow-[0_0_12px_-4px_#fc4c02] transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1.5">
          <span class="text-[#f5f5f7] font-medium">{{ weeklyGoalDistance }} / {{ weeklyGoalKilometers }} km</span>
          <span class="text-[#86868b]">{{ ((weeklyGoalDistance / weeklyGoalKilometers) * 100).toFixed(1) }}%</span>
        </div>
        <div class="w-full bg-white/[0.06] rounded-full h-2">
          <div :style="{ width: Math.min((weeklyGoalDistance / weeklyGoalKilometers) * 100, 100) + '%' }" class="bg-[#fc4c02] h-2 rounded-full transition-all"></div>
        </div>
      </div>
      <p class="text-xs text-[#86868b] mt-2">{{ (weeklyGoalKilometers - weeklyGoalDistance).toFixed(1) }} km remaining</p>
      <div v-if="combine" class="flex gap-4 text-xs text-[#86868b] mt-2">
        <span>🏃‍♂️ Run: {{ runDistance }}</span>
        <span>🚶‍♂️ Walk: {{ walkDistance }}</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    weeklyGoalKilometers: { type: Number, required: true },
    weeklyGoalDistance: { type: String, required: true },
    weeklyGoalActivities: { type: Array, required: true },
    weeklyStartDate: { type: String, required: true },
    combine: { type: Boolean, required: true },
  },
  computed: {
    runDistance() {
      return (this.weeklyGoalActivities.filter((a) => a.type === "Run").reduce((s, a) => s + Number(a.distance || 0), 0) / 1000).toFixed(1) + " km"
    },
    walkDistance() {
      return (this.weeklyGoalActivities.filter((a) => a.type === "Walk").reduce((s, a) => s + Number(a.distance || 0), 0) / 1000).toFixed(1) + " km"
    },
  },
};
</script>
