import { RecurrenceRule } from "@/types";

/**
 * Describe a recurrence rule in human-readable format.
 */
export function describeRecurrence(rule: RecurrenceRule): string {
  if (!rule.frequency) return "";

  const freqMap: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  let desc = freqMap[rule.frequency] || rule.frequency;
  desc += ` every ${rule.interval}`;

  if (rule.interval > 1) {
    desc = desc.replace(/ly$/, "s"); // Daily -> Days, Weekly -> Weeks, etc.
  }

  if (rule.frequency === "weekly" && rule.days_of_week && rule.days_of_week.length > 0) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNames = rule.days_of_week.map(d => days[d]).join(", ");
    desc += ` on ${dayNames}`;
  } else if (rule.frequency === "monthly" && rule.day_of_month) {
    desc += ` on day ${rule.day_of_month}`;
  }

  if (rule.end_date) {
    desc += ` until ${new Date(rule.end_date).toLocaleDateString()}`;
  } else if (rule.end_count) {
    desc += ` for ${rule.end_count} occurrences`;
  }

  return desc;
}
