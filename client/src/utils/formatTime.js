// convert a timestamp to a human readable time
export function formatTime(timestamp) {
  return new Date(Date.parse(timestamp))
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour12: true,
      hour: "numeric",
      minute: "numeric"
    });
}