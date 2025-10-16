# @tokenring-ai/agent-api

WebSocket API for TokenRing agents, exposing agent management and communication via web-host.

## Features

- **WebSocket API**: Real-time agent communication
- **Agent Management**: Create, list, connect, and delete agents
- **Event Streaming**: Receive all agent events in real-time
- **Human Interaction**: Handle human input requests from agents
- **Browser Client**: JavaScript library for frontend integration

## Usage

### Server

```typescript
import { AgentTeam } from "@tokenring-ai/agent";
import { packageInfo as webHostPackage } from "@tokenring-ai/web-host";
import { packageInfo as webApiPackage } from "@tokenring-ai/agent-api";

const team = new AgentTeam({
  webHost: { enabled: true, port: 3000 }
});

await team.addPackages([webHostPackage, webApiPackage]);
// API available at ws://localhost:3000/ws
```

### Browser Client

```typescript
import { AgentClient } from "@tokenring-ai/agent-api/client";

const client = new AgentClient(); // Connects to ws://[host]/ws
await client.connect();

// Listen for events
client.on("event:output.chat", (data) => {
  console.log("Chat:", data.content);
});

client.on("event:state.idle", () => {
  console.log("Agent ready");
});

// Manage agents
client.listAgents();
client.createAgent("interactiveCodeAgent");
client.connectAgent(agentId);
client.sendInput("Hello!");
client.sendHumanResponse(sequence, response);
client.deleteAgent(agentId);
```

## WebSocket Protocol

### Client → Server

- `{ type: "listAgents" }` - List all agents
- `{ type: "createAgent", agentType: string }` - Create new agent
- `{ type: "connectAgent", agentId: string }` - Connect to agent
- `{ type: "input", message: string }` - Send input to agent
- `{ type: "humanResponse", sequence: number, response: any }` - Respond to human request
- `{ type: "deleteAgent", agentId: string }` - Delete agent

### Server → Client

- `{ type: "agentList", agents: [...] }` - List of agents
- `{ type: "agentCreated", agentId: string, name: string }` - Agent created
- `{ type: "agentConnected", agentId: string }` - Connected to agent
- `{ type: "agentDeleted", agentId: string }` - Agent deleted
- `{ type: "event", event: AgentEventEnvelope }` - Agent event
- `{ type: "error", message: string }` - Error message

## License

MIT License - Copyright (c) 2025 Mark Dierolf
