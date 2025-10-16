import { AgentTeam, TokenRingPackage } from "@tokenring-ai/agent";
import { WebHostService } from "@tokenring-ai/web-host";
import packageJSON from "./package.json" with { type: "json" };
import AgentAPIResource from "./AgentAPIResource.js";

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const webHost = agentTeam.services.getItemByType(WebHostService);
    if (webHost) {
      webHost.registerResource("agentAPI", new AgentAPIResource(agentTeam));
    }
  },
};

export { default as AgentAPIResource } from "./AgentAPIResource.js";
