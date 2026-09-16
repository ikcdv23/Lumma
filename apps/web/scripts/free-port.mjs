import { execFileSync } from "node:child_process";
import process from "node:process";

const port = process.argv[2] ?? "3000";

function output(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

if (process.platform === "win32") {
  const pids = new Set(
    output("netstat", ["-ano", "-p", "tcp"])
      .split(/\r?\n/)
      .filter((line) =>
        new RegExp(
          `\\b(?:127\\.0\\.0\\.1|0\\.0\\.0\\.0|\\[::\\]):${port}\\s+.*LISTENING`,
          "i",
        ).test(line),
      )
      .map((line) => line.trim().split(/\s+/).at(-1))
      .filter(Boolean),
  );

  for (const pid of pids) {
    output("taskkill", ["/PID", pid, "/T", "/F"]);
  }
} else {
  const pids = output("lsof", ["-ti", `tcp:${port}`])
    .split(/\s+/)
    .filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch {
      // El proceso pudo terminar entre lsof y process.kill.
    }
  }
}
