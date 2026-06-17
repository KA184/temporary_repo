import { IDS_Env_Builder } from "./env.ts";

 import {CLI_Runner} from "./cli_runner.ts";
import {Create_Atlantis_IDS_Client} from "./Client.ts";
import { CLI_Parser, Connector_Installation, Generic_Installation, Hub_Installation, Linked_Installation_DOCKER, Test_Dataspace_Installation } from "./installation.ts";
import { CLI_Runner2 } from "./cli_runner2.ts";

 
export let Build={
  Env:{
    Connector:IDS_Env_Builder.Connector,
    Hub:IDS_Env_Builder.Hub,
    KC:IDS_Env_Builder.KC,

  },

  Client:{
    CLI:CLI_Runner2,
    API:Create_Atlantis_IDS_Client,   

  },
  Installation:{
    Connector:Connector_Installation,
    Hub:Hub_Installation,   
    Test_Dataspace:Test_Dataspace_Installation,
    Linked:{
      Docker_Folder:Linked_Installation_DOCKER,
      Generic:Generic_Installation
    }

  },
  CLI_Parser:CLI_Parser,
}