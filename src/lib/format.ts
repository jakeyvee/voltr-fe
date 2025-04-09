// Function to format number to K, M, B
export const formatNumber = (num: number | null) => {
  if (!num) return "-";
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  if (num >= 1000) return (num / 1000).toFixed(2) + "K";
  if (num >= 1) return num.toFixed(2);
  return num.toPrecision(3);
};

// Function to format time
export const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds <= 0) return "0s";

  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};
