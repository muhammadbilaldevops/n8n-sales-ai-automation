import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Keep Next's trace inside this project; the parent Documents folder is sandboxed.
  outputFileTracingRoot: path.join(process.cwd()),
};
export default nextConfig;
