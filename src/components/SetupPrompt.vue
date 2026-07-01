<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div class="bg-[#1c1c1e] border border-white/[0.08] rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
      <h2 class="text-2xl font-bold tracking-tight mb-2">Welcome! 👋</h2>
      <p class="text-sm text-[#86868b] mb-6">Set your activity date range to get started. You can always change it later.</p>

      <div class="space-y-5">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#5a5a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            From
          </label>
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a5e] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <input type="date" :value="localStart" @input="onStartChange" :max="maxStartDate" class="w-full bg-white/[0.04] border border-white/[0.07] text-[#f5f5f7] pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/60 focus:bg-white/[0.06] focus:shadow-[0_0_16px_-6px_#fc4c02] transition-all duration-200 [color-scheme:dark]" />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#5a5a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            To
          </label>
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a5e] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <input type="date" :value="localEnd" :min="minEndDate" :max="today" @input="onEndChange" class="w-full bg-white/[0.04] border border-white/[0.07] text-[#f5f5f7] pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/60 focus:bg-white/[0.06] focus:shadow-[0_0_16px_-6px_#fc4c02] transition-all duration-200 [color-scheme:dark]" />
          </div>
        </div>
      </div>

      <p class="text-xs text-[#5a5a5e] mt-4 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Maximum 5-month range to keep things fast.
      </p>

      <div class="flex gap-3 mt-6">
        <button @click="skip" class="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-200">Skip</button>
        <button @click="confirm" class="flex-1 px-5 py-3 rounded-xl text-sm font-medium bg-[#fc4c02] text-white hover:bg-[#e04302] hover:shadow-[0_0_20px_-6px_#fc4c02] active:scale-[0.98] transition-all duration-200">Get Started</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["setup"],
  data() {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    const startStr = start.toISOString().split("T")[0];
    return {
      localStart: startStr,
      localEnd: endStr,
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split("T")[0];
    },
    maxStartDate() {
      const d = new Date(this.localEnd);
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().split("T")[0];
    },
    minEndDate() {
      if (!this.localStart) return null;
      const d = new Date(this.localStart);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    },
  },
  methods: {
    onStartChange(e) {
      const val = e.target.value;
      this.localStart = val;
      const end = new Date(val);
      end.setMonth(end.getMonth() + 5);
      const maxEnd = end.toISOString().split("T")[0];
      if (this.localEnd > maxEnd) this.localEnd = maxEnd;
    },
    onEndChange(e) {
      this.localEnd = e.target.value;
    },
    confirm() {
      this.$emit("setup", { startDate: this.localStart, endDate: this.localEnd });
    },
    skip() {
      this.$emit("setup", null);
    },
  },
};
</script>
