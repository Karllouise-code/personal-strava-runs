<template>
  <section id="recent-activities">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold tracking-tight">Recent Activities</h2>
      <label class="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none min-h-[44px] px-1">
        <input type="checkbox" :checked="combine" @change="$emit('update:combine', $event.target.checked)" class="appearance-none w-4 h-4 rounded border border-zinc-600 bg-transparent checked:bg-accent checked:border-accent focus:outline-none transition-colors cursor-pointer" />
        <span>Combine runs &amp; walks</span>
      </label>
    </div>

    <div class="bg-card border border-zinc-800 rounded-xl overflow-hidden">
      <div class="flex border-b border-zinc-800">
        <button :class="['flex-1 py-3 text-center text-sm font-medium transition-colors relative min-h-[44px]', activeTab === 'runs' ? 'text-accent' : 'text-zinc-400 hover:text-zinc-200']" @click="$emit('update:activeTab', 'runs')">
          Runs
          <span v-if="activeTab === 'runs'" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"></span>
        </button>
        <button :class="['flex-1 py-3 text-center text-sm font-medium transition-colors relative min-h-[44px]', activeTab === 'walks' ? 'text-accent' : 'text-zinc-400 hover:text-zinc-200']" @click="$emit('update:activeTab', 'walks')">
          Walks
          <span v-if="activeTab === 'walks'" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"></span>
        </button>
      </div>

      <div class="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div class="relative flex-1 min-w-[160px]">
          <input :value="searchName" @input="$emit('update:searchName', $event.target.value)" placeholder="Search by name..." class="w-full bg-transparent border-b border-zinc-700 text-[#f5f5f7] placeholder-zinc-600 pb-2 pt-1 text-sm focus:outline-none focus:border-accent transition-colors" />
        </div>
        <div class="relative dp-wrap">
          <VueDatePicker
            :model-value="toDate(startDate)"
            @update:model-value="val => $emit('update:startDate', fmt(val))"
            :min-date="toDate(startDateMin)"
            :max-date="toDate(startDateMax)"
            dark
            auto-apply
            :formats="{ input: 'MMM dd, yyyy' }"
            placeholder="From"
            input-class-name="dp-input"
            :time-config="{ enableTimePicker: false }"
          />
        </div>
        <span class="text-xs text-zinc-600 font-medium hidden sm:inline">—</span>
        <div class="relative dp-wrap">
          <VueDatePicker
            :model-value="toDate(endDate)"
            @update:model-value="val => $emit('update:endDate', fmt(val))"
            :min-date="toDate(endDateMin)"
            :max-date="toDate(endDateMax)"
            dark
            auto-apply
            :formats="{ input: 'MMM dd, yyyy' }"
            placeholder="To"
            input-class-name="dp-input"
            :time-config="{ enableTimePicker: false }"
          />
        </div>
        <button @click="$emit('setThisMonth')" class="text-accent hover:text-accent/80 text-sm font-medium min-h-[44px] px-1 transition-colors">This Month</button>
        <div class="relative w-full sm:w-auto sm:ml-auto">
          <select :value="perPage" @change="$emit('update:perPage', $event.target.value)" class="w-full sm:w-auto appearance-none bg-transparent border-b border-zinc-700 text-[#f5f5f7] pb-2 pt-1 pr-6 text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer">
            <option value="10" class="bg-card">10 per page</option>
            <option value="20" class="bg-card">20 per page</option>
            <option value="50" class="bg-card">50 per page</option>
          </select>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="animate-pulse px-4 py-4 space-y-4">
          <div v-for="i in 5" :key="i" class="flex gap-4 items-center">
            <div class="h-4 w-4 bg-zinc-800 rounded-full" />
            <div class="h-4 w-40 bg-zinc-800 rounded" />
            <div class="h-4 w-16 bg-zinc-800 rounded ml-auto" />
            <div class="h-4 w-16 bg-zinc-800 rounded" />
          </div>
        </div>
      </template>
      <p v-else-if="!activities.length" class="px-4 pb-4 text-sm text-zinc-400">No {{ combine ? "activities" : activeTab === "runs" ? "runs" : "walks" }} match your filters.</p>
      <div v-else class="divide-y divide-zinc-800/50">
        <div v-for="activity in paginatedActivities" :key="activity.id" class="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors min-h-[52px]">
          <span class="w-2 h-2 rounded-full flex-shrink-0" :class="activity.type === 'Run' ? 'bg-accent' : 'bg-zinc-500'"></span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-zinc-200 truncate">{{ activity.name }}</p>
            <p class="text-xs text-zinc-400">{{ formatDate(activity.start_date_local) }}</p>
          </div>
          <div class="text-right flex-shrink-0" v-if="activity.average_heartrate">
            <p class="text-sm font-semibold text-zinc-200">{{ Math.round(activity.average_heartrate) }}</p>
            <p class="text-xs text-zinc-400">bpm</p>
          </div>
          <div class="text-right flex-shrink-0 min-w-[56px]">
            <p class="text-sm font-semibold text-zinc-200">{{ (activity.distance / 1000).toFixed(1) }} km</p>
            <p class="text-xs text-zinc-400">{{ (activity.moving_time / 60 / (activity.distance / 1000)).toFixed(2) }} min/km</p>
          </div>
        </div>
        <div class="flex items-center justify-between px-4 py-3 border-t border-zinc-800 min-h-[44px]">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-zinc-400">Total</span>
            <span class="text-sm font-semibold text-zinc-200">{{ totalKm }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button :disabled="page <= 1" class="text-xs text-zinc-400 hover:text-zinc-200 disabled:text-zinc-700 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors" @click="prevPage">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <span class="text-xs text-zinc-600 font-medium tabular-nums">{{ page }} / {{ totalPages }}</span>
            <button :disabled="page >= totalPages" class="text-xs text-zinc-400 hover:text-zinc-200 disabled:text-zinc-700 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors" @click="nextPage">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    activities: { type: Array, required: true },
    combine: { type: Boolean, required: true },
    activeTab: { type: String, required: true },
    isLoading: { type: Boolean, required: true },
    perPage: { type: String, required: true },
    searchName: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    sortKey: { type: String, required: true },
    sortOrder: { type: Number, required: true },
    startDateMin: { type: String, default: null },
    startDateMax: { type: String, default: null },
    endDateMin: { type: String, default: null },
    endDateMax: { type: String, default: null },
  },
  data() {
    return {
      page: 1,
    };
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.activities.length / parseInt(this.perPage)));
    },
    paginatedActivities() {
      const perPage = parseInt(this.perPage);
      const start = (this.page - 1) * perPage;
      return this.activities.slice(start, start + perPage);
    },
    totalKm() {
      const total = this.activities.reduce((sum, a) => sum + Number(a.distance || 0), 0) / 1000;
      return total.toFixed(1) + " km";
    },
  },
  watch: {
    activities() {
      this.page = 1;
    },
  },
  methods: {
    toDate(str) {
      return str ? new Date(str + "T12:00:00") : null;
    },
    fmt(date) {
      return date ? date.toISOString().split("T")[0] : "";
    },
    prevPage() {
      if (this.page > 1) this.page--;
    },
    nextPage() {
      if (this.page < this.totalPages) this.page++;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
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