

import { CLI_RunnerT } from "../cli_runner.ts";
import { Atlantis_IDS_Client } from "../Client.ts";
import { CLI } from "./api_types.ts";
import { CLI_Config } from "./config_types.ts";


 

export type Hub_Installation_Descriptor = {
 

    Client_Settings: {
        Client_URL: string,
        Hub_Folder: string,
        Executable_Location: string,
       

    }

    Config:
    {
        ENV_Hub: CLI_Config.Hub_ENV,
        ENV_KC: CLI_Config.KC_ENV,
        External_Hub_URL: string,
        External_KC_URL: string,

    },

    Init_Settings:
    {
       // Participants: CLI.Enroll_Participant_Spec[],
        Delay_Before_Adding_Participants: number
    }

}

  export type Linked_Service_Installation = {
    Init:(parent:Connector_Installation_Descriptor)=>Promise<void>,
    Start:()=>Promise<void>,
    Drop:()=>Promise<void>,
    Stop:()=>Promise<void>,
};

export type Linked_Producer_Service = {
    //Service_Folder: string,
    Tag: string,
    DS_Name: string,
    DS_Description: string,
    Service_URL: string
    Test_With: string,
    Installation:Linked_Service_Installation
};

export type Linked_Consumer_Service = {
   Installation:Linked_Service_Installation

};

export type Connector_Installation_Descriptor = {


    Dataspace_Name: string,

    Client_Settings: {
        Client_URL: string,
        Connector_Folder: string,
        Executable_Location: string,
    }

    Config:
    {
        ENV: CLI_Config.Connector_ENV,
        External_URL: string,
    }

    Init_Settings: {

        Delay_After_Connector_Start:number|null,
        Linked_Producer_Service: Linked_Producer_Service | null,
        Linked_Consumer_Service: Linked_Consumer_Service | null
    }

}



export type Connector_InstallationT = {
    //service_folder: item.Child_Service.Service_Folder,
    item: Connector_Installation_Descriptor,
    cli_runner: CLI_RunnerT,
    api_client: Atlantis_IDS_Client,
    //Connector_Installation: ci,
    init: (API_KEY: string) => Promise<void>,
    stop: () => Promise<void>,
    drop: () => Promise<void>,
    start: () => Promise<void>,

    id: string,
    type: "CONNECTOR"
}

export type Hub_InstallationT = {

    item: Hub_Installation_Descriptor,
    cli_runner: CLI_RunnerT,

    init: (Participants: CLI.Enroll_Participant_Spec[]) => Promise<{ [key: string]: string }>,
    stop: () => Promise<void>,
    drop: () => Promise<void>,
    start: () => Promise<void>,


    type: "HUB"
}

export type Test_Dataspace_InstallationT = {

    Get_Installations: () => Promise<{
        hub_installation: Hub_InstallationT;
        participant_installations: Connector_InstallationT[];
    }>

    init: (Participants: CLI.Enroll_Participant_Spec[]) => Promise<void>,
    stop: () => Promise<void>,
    drop: () => Promise<void>,
    start: () => Promise<void>,


    type: "TD"
}

export type IDS_InstallationT = Connector_InstallationT | Hub_InstallationT | Test_Dataspace_InstallationT;