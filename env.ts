
import $ from "dax";
 

 


 
import { CLI_Config } from "./Types/config_types.ts";

// We are using two connectors C1, C2 at local ports 5001,5002


 
export namespace IDS_Env_Builder {

    export function Hub(
         {IDS_DATASPACE_NAME, USE_PORT,  IDENTITY_SERVER_URL, BUILD_IMAGES=false, LOG_LEVEL="INFO"}
       :
       {IDS_DATASPACE_NAME:string,USE_PORT:number,IDENTITY_SERVER_URL:string,  BUILD_IMAGES?:boolean, LOG_LEVEL?:"INFO"|"DEBUG", }
    ): CLI_Config.Hub_ENV {
        let ret: CLI_Config.Hub_ENV = {
            IDENTITY_SERVER_URL: IDENTITY_SERVER_URL,
            IDS_DATASPACE_NAME: IDS_DATASPACE_NAME,
            USE_PORT: USE_PORT,
            LOG_LEVEL: LOG_LEVEL,
            DEV_CMD: "",
            BUILD_IMAGES: BUILD_IMAGES
        };
        return ret;
    }

    export function KC(
       {USE_PORT, LOG_LEVEL="INFO", KC_HOSTNAME}
       :
       {USE_PORT:number, LOG_LEVEL?:"INFO"|"DEBUG", KC_HOSTNAME:string}
    ): CLI_Config.KC_ENV {
        let ret: CLI_Config.KC_ENV = {
            USE_PORT: USE_PORT,
            KEYCLOAK_ADMIN: "admin",
            KEYCLOAK_ADMIN_PASSWORD: "admin",
            KC_LOG_LEVEL:LOG_LEVEL,
            KC_HOSTNAME: KC_HOSTNAME
        };
        return ret;
    }

    export function Connector(
 {          IDS_CONNECTOR_ID, USE_PORT: port,  IDS_HUB_URL: hub_url, BUILD_IMAGES: build_images=false, LOG_LEVEL: log_level="INFO", IDS_API_KEY: API_KEY=""}
       :
       {IDS_CONNECTOR_ID:string,USE_PORT:number, LOG_LEVEL?:"INFO"|"DEBUG", IDS_HUB_URL:string, BUILD_IMAGES?:boolean, IDS_API_KEY?:string}
       // IDS_CONNECTOR_ID: string, port: number,
        //hub_url: string, log_level="INFO",build_images=false, IDS_API_KEY: string = null
    ): CLI_Config.Connector_ENV {
        let ret: CLI_Config.Connector_ENV = {
            IDS_CONNECTOR_ID: IDS_CONNECTOR_ID,
            IDS_HUB_URL: hub_url,
            IDS_API_KEY: API_KEY,
            USE_PORT: port,
            LOG_LEVEL: log_level,
            DEV_CMD: "",
            BUILD_IMAGES: build_images,
        }
        return ret;
    };

}
//Expected_BASYX_Method()
//Full_Test();