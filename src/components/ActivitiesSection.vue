<template>
  <section id="recent-activities">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-xl font-semibold tracking-tight">Recent Activities</h2>
      <label class="flex items-center gap-2 text-xs text-[#86868b] cursor-pointer select-none">
        <input type="checkbox" :checked="combine" @change="$emit('update:combine', $event.target.checked)" class="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-[#fc4c02] checked:border-[#fc4c02] focus:ring-[#fc4c02] focus:ring-offset-0" />
        Combine runs &amp; walks
      </label>
    </div>

    <div class="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-2xl">
      <div class="flex border-b border-white/[0.06]">
        <button :class="['flex-1 py-3.5 text-center text-sm font-medium tracking-wide transition-colors', activeTab === 'runs' ? 'text-[#fc4c02] border-b-2 border-[#fc4c02] -mb-[1px]' : 'text-[#86868b] hover:text-[#f5f5f7]']" @click="$emit('update:activeTab', 'runs')">Runs 🏃‍♂️</button>
        <button :class="['flex-1 py-3.5 text-center text-sm font-medium tracking-wide transition-colors', activeTab === 'walks' ? 'text-[#fc4c02] border-b-2 border-[#fc4c02] -mb-[1px]' : 'text-[#86868b] hover:text-[#f5f5f7]']" @click="$emit('update:activeTab', 'walks')">Walks 🚶‍♂️</button>
      </div>

      <div class="p-5 flex flex-col sm:flex-row gap-3">
        <input :value="searchName" @input="$emit('update:searchName', $event.target.value)" placeholder="Search by name..." class="flex-1 bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] placeholder-[#86868b] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors" />
        <input type="date" :value="startDate" @input="$emit('update:startDate', $event.target.value)" class="bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors w-full sm:w-auto" />
        <input type="date" :value="endDate" @input="$emit('update:endDate', $event.target.value)" class="bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors w-full sm:w-auto" />
        <select :value="perPage" @change="$emit('update:perPage', $event.target.value)" class="bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors w-full sm:w-auto">
          <option value="10" class="bg-[#1c1c1e]">10</option>
          <option value="20" class="bg-[#1c1c1e]">20</option>
          <option value="50" class="bg-[#1c1c1e]">50</option>
        </select>
        <button @click="$emit('setThisMonth')" class="bg-[#fc4c02] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#e04302] transition-colors">This Month</button>
      </div>

      <template v-if="isLoading">
        <div class="animate-pulse px-5 py-4 space-y-4">
          <div v-for="i in 5" :key="i" class="flex gap-4 items-center">
            <div class="h-4 w-4 bg-white/[0.06] rounded-full" />
            <div class="h-4 w-40 bg-white/[0.06] rounded" />
            <div class="h-4 w-16 bg-white/[0.06] rounded ml-auto" />
            <div class="h-4 w-16 bg-white/[0.06] rounded ml-auto" />
          </div>
        </div>
      </template>
      <p v-else-if="!activities.length" class="px-5 pb-5 text-sm text-[#86868b]">No {{ combine ? "activities" : activeTab === "runs" ? "runs" : "walks" }} match your filters.</p>
      <div v-else class="divide-y divide-white/[0.04]">
        <div v-for="activity in paginatedActivities" :key="activity.id" class="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors" :class="isPR(activity) ? 'bg-[#fc4c02]/10' : ''">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="activity.type === 'Run' ? 'bg-[#fc4c02]' : 'bg-teal-400'"></span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ activity.name }}</p>
            <p class="text-xs text-[#86868b]">{{ formatDate(activity.start_date_local) }}</p>
          </div>
          <div class="text-right flex-shrink-0 min-w-[48px]" v-if="activity.average_heartrate">
            <p class="text-sm font-semibold">{{ Math.round(activity.average_heartrate) }}</p>
            <p class="text-xs text-[#86868b]">bpm</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-sm font-semibold">{{ (activity.distance / 1000).toFixed(1) }} km</p>
            <p class="text-xs text-[#86868b]">{{ (activity.moving_time / 60 / (activity.distance / 1000)).toFixed(2) }} min/km</p>
          </div>
        </div>
        <div class="flex items-center justify-between px-5 py-3 bg-white/[0.02] border-t border-white/[0.04]">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#86868b]"></span>
            <p class="text-xs font-medium uppercase tracking-wider text-[#86868b]">Total</p>
            <p class="text-sm font-semibold text-white ml-2">{{ totalKm }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button :disabled="page <= 1" class="text-xs text-[#86868b] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" @click="prevPage">← Prev</button>
            <span class="text-xs text-[#86868b]">Page {{ page }} of {{ totalPages }}</span>
            <button :disabled="page >= totalPages" class="text-xs text-[#86868b] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" @click="nextPage">Next →</button>
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
    prevPage() {
      if (this.page > 1) this.page--;
    },
    nextPage() {
      if (this.page < this.totalPages) this.page++;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    isPR(activity) {
      const type = this.combine ? null : this.activeTab === "runs" ? "Run" : "Walk";
      const relevant = type ? this.activities.filter((a) => a.type === type) : this.activities;
      const pace = activity.moving_time / 60 / (activity.distance / 1000);
      const paces = relevant.map((a) => a.moving_time / 60 / (a.distance / 1000)).filter((p) => !isNaN(p));
      return pace === Math.min(...paces) && !isNaN(pace);
    },
  },
};
</script>
