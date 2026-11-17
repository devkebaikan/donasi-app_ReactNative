export function getDonationProgress(
  collectedAmount: number,
  goalAmount: number | null,
): number {
  if (goalAmount === null || !Number.isFinite(goalAmount) || goalAmount <= 0) {
    return 100;
  }
  return Math.min(100, (collectedAmount / goalAmount) * 100);
}

export function formatDaysLeftValue(daysLeft: number | null): string {
  if (daysLeft === null || !Number.isFinite(daysLeft)) {
    return '∞';
  }
  return String(Math.max(0, daysLeft));
}

export function formatDaysLeftLabel(daysLeft: number | null): string {
  if (daysLeft === null || !Number.isFinite(daysLeft)) {
    return '∞';
  }
  return `${Math.max(0, daysLeft)}`;
}
