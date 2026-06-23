<template>
  <section id="overall-goals">
    <h2 class="text-xl font-semibold tracking-tight mb-5">Overall Goal</h2>
    <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
      <div class="flex flex-col sm:flex-row gap-4 mb-5">
        <div class="flex flex-col gap-1.5">
          <label for="goalStartDate" class="text-xs font-medium uppercase tracking-wider text-[#86868b]">Start Date</label>
          <input id="goalStartDate" type="date" :value="goalStartDate" @input="$emit('update:goalStartDate', $event.target.value)" class="bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="goalKilometers" class="text-xs font-medium uppercase tracking-wider text-[#86868b]">Distance Goal</label>
          <input id="goalKilometers" type="number" :value="goalKilometers" @input="$emit('update:goalKilometers', Number($event.target.value))" min="1" step="1" placeholder="500" class="bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors w-full sm:w-32" />
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
