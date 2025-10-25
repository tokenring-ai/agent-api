import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {WebHostService} from "@tokenring-ai/web-host";
import AgentAPIResource from "./AgentAPIResource.js";
import packageJSON from "./package.json" with {type: "json"};

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    agentTeam.waitForService(WebHostService, webHost =>
      webHost.registerResource("agentAPI", new AgentAPIResource(agentTeam))
    );
  },
} as TokenRingPackage;

export {default as AgentAPIResource} from "./AgentAPIResource.js";
