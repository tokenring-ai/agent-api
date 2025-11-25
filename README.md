# @tokenring-ai/agent-api

WebSocket API for TokenRing agents, providing real-time agent management and communication capabilities.

## Overview

The `@tokenring-ai/agent-api` package is a TokenRing plugin that integrates with the web-host service to provide WebSocket-based API for agent management and real-time communication. It enables browser clients to interact with TokenRing agents through a WebSocket connection.

## Features

- **WebSocket API**: Real-time bidirectional communication between browser clients and agents
- **Agent Management**: Create, list, connect, and delete agents dynamically
- **Event Streaming**: Receive all agent events in real-time (chat output, reasoning, state changes, etc.)
- **Human Interaction**: Handle human input requests from agents and provide responses
- **Browser Client**: TypeScript/JavaScript client library for seamless frontend integration
- **Plugin Architecture**: Integrates seamlessly with TokenRing app ecosystem

## Installation

```bash
npm install @tokenring-ai/agent-api
```

## Dependencies

- `@tokenring-ai/agent`: ^0.1.0 - Agent management and core agent functionality
- `@tokenring-ai/web-host`: ^0.1.0 - WebSocket hosting service
- `fastify`: ^5.6.2 - Fast HTTP server framework

## Usage

### Server Integration

The package is designed to work as a TokenRing plugin. Here's how to integrate it:

```typescript
import TokenRingApp from "@tokenring-ai/app";
import { AgentTeam } from "@tokenring-ai/agent";
import { packageInfo as agentApiPackage } from "@tokenring-ai/agent-api";

// Create your TokenRing app
const app = new TokenRingApp();

// Add the agent-api package
await app.addPackage(agentApiPackage);

// The WebSocket API will be available at /ws endpoint
// when web-host service is enabled
```

### Browser Client Usage

```typescript
import { AgentClient } from "@tokenring-ai/agent-api/client";

// Initialize client (defaults to ws://[current host]/ws)
const client = new AgentClient("ws://localhost:3000/ws");

// Connect to the WebSocket server
await client.connect();

// Listen for agent events
client.on("event:output.chat", (data) => {
  console.log("Agent chat:", data.content);
});

client.on("event:output.reasoning", (data) => {
  console.log("Agent reasoning:", data.content);
});

client.on("event:state.busy", (data) => {
  console.log("Agent is busy:", data.message);
});

client.on("event:state.idle", () => {
  console.log("Agent is idle and ready");
});

client.on("event:human.request", (data) => {
  console.log("Agent needs human input:", data.request);
  // Prompt user for response and send back
  const response = prompt("Agent needs your input:");
  client.sendHumanResponse(data.sequence, response);
});

// Manage agents
client.listAgents(); // Get list of all available agents

// Create a new agent
client.createAgent("interactiveCodeAgent");

// Connect to a specific agent
client.connectAgent("agent-id-here");

// Send input to the connected agent
client.sendInput("Hello! Can you help me with this task?");

// Delete an agent
client.deleteAgent("agent-id-here");

// Disconnect when done
client.disconnect();
```

## WebSocket Protocol

### Client → Server Messages

| Message Type | Parameters | Description |
|--------------|------------|-------------|
| `listAgents` | - | Request list of all available agents |
| `createAgent` | `agentType: string` | Create a new agent of specified type |
| `connectAgent` | `agentId: string` | Connect to a specific agent for communication |
| `input` | `message: string` | Send input message to connected agent |
| `humanResponse` | `sequence: number, response: any` | Respond to agent's human request |
| `deleteAgent` | `agentId: string` | Delete a specific agent |

### Server → Client Messages

| Message Type | Parameters | Description |
|--------------|------------|-------------|
| `agentList` | `agents: Array<{id: string, name: string, type: string}>` | List of available agents |
| `agentCreated` | `agentId: string, name: string` | Confirmation of agent creation |
| `agentConnected` | `agentId: string` | Confirmation of agent connection |
| `agentDeleted` | `agentId: string` | Confirmation of agent deletion |
| `event` | `event: AgentEventEnvelope` | Real-time agent event |
| `error` | `message: string` | Error message |

### Agent Event Types

The `event` message contains various agent event types:

- **`output.chat`**: Chat output from agent
  ```typescript
  { type: "output.chat", data: { content: string } }
  ```

- **`output.reasoning`**: Agent's reasoning process
  ```typescript
  { type: "output.reasoning", data: { content: string } }
  ```

- **`output.system`**: System messages from agent
  ```typescript
  { type: "output.system", data: { message: string, level: "info" | "warning" | "error" } }
  ```

- **`state.busy`**: Agent is busy processing
  ```typescript
  { type: "state.busy", data: { message: string } }
  ```

- **`state.notBusy`**: Agent is no longer busy
  ```typescript
  { type: "state.notBusy", data: {} }
  ```

- **`state.idle`**: Agent is idle and ready for input
  ```typescript
  { type: "state.idle", data: {} }
  ```

- **`state.aborted`**: Agent was aborted
  ```typescript
  { type: "state.aborted", data: { reason: string } }
  ```

- **`state.exit`**: Agent is exiting
  ```typescript
  { type: "state.exit", data: {} }
  ```

- **`input.received`**: Agent received input
  ```typescript
  { type: "input.received", data: { message: string } }
  ```

- **`human.request`**: Agent needs human input
  ```typescript
  { type: "human.request", data: { request: any, sequence: number } }
  ```

- **`human.response`**: Agent received human response
  ```typescript
  { type: "human.response", data: { responseTo: number, response: any } }
  ```

- **`reset`**: Agent was reset
  ```typescript
  { type: "reset", data: { what: string[] } }
  ```

## API Reference

### AgentClient

The main client class for WebSocket communication.

#### Constructor

```typescript
new AgentClient(url?: string)
```

- `url` (optional): WebSocket URL (defaults to `ws://${window.location.host}/ws`)

#### Methods

- `connect(): Promise<void>` - Connect to WebSocket server
- `disconnect(): void` - Disconnect from WebSocket server
- `listAgents(): void` - Request list of all agents
- `createAgent(agentType: string): void` - Create a new agent
- `connectAgent(agentId: string): void` - Connect to a specific agent
- `sendInput(message: string): void` - Send input to connected agent
- `sendHumanResponse(sequence: number, response: any): void` - Respond to human request
- `deleteAgent(agentId: string): void` - Delete an agent

#### Events

- `agentList` - When agent list is received
- `agentCreated` - When new agent is created
- `agentConnected` - When connected to agent
- `agentDeleted` - When agent is deleted
- `event` - For all agent events
- `event:{eventType}` - Specific event types (e.g., `event:output.chat`)
- `error` - When an error occurs

### AgentAPIResource

The server-side resource class that handles WebSocket connections.

#### Properties

- `name: string = "AgentAPI"` - Resource name

#### Methods

- `register(server: FastifyInstance): Promise<void>` - Register WebSocket endpoint with Fastify server

## Development

### Package Structure

```
pkg/agent-api/
├── index.ts          # Main plugin entry point
├── client.ts         # Browser client library
├── AgentAPIResource.ts # Server-side WebSocket handler
├── package.json      # Package configuration
├── README.md         # This documentation
└── LICENSE           # MIT License
```

### Exports

The package exports:

- **Default**: TokenRing plugin object
- **AgentAPIResource**: Server-side resource class
- **AgentClient**: Browser client class (via `./client` export)

## License

MIT License - Copyright (c) 2025 Mark Dierolf

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.