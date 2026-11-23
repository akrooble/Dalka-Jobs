// Server configuration only. A port override never permits another hostname/origin.
export function localApiOrigin(): string {
  const port = process.env.DALKA_API_PORT ?? "8080";
  if (!/^[1-9][0-9]{0,4}$/.test(port) || Number(port) > 65535) throw new Error("Invalid local API port.");
  return `http://127.0.0.1:${port}`;
}
