

export type Dev_Settings = {

    BUILD_IMAGES: boolean,
    LOG_LEVEL: "DEBUG" | "INFO",
    Delay_Settings: {
        after_start_hub: number,
        after_connector_start: number,
        after_agreement_made: number,
    }

}
export type Base_Dataspace_Settings = {
    dataspace_name: string,
    im_external_url: string,
    hub_external_url: string,

    Dev: Dev_Settings | null,


}

export namespace CLI_Config {

    
    export type KC_ENV = {
        KEYCLOAK_ADMIN: string;
        KEYCLOAK_ADMIN_PASSWORD: string;
        KC_LOG_LEVEL: string;
        KC_HOSTNAME: string;
        USE_PORT: number;
    }

    export type Connector_ENV = {
        IDS_CONNECTOR_ID: string;
        IDS_HUB_URL: string;
        IDS_API_KEY: string;
        USE_PORT: number;
        LOG_LEVEL: string;
        DEV_CMD: string;
        BUILD_IMAGES: boolean;
    }

    export type Hub_ENV = {
        IDENTITY_SERVER_URL: string;
        IDS_DATASPACE_NAME: string;
        USE_PORT: number;
        LOG_LEVEL: string;
        DEV_CMD: string;
        BUILD_IMAGES: boolean;
    }

}



