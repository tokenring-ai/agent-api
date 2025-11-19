type AgentEventEnvelope =
  | { type: "output.chat"; data: { content: string } }
  | { type: "output.reasoning"; data: { content: string } }
  | { type: "output.system"; data: { message: string; level: "info" | "warning" | "error" } }
  | { type: "state.busy"; data: { message: string } }
  | { type: "state.notBusy"; data: {} }
  | { type: "state.idle"; data: {} }
  | { type: "state.aborted"; data: { reason: string } }
  | { type: "state.exit"; data: {} }
  | { type: "input.received"; data: { message: string } }
  | { type: "human.request"; data: { request: any; sequence: number } }
  | { type: "human.response"; data: { responseTo: number; response: any } }
  | { type: "reset"; data: { what: string[] } };

type ClientMessage =
  | { type: "createAgent"; agentType: string }
  | { type: "listAgents" }
  | { type: "connectAgent"; agentId: string }
  | { type: "input"; message: string }
  | { type: "humanResponse"; sequence: number; response: any }
  | { type: "deleteAgent"; agentId: string };

type ServerMessage =
  | { type: "agentList"; agents: Array<{ id: string; name: string; type: string }> }
  | { type: "agentCreated"; agentId: string; name: string }
  | { type: "agentConnected"; agentId: string }
  | { type: "agentDeleted"; agentId: string }
  | { type: "event"; event: AgentEventEnvelope }
  | { type: "error"; message: string };

export class AgentClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private url: string = `ws://${window.location.host}/ws`) {
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);

      this.ws.onmessage = (event) => {
        const msg: ServerMessage = JSON.parse(event.data);
        this.emit(msg.type, msg);
        if (msg.type === "event") {
          this.emit(`event:${msg.event.type}`, msg.event.data);
        }
      };
    });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  listAgents(): void {
    this.send({type: "listAgents"});
  }

  createAgent(agentType: string): void {
    this.send({type: "createAgent", agentType});
  }

  connectAgent(agentId: string): void {
    this.send({type: "connectAgent", agentId});
  }

  sendInput(message: string): void {
    this.send({type: "input", message});
  }

  sendHumanResponse(sequence: number, response: any): void {
    this.send({type: "humanResponse", sequence, response});
  }

  deleteAgent(agentId: string): void {
    this.send({type: "deleteAgent", agentId});
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  private send(msg: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    this.ws.send(JSON.stringify(msg));
  }
}
