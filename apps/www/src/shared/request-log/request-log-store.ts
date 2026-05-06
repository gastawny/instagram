export type LogEntry = {
  id: string;
  timestamp: Date;
  method: string;
  route: string;
  payload: unknown;
  response: unknown;
  status: number;
  error?: string;
};

const entries: LogEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function addLog(entry: Omit<LogEntry, "id" | "timestamp">) {
  entries.unshift({ ...entry, id: crypto.randomUUID(), timestamp: new Date() });
  notify();
}

export function getSnapshot(): readonly LogEntry[] {
  return entries;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function clearLogs() {
  entries.length = 0;
  notify();
}
