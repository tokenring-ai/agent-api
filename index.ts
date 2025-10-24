import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {WebHostService} from "@tokenring-ai/web-host";
import packageJSON from "./package.json" with {type: "json"};
import AgentAPIResource from "./AgentAPIResource.js";

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    agentTeam.services.waitForItemByType(WebHostService).then(webHost => {
      webHost.registerResource("agentAPI", new AgentAPIResource(agentTeam));
    });
  },
} as TokenRingPackage;

export {default as AgentAPIResource} from "./AgentAPIResource.js";
