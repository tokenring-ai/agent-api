import {AgentConfigService} from "@tokenring-ai/agent";
import Agent from "@tokenring-ai/agent/Agent";
import {AgentEventEnvelope} from "@tokenring-ai/agent/AgentEvents";
import AgentTeam from "@tokenring-ai/agent/AgentTeam";
import type {WebResource} from "@tokenring-ai/web-host/types";
import type {FastifyInstance} from "fastify";

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

export default class AgentAPIResource implements WebResource {
  name = "AgentAPI";

  constructor(private agentTeam: AgentTeam) {
  }

  async register(server: FastifyInstance): Promise<void> {
    server.get("/ws", {websocket: true}, (socket, req) => {
      let currentAgent: Agent | null = null;
      let eventAbortController: AbortController | null = null;

      const send = (msg: ServerMessage) => {
        socket.send(JSON.stringify(msg));
      };

      const startEventLoop = async (agent: Agent) => {
        eventAbortController = new AbortController();
        try {
          for await (const event of agent.events(eventAbortController.signal)) {
            send({type: "event", event});
          }
        } catch (err) {
          if (!eventAbortController.signal.aborted) {
            send({type: "error", message: `Event loop error: ${err}`});
          }
        }
      };

      socket.on("message", async (data: Buffer) => {
        try {
          const msg: ClientMessage = JSON.parse(data.toString());

          switch (msg.type) {
            case "listAgents":
              const agents = this.agentTeam.getAgents().map(a => ({
                id: a.id,
                name: a.options.name,
                type: a.options.type,
              }));
              send({type: "agentList", agents});
              break;

            case "createAgent":
              const agentConfigService = this.agentTeam.requireService(AgentConfigService);
              const agent = await agentConfigService.spawnAgent(msg.agentType, this.agentTeam);
              send({type: "agentCreated", agentId: agent.id, name: agent.options.name});
              break;

            case "connectAgent":
              const targetAgent = this.agentTeam.getAgent(msg.agentId);
              if (!targetAgent) {
                send({type: "error", message: "Agent not found"});
                break;
              }
              if (eventAbortController) {
                eventAbortController.abort();
              }
              currentAgent = targetAgent;
              startEventLoop(currentAgent);
              send({type: "agentConnected", agentId: currentAgent.id});
              break;

            case "input":
              if (!currentAgent) {
                send({type: "error", message: "No agent connected"});
                break;
              }
              await currentAgent.handleInput({message: msg.message});
              break;

            case "humanResponse":
              if (!currentAgent) {
                send({type: "error", message: "No agent connected"});
                break;
              }
              currentAgent.sendHumanResponse(msg.sequence, msg.response);
              break;

            case "deleteAgent":
              const agentToDelete = this.agentTeam.getAgent(msg.agentId);
              if (agentToDelete) {
                await this.agentTeam.deleteAgent(agentToDelete);
                send({type: "agentDeleted", agentId: msg.agentId});
              }
              break;
          }
        } catch (err) {
          send({type: "error", message: `${err}`});
        }
      });

      socket.on("close", () => {
        if (eventAbortController) {
          eventAbortController.abort();
        }
      });
    });
  }
}
