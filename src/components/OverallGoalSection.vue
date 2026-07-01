<template>
  <section id="overall-goals">
    <h2 class="text-xl font-semibold tracking-tight mb-5">Overall Goal</h2>
    <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
      <div class="flex flex-col sm:flex-row gap-4 mb-5">
        <div class="flex flex-col gap-1.5 flex-1">
          <label for="goalStartDate" class="text-xs font-medium uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#5a5a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Start Date
          </label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a5e] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <input id="goalStartDate" type="date" :value="goalStartDate" @input="$emit('update:goalStartDate', $event.target.value)" class="w-full bg-white/[0.04] border border-white/[0.07] text-[#f5f5f7] pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/60 focus:bg-white/[0.06] focus:shadow-[0_0_12px_-4px_#fc4c02] transition-all duration-200 [color-scheme:dark]" />
          </div>
        </div>
        <div class="flex flex-col gap-1.5 flex-1">
          <label for="goalKilometers" class="text-xs font-medium uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#5a5a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            Distance Goal
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5a5a5e] pointer-events-none font-medium">km</span>
            <input id="goalKilometers" type="number" :value="goalKilometers" @input="$emit('update:goalKilometers', Number($event.target.value))" min="1" step="1" placeholder="500" class="w-full bg-white/[0.04] border border-white/[0.07] text-[#f5f5f7] pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/60 focus:bg-white/[0.06] focus:shadow-[0_0_12px_-4px_#fc4c02] transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1.5">
          <span class="text-[#f5f5f7] font-medium">{{ goalDistance }} / {{ goalKilometers }} km</span>
          <span class="text-[#86868b]">{{ ((goalDistance / goalKilometers) * 100).toFixed(1) }}%</span>
        </div>
        <div class="w-full bg-white/[0.06] rounded-full h-2">
          <div :style="{ width: Math.min((goalDistance / goalKilometers) * 100, 100) + '%' }" class="bg-[#fc4c02] h-2 rounded-full transition-all"></div>
        </div>
      </div>
      <div v-if="combine" class="flex gap-4 text-xs text-[#86868b]">
        <span>🏃‍♂️ Run: {{ runDistance }}</span>
        <span>🚶‍♂️ Walk: {{ walkDistance }}</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    goalStartDate: { type: String, required: true },
    goalKilometers: { type: Number, required: true },
    goalDistance: { type: String, required: true },
    goalActivities: { type: Array, required: true },
    combine: { type: Boolean, required: true },
  },
  computed: {
    runDistance() {
      return (this.goalActivities.filter((a) => a.type === "Run").reduce((s, a) => s + Number(a.distance || 0), 0) / 1000).toFixed(1) + " km"
    },
    walkDistance() {
      return (this.goalActivities.filter((a) => a.type === "Walk").reduce((s, a) => s + Number(a.distance || 0), 0) / 1000).toFixed(1) + " km"
    },
  },
};
</script>
