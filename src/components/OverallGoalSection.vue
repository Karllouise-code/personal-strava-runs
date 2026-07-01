<template>
  <section id="overall-goals">
    <h2 class="text-lg font-semibold tracking-tight mb-4">Overall Goal</h2>
    <div class="bg-card border border-zinc-800 rounded-xl p-6">
      <div class="flex flex-col sm:flex-row gap-4 mb-5">
        <div class="flex flex-col gap-1.5 flex-1">
          <label for="goalStartDate" class="text-xs text-zinc-400">Start date</label>
          <div class="relative dp-wrap">
            <VueDatePicker
              :model-value="goalStartDate ? new Date(goalStartDate + 'T12:00:00') : null"
              @update:model-value="val => $emit('update:goalStartDate', val ? val.toISOString().split('T')[0] : '')"
              dark
              auto-apply
              :formats="{ input: 'MMM dd, yyyy' }"
              placeholder="Select date"
              input-class-name="dp-input"
              :time-config="{ enableTimePicker: false }"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5 flex-1">
          <label for="goalKilometers" class="text-xs text-zinc-400">Distance goal</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600 pointer-events-none">km</span>
            <input id="goalKilometers" type="number" :value="goalKilometers" @input="$emit('update:goalKilometers', Number($event.target.value))" min="1" step="1" placeholder="500" class="w-full bg-transparent border-b border-zinc-700 text-[#f5f5f7] pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1.5">
          <span class="text-zinc-300 font-medium">{{ goalDistance }} / {{ goalKilometers }} km</span>
          <span class="text-zinc-400">{{ ((goalDistance / goalKilometers) * 100).toFixed(1) }}%</span>
        </div>
        <div class="w-full bg-zinc-800 rounded-full h-1.5">
          <div :style="{ width: Math.min((goalDistance / goalKilometers) * 100, 100) + '%' }" class="bg-accent h-1.5 rounded-full transition-all"></div>
        </div>
      </div>
      <div v-if="combine" class="flex gap-4 text-xs text-zinc-400">
        <span>Run: {{ runDistance }}</span>
        <span>Walk: {{ walkDistance }}</span>
      </div>
      <div v-if="projection" class="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        Consistent pace &rarr; goal by <span class="text-zinc-300 font-medium">{{ projection }}</span>
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
    projection() {
      const activities = this.goalActivities;
      if (!activities.length || !this.goalStartDate) return null;

      const totalKm = activities.reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      const remaining = this.goalKilometers - totalKm;
      if (remaining <= 0) return null;

      const start = new Date(this.goalStartDate);
      const now = new Date();
      const daysElapsed = Math.max(1, (now - start) / 86400000);
      const avgKmPerDay = totalKm / daysElapsed;
      if (avgKmPerDay <= 0) return null;

      const daysRemaining = remaining / avgKmPerDay;
      const projected = new Date(now.getTime() + daysRemaining * 86400000);
      return projected.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    },
  },
};
</script>

<style>
.dp-wrap .dp-input {
  background: transparent !important;
  border-bottom: 1px solid #3f3f46 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-radius: 0 !important;
  color: #f5f5f7 !important;
  padding: 8px 12px 8px 0 !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  min-height: 38px;
  width: 100%;
  transition: border-color 0.2s ease !important;
}
.dp-wrap .dp-input:focus {
  border-color: #2dd4bf !important;
  box-shadow: none !important;
  outline: none !important;
}
.dp-wrap .dp-input::placeholder {
  color: #52525b !important;
}
.dp-wrap .dp__input_icon {
  color: #52525b !important;
}
.dp-wrap .dp__input_icon_pad {
  padding-left: 0 !important;
}
</style>