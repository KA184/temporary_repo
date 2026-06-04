
import { CLI_Config } from "./Types/config_types.ts";
import { Connector_Installation_Descriptor, Hub_Installation_Descriptor } from "./Types/installation_types";






let options = {
    restart: "on-failure",
    logging: {
        driver: "json-file",
        options: { "max-size": "10m", "max-file": "6" }
    }
}

export namespace File_Converters {

    export function Docker_Compose_C(env:CLI_Config.Connector_ENV) {

        

        let environment = [
            `ASPNETCORE_ENVIRONMENT=Docker`,
            `APP_VERSION=IDSC`,
            `DBMS=SQLITE`,
            `TEMP_PWD= `,
            `CONN_STR=Data Source=file:/var/opt/sqlite/data/Database1.db;`,
            `ASPNETCORE_URLS=http://+:80;`,
            `IDS_CONNECTOR_ID=${env.IDS_CONNECTOR_ID} `,
            `IDS_HUB_URL=${env.IDS_HUB_URL}`,
            `IDS_HUB_API_KEY=${env.IDS_API_KEY}`,
            `LOG_LEVEL=${env.LOG_LEVEL}`,
            `DEV_CMD_C=${env.DEV_CMD}`,
        ];

        let entrypoint = ["/bin/bash", "-c"];
        let command = ["dotnet", "AtlantisIDSConnector.dll"];

        let volumes_of_service = ["sqlite_data:/var/opt/sqlite/data"];

        let volumes = {
            sqlite_data: {}
        }

        let image_or_build = env.BUILD_IMAGES ? {
            build: {
                context: "/mnt/e/Atlantis.IDS.Connector",
                dockerfile: "Dockerfile.connector"
            }
        } :
            { image: "atlantisengineering.azurecr.io/atl-data-space-hub:1.0.0" }
            ;
        let ports = ["${USE_PORT}:80"];

        let extra_hosts = ["host.docker.internal:host-gateway"];


        return {
            services: {
                ["connector"]: {
                    ...image_or_build,
                    ports,
                    extra_hosts,
                    volumes: volumes_of_service,
                    ...options,

                    //...depends_on,
                    environment,
                    entrypoint,
                    command
                },

            },
            volumes
        }

    }
    export function Docker_Compose_H(env:CLI_Config.Hub_ENV) {

        

        let environment = [
            `ASPNETCORE_ENVIRONMENT=Docker`,
            `APP_VERSION=IDSC`,
            `DBMS=SQLITE`,
            `TEMP_PWD=      `,
            `IDENTITY_SERVER_URL=${env.IDENTITY_SERVER_URL}`,
            `CONN_STR=Data Source=file:/var/opt/sqlite/data/Database3.db;`,
            `ASPNETCORE_URLS=http://+:80;`,
            `IDS_DATASPACE_NAME=${env.IDS_DATASPACE_NAME}`,
            `DEV_CMD=${env.DEV_CMD}`,
            `LOG_LEVEL=${env.LOG_LEVEL}`,
        ];

        let extra_hosts = ["host.docker.internal:host-gateway"];
        let entrypoint = ["/bin/bash", "-c"];


        //todo: update-ca-certificates &&

        let command = ["dotnet", "AtlantisIDSConnector.dll"];

        let volumes_of_service = ["sqlite_data:/var/opt/sqlite/data"];

        let volumes = {
            sqlite_data: {}
        }

        let image_or_build = env.BUILD_IMAGES ? {
            build: {
                context: "/mnt/e/Atlantis.IDS.Connector",
                dockerfile: "Dockerfile.hub"
            }
        } :
            { image: "atlantisengineering.azurecr.io/atl-data-space-hub:1.0.0" }
            ;

        let ports = ["${USE_PORT}:80"];




        return {
            services: {
                ["ids_hub"]: {

                    ...image_or_build,
                    ports,
                    extra_hosts,
                    volumes: volumes_of_service,
                    ...options,

                    //...depends_on,
                    environment,
                    entrypoint,
                    command
                },

            },
            volumes
        }

    }


    export function Docker_Compose_K(env:CLI_Config.KC_ENV) {

        let options_unused = {
            restart: "on-failure",
            logging: {
                driver: "json-file",
                options: { "max-size": "10m", "max-file": "6" }
            }
        }

     

        let environment = [
            `KEYCLOAK_ADMIN=${env.KEYCLOAK_ADMIN}`,
            `KEYCLOAK_ADMIN_PASSWORD=${env.KEYCLOAK_ADMIN_PASSWORD}`,
            `KC_LOG_LEVEL=${env.KC_LOG_LEVEL}`,
            `KC_HOSTNAME=${env.KC_HOSTNAME}`,
            `KC_PROXY_HEADERS=xforwarded #Use this environment variable starting version 24`,
            `KC_HTTP_ENABLED=true`,
            `KC_HOSTNAME_STRICT=false`,
            `KC_HOSTNAME_STRICT_HTTPS=false`,
        ];

        //let entrypoint = ["/bin/bash", "-c"];
        let command = ["start-dev"];

        let volumes_of_service = ["kc_data:/opt/keycloak/data"];

        let volumes = {
            kc_data: {}
        }

        let image = "quay.io/keycloak/keycloak:25.0.2";
        let ports = ["${USE_PORT}:8080"];


        let depends_on = null;


        return {
            services: {
                ["keycloak"]: {
                    image,
                    ports,
                    //...options,
                    volumes: volumes_of_service,
                    //...depends_on,
                    environment,
                    //entrypoint,
                    command
                },
                //...use_xai
            },
            volumes
        }

    }
    export function Env_C(item: Connector_Installation_Descriptor) {
        return `
# ******** IDS SETTINGS

# ID of the Dataspace Participant 
IDS_CONNECTOR_ID=${item.Config.ENV.IDS_CONNECTOR_ID}


# External URL of the Atlantis IDS hub 
IDS_HUB_URL=${item.Config.ENV.IDS_HUB_URL}


# API KEY obtained during Enrollment 
IDS_API_KEY=${item.Config.ENV.IDS_API_KEY}


# Local port To launch the Atlantis IDS Connector  
USE_PORT=${item.Config.ENV.USE_PORT}

  
# ******* DEVELOPER SETTINGS
LOG_LEVEL=${item.Config.ENV.LOG_LEVEL}
DEV_CMD=${item.Config.ENV.DEV_CMD}
DEV_BUILD=${item.Config.ENV.BUILD_IMAGES ? "True" : "False"}
        
        `;
    }

    export function Env_H(item: Hub_Installation_Descriptor) {
        return `
# ******** IDS SETTINGS

# Name of the Dataspace 
IDS_DATASPACE_NAME=${item.Config.ENV_Hub.IDS_DATASPACE_NAME}
        

# External URL of the identity server 
IDENTITY_SERVER_URL=${item.Config.ENV_Hub.IDENTITY_SERVER_URL}
        

#Local port  To launch the Atlantis IDS Hub 
USE_PORT=${item.Config.ENV_Hub.USE_PORT}
        

# ******* DEVELOPER SETTINGS
LOG_LEVEL=${item.Config.ENV_Hub.LOG_LEVEL}
DEV_CMD=${item.Config.ENV_Hub.DEV_CMD}
DEV_BUILD=${item.Config.ENV_Hub.BUILD_IMAGES ? "True" : "False"}
        
        `;
    }

    export function Env_K(item: Hub_Installation_Descriptor) {
        return `
# ******** KEYCLOAK SETTINGS
# All KEYLOAK settings correspond to equivalent ones of the Keycloak server
  
# The Keycloack Admin Account user name
KEYCLOAK_ADMIN=${item.Config.ENV_KC.KEYCLOAK_ADMIN}

# The Keycloack Admin Account password "
KEYCLOAK_ADMIN_PASSWORD=${item.Config.ENV_KC.KEYCLOAK_ADMIN_PASSWORD}
  
# External URL of the keycloak server 
KC_HOSTNAME=${item.Config.ENV_KC.KC_HOSTNAME}
  
# Keycloak log level 
KC_LOG_LEVEL=${item.Config.ENV_KC.KC_LOG_LEVEL}
  
# ******** IDS SETTINGS
# Local port To launch the keycloak server acting as part of IDS Identity Management 
USE_PORT=${item.Config.ENV_KC.USE_PORT}
  
        
        `;
    }

}
