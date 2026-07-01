import { describe, it, expect, vi, beforeEach } from "vitest";
import OverallGoalSection from "./OverallGoalSection.vue";

vi.mock("@vuepic/vue-datepicker", () => ({
  default: { template: "<input />" },
}));

const baseProps = {
  goalStartDate: "2026-01-01",
  goalEndDate: "",
  goalKilometers: 500,
  goalDistance: "123.4",
  goalActivities: [
    { distance: 5000, moving_time: 1800, type: "Run", start_date_local: "2026-01-05T10:00:00Z" },
    { distance: 10000, moving_time: 3600, type: "Run", start_date_local: "2026-01-12T10:00:00Z" },
  ],
  combine: false,
  isLoading: false,
};

describe("OverallGoalSection", () => {
  it("computes trackStatus as 'Reached' when goal distance meets target", () => {
    const props = {
      ...baseProps,
      goalDistance: "500.0",
      goalKilometers: 500,
    };
    const status = OverallGoalSection.computed.trackStatus.call(props);
    expect(status.label).toBe("Reached");
  });

  it("computes requiredPace with end date", () => {
    const props = {
      ...baseProps,
      goalEndDate: "2026-06-30",
      goalKilometers: 500,
    };
    const pace = OverallGoalSection.computed.requiredPace.call(props);
    expect(pace).not.toBeNull();
    expect(pace.weekly).toBeTruthy();
    expect(pace.deadline).toContain("Jun 30, 2026");
  });

  it("requiredPace returns null when goal is already reached", () => {
    const props = {
      ...baseProps,
      goalActivities: [
        { distance: 300000, moving_time: 3600, type: "Run", start_date_local: "2026-01-05T10:00:00Z" },
        { distance: 200000, moving_time: 1800, type: "Run", start_date_local: "2026-01-12T10:00:00Z" },
      ],
      goalKilometers: 500,
    };
    const pace = OverallGoalSection.computed.requiredPace.call(props);
    expect(pace).toBeNull();
  });

  it("requiredPace sets high flag when weekly > 30", () => {
    const props = {
      ...baseProps,
      goalStartDate: "2026-01-01",
      goalEndDate: "2026-01-31",
      goalKilometers: 500,
      goalDistance: "10.0",
    };
    const pace = OverallGoalSection.computed.requiredPace.call(props);
    expect(pace.high).toBe(true);
  });
});
