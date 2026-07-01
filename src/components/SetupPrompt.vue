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
          <div class="relative dp-wrap">
            <VueDatePicker
              :model-value="toDate(localStart)"
              @update:model-value="onStartChange"
              :max-date="toDate(maxStartDate)"
              dark
              auto-apply
              :formats="{ input: 'MMM dd, yyyy' }"
              placeholder="Select date"
              input-class-name="dp-input"
              :time-config="{ enableTimePicker: false }"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#5a5a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            To
          </label>
          <div class="relative dp-wrap">
            <VueDatePicker
              :model-value="toDate(localEnd)"
              @update:model-value="onEndChange"
              :min-date="toDate(minEndDate)"
              :max-date="toDate(today)"
              dark
              auto-apply
              :formats="{ input: 'MMM dd, yyyy' }"
              placeholder="Select date"
              input-class-name="dp-input"
              :time-config="{ enableTimePicker: false }"
            />
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
    toDate(str) {
      return str ? new Date(str + "T12:00:00") : null;
    },
    fmt(date) {
      return date ? date.toISOString().split("T")[0] : "";
    },
    onStartChange(val) {
      const str = this.fmt(val);
      this.localStart = str;
      const end = new Date(str);
      end.setMonth(end.getMonth() + 5);
      const maxEnd = end.toISOString().split("T")[0];
      if (this.localEnd > maxEnd) this.localEnd = maxEnd;
    },
    onEndChange(val) {
      this.localEnd = this.fmt(val);
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

<style>
.dp-wrap .dp-input {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  color: #f5f5f7 !important;
  padding: 14px 16px !important;
  border-radius: 12px !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  min-height: 48px;
  width: 100%;
  transition: all 0.2s ease !important;
}
.dp-wrap .dp-input:focus {
  border-color: rgba(252, 76, 2, 0.6) !important;
  background: rgba(255,255,255,0.06) !important;
  box-shadow: 0 0 16px -6px #fc4c02 !important;
  outline: none !important;
}
.dp-wrap .dp-input::placeholder {
  color: #5a5a5e !important;
}
.dp-wrap .dp__input_icon {
  color: #5a5a5e !important;
}
.dp-wrap .dp__input_icon_pad {
  padding-left: 40px !important;
}
</style>
