export function formatFullTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
