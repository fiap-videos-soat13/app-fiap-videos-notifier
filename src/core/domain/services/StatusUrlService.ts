export function buildVideoJobStatusUrl(videoJobId: string): string {
  const base =
    process.env.APP_STATUS_URL?.trim().replace(/\/$/, '') ||
    'http://localhost:3000';

  return `${base}/status/${videoJobId}`;
}
