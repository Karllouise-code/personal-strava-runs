<template>
  <section id="weekly-goals">
    <h2 class="text-lg font-semibold tracking-tight mb-4">Weekly Goal</h2>
    <div class="bg-card border border-zinc-800 rounded-xl p-6">
      <template v-if="isLoading">
        <div class="animate-pulse space-y-3">
          <div class="h-3 w-32 bg-zinc-800 rounded" />
          <div class="h-9 w-28 bg-zinc-800 rounded" />
          <div class="space-y-2"><div class="h-4 w-full bg-zinc-800 rounded" /><div class="h-1.5 w-full bg-zinc-800 rounded-full" /></div>
        </div>
      </template>
      <template v-else>
      <p class="text-xs text-zinc-400 mb-4">Week of {{ weeklyStartDate }}</p>
      <div class="flex flex-col sm:flex-row gap-4 mb-5">
        <div class="flex flex-col gap-1.5">
          <label for="weeklyGoalKilometers" class="text-xs text-zinc-400">Weekly target</label>
          <div class="relative">
            <span class="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-zinc-600 pointer-events-none">km</span>
            <input id="weeklyGoalKilometers" type="number" :value="weeklyGoalKilometers" @input="$emit('update:weeklyGoalKilometers', Number($event.target.value))" min="1" step="1" placeholder="38" class="w-full sm:w-28 bg-transparent border-b border-zinc-700 text-[#f5f5f7] pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1.5">
          <span class="text-zinc-300 font-medium">{{ weeklyGoalDistance }} / {{ weeklyGoalKilometers }} km</span>
          <span class="text-zinc-400">{{ ((weeklyGoalDistance / weeklyGoalKilometers) * 100).toFixed(1) }}%</span>
        </div>
        <div class="w-full bg-zinc-800 rounded-full h-1.5">
          <div :style="{ width: Math.min((weeklyGoalDistance / weeklyGoalKilometers) * 100, 100) + '%' }" class="bg-accent h-1.5 rounded-full transition-all"></div>
        </div>
      </div>
      <p class="text-xs text-zinc-400 mt-2">{{ (weeklyGoalKilometers - weeklyGoalDistance).toFixed(1) }} km remaining</p>
      <div v-if="combine" class="flex gap-4 text-xs text-zinc-400 mt-2">
        <span>Run: {{ runDistance }}</span>
        <span>Walk: {{ walkDistance }}</span>
      </div>
      </template>
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
    isLoading: { type: Boolean, default: false },
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