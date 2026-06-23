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
            <div class="h-4 w-24 bg-white/[0.06] rounded" />
            <div class="h-4 w-16 bg-white/[0.06] rounded ml-auto" />
            <div class="h-4 w-16 bg-white/[0.06] rounded ml-auto" />
            <div class="h-4 w-16 bg-white/[0.06] rounded ml-auto" />
            <div class="h-4 w-32 bg-white/[0.06] rounded ml-auto" />
          </div>
        </div>
      </template>
      <p v-else-if="!activities.length" class="px-5 pb-5 text-sm text-[#86868b]">No {{ combine ? "activities" : activeTab === "runs" ? "runs" : "walks" }} match your filters.</p>
      <table v-else class="w-full text-left">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#86868b] cursor-pointer hover:text-[#f5f5f7] transition-colors" @click="$emit('sort', 'start_date_local')">Date {{ sortKey === "start_date_local" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
            <th class="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#86868b] cursor-pointer hover:text-[#f5f5f7] transition-colors" @click="$emit('sort', 'distance')">Distance {{ sortKey === "distance" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
            <th class="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#86868b] cursor-pointer hover:text-[#f5f5f7] transition-colors" @click="$emit('sort', 'moving_time')">Time {{ sortKey === "moving_time" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
            <th class="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#86868b] cursor-pointer hover:text-[#f5f5f7] transition-colors" @click="$emit('sort', 'pace')">Pace {{ sortKey === "pace" ? (sortOrder === -1 ? "↓" : "↑") : "" }}</th>
            <th class="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#86868b]" v-if="combine">Type</th>
            <th class="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#86868b]">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id" :class="[isPR(activity) ? 'bg-[#fc4c02]/10' : 'hover:bg-white/[0.02]', 'transition-colors border-b border-white/[0.04] last:border-0']">
            <td class="px-5 py-3.5 text-sm">{{ formatDate(activity.start_date_local) }}</td>
            <td class="px-5 py-3.5 text-sm text-right">{{ (activity.distance / 1000).toFixed(1) }} km</td>
            <td class="px-5 py-3.5 text-sm text-right">{{ formatTime(activity.moving_time) }}</td>
            <td class="px-5 py-3.5 text-sm text-right">{{ (activity.moving_time / 60 / (activity.distance / 1000)).toFixed(2) }} min/km</td>
            <td class="px-5 py-3.5 text-sm" v-if="combine">{{ activity.type }}</td>
            <td class="px-5 py-3.5 text-sm">{{ activity.type === "Run" ? "🏃‍♂️" : "🚶‍♂️" }} {{ activity.name }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-white/[0.06] bg-white/[0.02]">
            <td class="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#86868b]">Total</td>
            <td class="px-5 py-3.5 text-sm text-right font-semibold text-white">{{ totalKm }}</td>
            <td class="px-5 py-3.5" colspan="4"></td>
          </tr>
        </tfoot>
      </table>
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
  computed: {
    totalKm() {
      const total = this.activities.reduce((sum, a) => sum + Number(a.distance || 0), 0) / 1000;
      return total.toFixed(1) + " km";
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    formatTime(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
