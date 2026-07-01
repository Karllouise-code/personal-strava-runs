<template>
  <section id="overall-goals">
    <h2 class="text-lg font-semibold tracking-tight mb-4">Overall Goal</h2>
    <div class="bg-card border border-zinc-800 rounded-xl p-6">
      <template v-if="isLoading">
        <div class="animate-pulse space-y-4">
          <div class="flex gap-4">
            <div class="flex-1 space-y-2"><div class="h-3 w-16 bg-zinc-800 rounded" /><div class="h-9 bg-zinc-800 rounded" /></div>
            <div class="flex-1 space-y-2"><div class="h-3 w-16 bg-zinc-800 rounded" /><div class="h-9 bg-zinc-800 rounded" /></div>
            <div class="flex-1 space-y-2"><div class="h-3 w-16 bg-zinc-800 rounded" /><div class="h-9 bg-zinc-800 rounded" /></div>
          </div>
          <div class="space-y-2"><div class="h-4 w-full bg-zinc-800 rounded" /><div class="h-1.5 w-full bg-zinc-800 rounded-full" /></div>
        </div>
      </template>
      <template v-else-if="!goalActivities.length && !goalStartDate">
        <p class="text-sm text-zinc-400">Set a start date, end date, and distance goal to track your overall progress.</p>
        <div class="flex flex-col sm:flex-row gap-4 mt-4">
          <div class="flex flex-col gap-1.5 flex-1">
            <label for="goalStartDate" class="text-xs text-zinc-400">Start date</label>
            <div class="relative dp-wrap">
              <VueDatePicker
                :model-value="goalStartDate ? new Date(goalStartDate + 'T12:00:00') : null"
                @update:model-value="val => $emit('update:goalStartDate', val ? val.toISOString().split('T')[0] : '')"
                dark auto-apply :formats="{ input: 'MMM dd, yyyy' }" placeholder="Select date"
                input-class-name="dp-input" :time-config="{ enableTimePicker: false }"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1.5 flex-1">
            <label for="goalEndDate" class="text-xs text-zinc-400">End date</label>
            <div class="relative dp-wrap">
              <VueDatePicker
                :model-value="goalEndDate ? new Date(goalEndDate + 'T12:00:00') : null"
                @update:model-value="val => $emit('update:goalEndDate', val ? val.toISOString().split('T')[0] : '')"
                dark auto-apply :formats="{ input: 'MMM dd, yyyy' }" placeholder="Optional"
                input-class-name="dp-input" :time-config="{ enableTimePicker: false }"
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
      </template>
      <template v-else>
        <div class="flex flex-col sm:flex-row gap-4 mb-5">
          <div class="flex flex-col gap-1.5 flex-1">
            <label for="goalStartDate" class="text-xs text-zinc-400">Start date</label>
            <div class="relative dp-wrap">
              <VueDatePicker
                :model-value="goalStartDate ? new Date(goalStartDate + 'T12:00:00') : null"
                @update:model-value="val => $emit('update:goalStartDate', val ? val.toISOString().split('T')[0] : '')"
                dark auto-apply :formats="{ input: 'MMM dd, yyyy' }" placeholder="Select date"
                input-class-name="dp-input" :time-config="{ enableTimePicker: false }"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1.5 flex-1">
            <label for="goalEndDate" class="text-xs text-zinc-400">End date</label>
            <div class="relative dp-wrap">
              <VueDatePicker
                :model-value="goalEndDate ? new Date(goalEndDate + 'T12:00:00') : null"
                @update:model-value="val => $emit('update:goalEndDate', val ? val.toISOString().split('T')[0] : '')"
                dark auto-apply :formats="{ input: 'MMM dd, yyyy' }" placeholder="Optional"
                input-class-name="dp-input" :time-config="{ enableTimePicker: false }"
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
          <div class="flex items-center justify-between text-sm mb-1.5">
            <span class="text-zinc-300 font-medium">{{ goalDistance }} / {{ goalKilometers }} km</span>
            <span class="flex items-center gap-2">
              <span v-if="trackStatus" class="text-xs font-medium px-2 py-0.5 rounded-full" :class="trackStatus.colorClass">{{ trackStatus.label }}</span>
              <span class="text-zinc-400">{{ ((goalDistance / goalKilometers) * 100).toFixed(1) }}%</span>
            </span>
          </div>
          <div class="w-full bg-zinc-800 rounded-full h-1.5">
            <div :style="{ width: Math.min((goalDistance / goalKilometers) * 100, 100) + '%' }" class="bg-accent h-1.5 rounded-full transition-all"></div>
          </div>
        </div>
        <div v-if="combine" class="flex gap-4 text-xs text-zinc-400">
          <span>Run: {{ runDistance }}</span>
          <span>Walk: {{ walkDistance }}</span>
        </div>
        <div v-if="requiredPace" class="mt-3 pt-3 border-t border-zinc-800 text-xs flex items-start gap-1.5">
          <svg class="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <div class="space-y-0.5 leading-tight">
            <div class="text-zinc-400">
              <span class="text-zinc-500">Required pace: </span>
              <span class="text-accent font-medium">{{ requiredPace.weekly }} km/week</span>
              <span v-if="requiredPace.high" title="More than 30 km/week required" class="ml-2 text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">High required pace</span>
            </div>
            <div class="text-zinc-600">
              <span v-if="requiredPace.daily">{{ requiredPace.daily }} km/day &middot; </span>
              <span>finish by </span>
              <span class="text-zinc-500 font-medium">{{ requiredPace.deadline }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    goalStartDate: { type: String, required: true },
    goalEndDate: { type: String, required: true },
    goalKilometers: { type: Number, required: true },
    goalDistance: { type: String, required: true },
    goalActivities: { type: Array, required: true },
    combine: { type: Boolean, required: true },
    isLoading: { type: Boolean, default: false },
  },
  computed: {
    runDistance() {
      return (this.goalActivities.filter((a) => a.type === "Run").reduce((s, a) => s + Number(a.distance || 0), 0) / 1000).toFixed(1) + " km"
    },
    walkDistance() {
      return (this.goalActivities.filter((a) => a.type === "Walk").reduce((s, a) => s + Number(a.distance || 0), 0) / 1000).toFixed(1) + " km"
    },
    requiredPace() {
      const activities = this.goalActivities;
      if (!activities.length || !this.goalStartDate) return null;
      const totalKm = activities.reduce((s, a) => s + Number(a.distance || 0), 0) / 1000;
      const remaining = this.goalKilometers - totalKm;
      if (remaining <= 0) return null;
      const now = new Date();
      let deadline;
      if (this.goalEndDate) {
        deadline = new Date(this.goalEndDate + 'T12:00:00');
      } else {
        const start = new Date(this.goalStartDate);
        deadline = new Date(start);
        deadline.setFullYear(deadline.getFullYear() + 1);
      }
      const remainingDays = Math.max(1, (deadline - now) / 86400000);
      if (remainingDays <= 0) return null;
      const requiredKmPerDay = remaining / remainingDays;
      const weekly = (requiredKmPerDay * 7).toFixed(1);
      const daily = requiredKmPerDay >= 0.1 ? requiredKmPerDay.toFixed(1) : null;
      const high = Number(weekly) > 30;
      const deadlineStr = deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return { weekly, daily, deadline: deadlineStr, high };
    },
    trackStatus() {
      const activities = this.goalActivities;
      if (!activities.length || !this.goalStartDate) return null;
      const totalKm = Number(this.goalDistance);
      if (totalKm >= this.goalKilometers) return { label: 'Reached', colorClass: 'text-accent bg-accent/10' };
      const start = new Date(this.goalStartDate);
      const deadline = this.goalEndDate ? new Date(this.goalEndDate + 'T12:00:00') : new Date(start);
      if (!this.goalEndDate) deadline.setFullYear(deadline.getFullYear() + 1);
      const now = new Date();
      const daysElapsed = Math.max(1, (now - start) / 86400000);
      const totalDays = (deadline - start) / 86400000;
      const expectedPct = Math.min(100, (daysElapsed / totalDays) * 100);
      const actualPct = (totalKm / this.goalKilometers) * 100;
      const diff = actualPct - expectedPct;
      if (diff > 10) return { label: 'Ahead', colorClass: 'text-accent bg-accent/10' };
      if (diff > -10) return { label: 'On track', colorClass: 'text-accent bg-accent/10' };
      return { label: 'Behind', colorClass: 'text-warning bg-warning/10' };
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