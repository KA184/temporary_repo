
import $ from "dax";
 
import * as ini from "@std/ini";
import { CLI_Config } from "./Types/config_types.ts";
import { CLI } from "./Types/api_types.ts";
 

export function CLI_Runner(atl_ids: string, path: string) {

    let ret = {
        Pull: async () => {
            await $`${atl_ids} pull `.cwd(path);
        },
        Hub: {
            Config: {
                Init: async () => {
                    await $`${atl_ids} hub config init `.cwd(path);
                },

                Set_Broker_Config: async (settings: CLI_Config.Hub_ENV) => {
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


                    await Deno.writeTextFile(path + "/broker/.env", env_settings.join("\n"));
                },
                Read_Broker_Config: async () => {


                    let text = await Deno.readTextFile(path + "/broker/.env");
                    let ret = ini.parse(text);
                    ret["BUILD_IMAGES"] = ret["DEV_BUILD"] == "True" ? true : false;
                    return ret as CLI_Config.Hub_ENV;

                },

                Read_KC_Config: async () => {


                    let text = await Deno.readTextFile(path + "/kc/.env");
                    let ret = ini.parse(text);
                    //ret["BUILD_IMAGES"]=ret["DEV_BUILD"]=="True"?true:false;
                    return ret as CLI_Config.KC_ENV;

                },
                Set_KC_Config: async (settings: CLI_Config.KC_ENV) => {
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


                    await Deno.writeTextFile(path + "/kc/.env", env_settings.join("\n"));
                }
            },
            Server: {
                Init: async () => {
                    await $`${atl_ids} hub server init `.cwd(path);
                },
                Up: async () => {
                    await $`${atl_ids} hub server up `.cwd(path);
                },
                Down: async () => {
                    await $`${atl_ids} hub server down `.cwd(path);
                },

                Remove: async () => {
                    await $`${atl_ids} hub server remove `.cwd(path);
                },


            },
            Enroll: async (Participant_ID: string, Connector_URL: string) => {
                console.log("Enrolling " + Participant_ID + " " + Connector_URL);
                console.log(atl_ids);
                console.log(path);
                //const api_info = await $`${$.rawArg(`${atl_ids} hub enroll   ${Participant_ID}   ${Connector_URL}`)}  `.cwd(path).json();

                 const api_info = await $`${atl_ids} hub enroll   ${Participant_ID}   ${Connector_URL}  `.cwd(path).json();

                // const res = await $`${atl_ids} hub enroll ${Participant_ID} ${Connector_URL}`
                //     .cwd(path)
                //     .stdout("piped")
                //     .stderr("piped")
                //     .noThrow();
                // console.log(res.code);
                // console.log(res.code);
                // console.log(res.stdout.toString());
                // console.log(res.stderr.toString());
                return api_info as CLI.Enroll_Reply
            },
        },
        Connector: {
            Config: {
                Init: async () => {
                    await $`${atl_ids} hub config init `.cwd(path);
                },
                Read: async () => {


                    let text = await Deno.readTextFile(path + "/.env");
                    let ret = ini.parse(text);
                    ret["BUILD_IMAGES"] = ret["DEV_BUILD"] == "True" ? true : false;
                    return ret as CLI_Config.Connector_ENV;

                },
                Set: async (settings: CLI_Config.Connector_ENV) => {

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

                    await Deno.writeTextFile(path + "/.env", env_settings.join("\n"));
                },

                Set_API_KEY: async (api_key: string) => { }
            },
            Server: {
                Init: async () => {
                    await $`${atl_ids} connector server init `.cwd(path);
                },
                Up: async () => {
                    await $`${atl_ids} connector server up `.cwd(path);
                },
                Down: async () => {
                    await $`${atl_ids} connector server down `.cwd(path);
                },

                Remove: async () => {
                    await $`${atl_ids} connector server remove `.cwd(path);
                },


            }
        }
    };

    ret.Connector.Config.Set_API_KEY = async (api_key: string) => {
        let settings = await ret.Connector.Config.Read();
        settings.IDS_API_KEY = api_key;
        await ret.Connector.Config.Set(settings);
    }

    return ret;
}

export type CLI_RunnerT=ReturnType<typeof CLI_Runner>;

// atl-ids pull	Pulls the latest docker images of the Atlantis IDS Components
// atl-ids hub config init	Initializes a file with default configuration environment variables for an Atlantis IDS Hub at .env
// atl-ids hub server init	Initializes docker configuration for the hub using the .env file
// atl-ids hub server up	Starts the hub server using the current docker config
// atl-ids hub server down	Stops the hub server
// atl-ids hub server remove	Removes the hub server and all artifacts including docker volumes
// atl-ids hub enroll <Participant ID> <Connector URL>	Enroll a new participant returns the participant's API KEY
// atl-ids connector config init	Initializes a file with default configuration environment variables for an Atlantis IDS Connector at .env
// atl-ids connector server init	Initializes docker configuration for the connector using the .env file
// atl-ids connector server up	Starts the connector server using the current docker config
// atl-ids connector server down	Stops the connector server
// atl-ids connector server remove	Removes the connector server and all artifacts including docker volumes