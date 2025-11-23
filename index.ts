import TokenRingApp from "@tokenring-ai/app";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {WebHostService} from "@tokenring-ai/web-host";
import AgentAPIResource from "./AgentAPIResource.js";
import packageJSON from "./package.json" with {type: "json"};

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    app.waitForService(WebHostService, webHost =>
      webHost.registerResource("agentAPI", new AgentAPIResource(app))
    );
  },
} as TokenRingPlugin;

export {default as AgentAPIResource} from "./AgentAPIResource.js";
