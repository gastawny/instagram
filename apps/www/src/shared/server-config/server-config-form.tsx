import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServerConfig } from "./server-config-context";

type Props = {
  onSave: (config: ServerConfig) => void;
};

export function ServerConfigForm({ onSave }: Props) {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!host.trim()) {
      setError("Host é obrigatório.");
      return;
    }
    const portNum = Number(port);
    if (
      !port.trim() ||
      Number.isNaN(portNum) ||
      portNum < 1 ||
      portNum > 65535
    ) {
      setError("Porta deve ser um número entre 1 e 65535.");
      return;
    }
    onSave({ host: host.trim(), port: port.trim() });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm border border-border rounded-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">
            Configurar servidor
          </h1>
          <p className="text-sm text-muted-foreground">
            Informe o endereço da API antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              placeholder="localhost"
              value={host}
              onChange={(e) => {
                setError("");
                setHost(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="port">Porta</Label>
            <Input
              id="port"
              placeholder="3000"
              value={port}
              onChange={(e) => {
                setError("");
                setPort(e.target.value);
              }}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full">
            Conectar
          </Button>
        </form>
      </div>
    </div>
  );
}
