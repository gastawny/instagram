import { useState, useSyncExternalStore } from "react";
import {
  clearLogs,
  getSnapshot,
  type LogEntry,
  subscribe,
} from "./request-log-store";

function methodClass(method: string) {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-secondary text-secondary-foreground";
    case "POST":
      return "bg-primary text-primary-foreground";
    case "DELETE":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-accent text-accent-foreground";
  }
}

function statusClass(status: number) {
  if (status >= 200 && status < 300)
    return "bg-primary text-primary-foreground";
  return "bg-destructive text-destructive-foreground";
}

function formatTime(d: Date) {
  return d.toTimeString().slice(0, 8);
}

function JsonBlock({ value }: { value: unknown }) {
  if (value === undefined || value === null)
    return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <pre className="text-xs bg-muted text-foreground rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function LogRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
      >
        <span
          className={`shrink-0 font-mono text-xs font-semibold px-1.5 py-0.5 rounded ${methodClass(entry.method)}`}
        >
          {entry.method.toUpperCase()}
        </span>
        <span className="flex-1 font-mono text-xs text-foreground truncate">
          {entry.route}
        </span>
        <span
          className={`shrink-0 font-mono text-xs font-semibold px-1.5 py-0.5 rounded ${statusClass(entry.status)}`}
        >
          {entry.status}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatTime(entry.timestamp)}
        </span>
        <span className="shrink-0 text-muted-foreground text-xs">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {entry.error && (
            <p className="text-xs text-destructive font-medium">
              {entry.error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Payload
            </p>
            <JsonBlock value={entry.payload} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Response
            </p>
            <JsonBlock value={entry.response} />
          </div>
        </div>
      )}
    </li>
  );
}

export function RequestLogModal() {
  const [open, setOpen] = useState(false);
  const entries = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
      >
        <span>Logs</span>
        {entries.length > 0 && (
          <span className="bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {entries.length > 99 ? "99+" : entries.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xl h-full bg-background flex flex-col shadow-xl">
            <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="font-semibold text-sm text-foreground">
                Request Logs
              </span>
              <div className="flex items-center gap-2">
                {entries.length > 0 && (
                  <button
                    type="button"
                    onClick={clearLogs}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Limpar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              {entries.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground mt-12">
                  Nenhuma requisição ainda.
                </p>
              ) : (
                <ul>
                  {entries.map((entry) => (
                    <LogRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
