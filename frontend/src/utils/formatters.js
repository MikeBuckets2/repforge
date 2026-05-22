export const goalTypes = [
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'MUSCLE_GAIN', label: 'Muscle gain' },
  { value: 'FAT_LOSS', label: 'Fat loss' },
  { value: 'RUNNING_ENDURANCE', label: 'Running endurance' },
  { value: 'GENERAL_HEALTH', label: 'General health' }
];

export const exerciseCategories = [
  { value: '', label: 'All categories' },
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'MOBILITY', label: 'Mobility' },
  { value: 'RECOVERY', label: 'Recovery' }
];

export const trainingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const labelize = (value = '') =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
};

export const formatShortDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
};

export const formatNumber = (value, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(Number(value || 0));

export const goalProgress = (goal) => {
  if (!goal?.targetValue) return 0;
  if (goal.type === 'FAT_LOSS' || goal.unit === 'minutes') {
    return Math.min(Math.round((Number(goal.targetValue) / Math.max(Number(goal.currentValue || 1), 1)) * 100), 100);
  }
  return Math.min(Math.round((Number(goal.currentValue || 0) / Number(goal.targetValue)) * 100), 100);
};
