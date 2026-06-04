
import { Connector_Installation_Descriptor, Hub_Installation_Descriptor } from "./Types/installation_types.ts";


import { CLI_Config } from "./Types/config_types.ts";
import { File_Converters } from "./file_converters.ts";
import $ from "dax";
import * as Path from "@std/path";
import * as ini from "@std/ini";
import * as yaml from "@std/yaml";
import { CLI_RunnerT } from "./cli_runner.ts";
let Read_Broker_Config = async (path) => {


    let text = await Deno.readTextFile(Path.resolve(path, "broker", ".env"));
    let ret = ini.parse(text);
    ret["BUILD_IMAGES"] = ret["DEV_BUILD"] == "True" ? true : false;
    return ret as CLI_Config.Hub_ENV;

};

let Read_KC_Config = async (path) => {


    let text = await Deno.readTextFile(Path.resolve(path, "kc", ".env"));
    let ret = ini.parse(text);
    //ret["BUILD_IMAGES"]=ret["DEV_BUILD"]=="True"?true:false;
    return ret as CLI_Config.KC_ENV;

}

let Read_Connector_Config = async (path) => {


    let text = await Deno.readTextFile(Path.resolve(path, ".env"));
    let ret = ini.parse(text);
    ret["BUILD_IMAGES"] = ret["DEV_BUILD"] == "True" ? true : false;
    return ret as CLI_Config.Connector_ENV;

};
let Set_KC_Config = async (settings: CLI_Config.KC_ENV, path) => {

    let kc_path = Path.resolve(path, "kc");
    await $`mkdir -p ${kc_path}`;
    let env_settings = [
        "# ******** KEYCLOAK SETTINGS",
        "# All KEYLOAK settings correspond to equivalent ones of the Keycloak server",
        "# The Keycloack Admin Account user name",
        `KEYCLOAK_ADMIN=${settings.KEYCLOAK_ADMIN}`,
        "",
        "# The Keycloack Admin Account password ",
        `KEYCLOAK_ADMIN_PASSWORD=${settings.KEYCLOAK_ADMIN_PASSWORD}`,
        "",
        "# External URL of the keycloak server ",
        `KC_HOSTNAME=${settings.KC_HOSTNAME}`,
        "",
        "# Keycloak log level ",
        `KC_LOG_LEVEL=${settings.KC_LOG_LEVEL}`,
        "",
        "# ******** KEYCLOAK SETTINGS",
        "# Local port To launch the keycloak server acting as part of IDS Identity Management ",
        `USE_PORT=${settings.USE_PORT}`,
        "",


    ];


    await Deno.writeTextFile(Path.resolve(kc_path, ".env"), env_settings.join("\n"));
}


let Set_Broker_Config = async (settings: CLI_Config.Hub_ENV, path) => {

    let broker_path = Path.resolve(path, "broker");

    await $`mkdir -p ${broker_path}`;



    let env_settings = [
        "# ******** IDS SETTINGS",

        "# Name of the Dataspace ",
        `IDS_DATASPACE_NAME=${settings.IDS_DATASPACE_NAME}`,
        "",

        "# External URL of the identity server ",
        `IDENTITY_SERVER_URL=${settings.IDENTITY_SERVER_URL}`,
        "",

        "#Local port  To launch the Atlantis IDS Hub ",
        `USE_PORT=${settings.USE_PORT}`,
        "",

        "# ******* DEVELOPER SETTINGS",
        `LOG_LEVEL=${(settings.LOG_LEVEL)}`,
        `DEV_CMD=${(settings.DEV_CMD)}`,
        `DEV_BUILD=${(settings.BUILD_IMAGES ? "True" : "False")}`,
    ];


    await Deno.writeTextFile(Path.resolve(broker_path, ".env"), env_settings.join("\n"));
};




export let Set_Connector_Config = async (settings: CLI_Config.Connector_ENV, path) => {

    let env_settings = [
        "# ******** IDS SETTINGS",

        "# ID of the Dataspace Participant ",
        `IDS_CONNECTOR_ID=${settings.IDS_CONNECTOR_ID}`,
        "",

        "# External URL of the Atlantis IDS hub ",
        `IDS_HUB_URL=${settings.IDS_HUB_URL}`,
        "",

        "# API KEY obtained during Enrollment ",
        `IDS_API_KEY=${settings.IDS_API_KEY}`,
        "",

        "# Local port To launch the Atlantis IDS Connector  ",
        `USE_PORT=${settings.USE_PORT}`,
        "",

        "# ******* DEVELOPER SETTINGS",
        `LOG_LEVEL=${(settings.LOG_LEVEL)}`,
        `DEV_CMD=${(settings.DEV_CMD)}`,
        `DEV_BUILD=${(settings.BUILD_IMAGES ? "True" : "False")}`,

    ];

    await Deno.writeTextFile(Path.resolve(path, ".env"), env_settings.join("\n"));
}

type Participant_Check =
    {
        Error: boolean
        Error_Message: string
        URL: string

    }
type Participant_Added =
    {

        PARTICIPANT_ID: string,
        API_KEY: string

    }

namespace HUB_CALLS {
    export let Check_API_KEY = async (settings: CLI_Config.Connector_ENV) => {

        let api_key = settings.IDS_API_KEY;
        let hub_url = settings.IDS_HUB_URL;
        let url = hub_url + "/CLI/Hub_Action"
        let participant = settings.IDS_CONNECTOR_ID;

        let req = {
            type: 12,
            Check_Participant_ID: participant,
            Check_Participant_API_KEY: api_key,

        };

        let response = await fetch(url, { method: "POST", body: JSON.stringify(req) });
        let reply = await response.json() as Participant_Check;
        if (reply.Error) throw "API CHECK FAILED";

    }

    export let Enroll = async (hub_url, participant: string, api_key: string) => {


        let url = hub_url + "/CLI/Hub_Action"


        let req = {
            type: 11,
            Enroll_Participant_ID: participant,
            Enroll_Participant_URL: api_key,

        };



        let response = await fetch(url, { method: "POST", body: JSON.stringify(req) });
        let reply = await response.json() as Participant_Added;

        return reply;


    }
}



export function CLI_Runner2(atl_ids_ignored: string,path): CLI_RunnerT {

    let broker_path = Path.resolve(path, "broker");
    let kc_path = Path.resolve(path, "kc");

    let Hub = {
        Config: {
            Init: async () => {

                let config: CLI_Config.Hub_ENV =
                {
                    BUILD_IMAGES: false,
                    IDS_DATASPACE_NAME: "<DATASPACE NAME>",
                    DEV_CMD: "",
                    IDENTITY_SERVER_URL: "<IDENTITY SERVER URL>",
                    LOG_LEVEL: "INFO",
                    USE_PORT: 5010

                };

                await Set_Broker_Config(config, path);

                let config_kc: CLI_Config.KC_ENV =
                {
                    KEYCLOAK_ADMIN: "admin",
                    KEYCLOAK_ADMIN_PASSWORD: "admin",
                    KC_HOSTNAME: "<IDENTITY SERVER URL>",
                    KC_LOG_LEVEL: "INFO",
                    USE_PORT: 5020

                };

                await Set_KC_Config(config_kc, path);

            },


            Set_Broker_Config: async (settings: CLI_Config.Hub_ENV) => {
                await Set_Broker_Config(settings, path)
            },
            Read_Broker_Config: async () => {


                let ret = await Read_Broker_Config(path);

                return ret;

            },

            Read_KC_Config: async () => {


                let ret = await Read_KC_Config(path);

                return ret;

            },
            Set_KC_Config: async (settings: CLI_Config.KC_ENV) => {
                await Set_KC_Config(settings, path)
            }
        },
        Server: {

            Init: async () => {
                let config_hub = await Read_Broker_Config(path);
                let docker = File_Converters.Docker_Compose_H(config_hub);
                let location = Path.resolve(broker_path, "docker-compose.yml");
                let text = yaml.stringify(docker);
                await Deno.writeTextFile(location, text);

                let config_kc = await Read_KC_Config(path);
                let docker_kc = File_Converters.Docker_Compose_K(config_kc);
                let location_kc = Path.resolve(kc_path, "docker-compose.yml");
                let text_kc = yaml.stringify(docker_kc);
                await Deno.writeTextFile(location_kc, text_kc);
            },

            Up: async () => {

                await $`docker compose up -d --build`.cwd(kc_path);
                await $`docker compose up -d --build`.cwd(broker_path);
            },

            Down: async () => {
                await $`docker compose down`.cwd(broker_path);
                await $`docker compose down`.cwd(kc_path);
            },
            Remove: async () => {

                await $`docker compose down --volumes`.cwd(broker_path);
                await $`docker compose down --volumes`.cwd(kc_path);


            }
        },
        Enroll: async (participant, api_key) => {
            let config_hub = await Read_Broker_Config(path);
            let ret = await HUB_CALLS.Enroll("http://127.0.0.1:" + config_hub.USE_PORT, participant, api_key);
            return ret;
        }
    };


    let Connector = {
        Config: {

            Init: async () => {

                let config: CLI_Config.Connector_ENV =
                {
                    BUILD_IMAGES: false,

                    DEV_CMD: "",
                    IDS_API_KEY: "<API KEY>",
                    IDS_CONNECTOR_ID: "<PARTICIPANT ID>",
                    IDS_HUB_URL: "<IDS Hub URL>",
                    LOG_LEVEL: "INFO",
                    USE_PORT: 5001

                };

                await Set_Connector_Config(config, path);
            },
            Read: async () => {
              let ret = await Read_Connector_Config(path);

                return ret;

               
            },
            Set: async (settings: CLI_Config.Connector_ENV) => {
                 await Set_Connector_Config(settings, path);
                
            },

            Set_API_KEY: async (api_key: string) => { }

        },
        Server: {

            Init: async () => {
                let config = await Read_Connector_Config(path);
                await HUB_CALLS.Check_API_KEY(config);
                let docker = File_Converters.Docker_Compose_C(config);
                let location = Path.resolve(path, "docker-compose.yml");
                let text = yaml.stringify(docker);
                await Deno.writeTextFile(location, text);
                //here you must communicate with hub??????

            },

            Up: async () => {

                await $`docker compose up -d --build`.cwd(path);
            },

            Down: async () => {
                await $`docker compose down`.cwd(path);
            },
            Remove: async () => {

                await $`docker compose down --volumes`.cwd(path);


            }
        }
    }

    let Pull = async () => { };
    return { Connector, Hub, Pull };
}
