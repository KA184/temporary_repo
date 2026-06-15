
import $ from "dax";
import { Atlantis_IDS_Client, Create_Atlantis_IDS_Client } from "./Client.ts";



import { CLI_Runner, CLI_RunnerT } from "./cli_runner.ts";




import { Internal, } from "./Types/api_types.ts";
import { Connector_Installation_Descriptor, Connector_InstallationT, Hub_Installation_Descriptor, Hub_InstallationT, IDS_InstallationT, Linked_Service_Installation, Test_Dataspace_InstallationT } from "./Types/installation_types.ts";
import { Util, Util_IDS } from "./Util.ts";
import { NGINX_Helper, To_NGINX_Config_C, To_NGINX_Config_H } from "./nginx.ts";
import { CLI_Runner2 } from "./cli_runner2.ts";

// We are using two connectors C1, C2 at local ports 5001,5002



// export async function Connector_Installation(
//     ds_name: string,
//     env: CLI.Connector_ENV,
//     atl_ids: string,
//     folder: string,
//     create_folder: boolean
// ) {


//     let cli_runner = await CLI_Runner(atl_ids, folder);
//     let api_client = await Create_Atlantis_IDS_Client(ds_name, env.IDS_CONNECTOR_ID, `http://127.0.0.1:${env.USE_PORT}`);

//     let init = async (api_key) => {

//         if (create_folder) {
//             await $`mkdir -p ${folder}`;
//         }
//         env.IDS_API_KEY = api_key;



//         await cli_runner.Connector.Config.Set(env)
//         await cli_runner.Connector.Server.Init();
//         await cli_runner.Connector.Server.Up();

//     }

//     let start = async () => {


//         await cli_runner.Connector.Server.Up();

//     }

//     let stop = async () => {




//         await cli_runner.Connector.Server.Down();


//     }

//     let drop = async () => {




//         await cli_runner.Connector.Server.Remove();
//         if (create_folder == true) {
//             await $`rm -rf  ${folder}`;
//         }

//     }
//     return { cli_runner, api_client, init, start, stop, drop, id: env.IDS_CONNECTOR_ID, };
// }




export async function Hub_Installation(
    item: Hub_Installation_Descriptor) {


    let create_folder = true;

    let cli_runner_hub = await CLI_Runner2(item.Client_Settings.Executable_Location, item.Client_Settings.Hub_Folder);
    //let api_client = null;//await Create_Atlantis_IDS_Client(ds_name, participant_id, `http://127.0.0.1:${port}`);

    let init = async () => {

        if (create_folder) {
            await $`mkdir -p ${item.Client_Settings.Hub_Folder}/broker`;
            await $`mkdir -p ${item.Client_Settings.Hub_Folder}/kc`;
        }

        await cli_runner_hub.Hub.Config.Set_Broker_Config(item.Config.ENV_Hub);
        await cli_runner_hub.Hub.Config.Set_KC_Config(item.Config.ENV_KC);

        await cli_runner_hub.Hub.Server.Init();
        await cli_runner_hub.Hub.Server.Up();


        await new Promise(resolve => setTimeout(resolve, item.Init_Settings.Delay_Before_Adding_Participants));
        let ret_api_keys: { [key: string]: string } = {};

        for (let part of item.Init_Settings.Participants) {
            let api_key = await cli_runner_hub.Hub.Enroll(part.PARTICIPANT_ID, part.URL);
            // `http://host.docker.internal:${service.Port}`);
            ret_api_keys[part.PARTICIPANT_ID] = api_key.API_KEY;
        }
        return ret_api_keys;




    }

    let start = async () => {

        await cli_runner_hub.Hub.Server.Up();







    }
    let stop = async () => {




        await cli_runner_hub.Hub.Server.Down();


    }


    let drop = async () => {




        await cli_runner_hub.Hub.Server.Remove();
        if (create_folder == true) {
            await $`rm -rf   ${item.Client_Settings.Hub_Folder}`;
        }

    }


    return { cli_runner: cli_runner_hub, init, start, stop, drop, item, type: "HUB" as const } as Hub_InstallationT;
}





//export type Hub_InstallationT = Awaited<ReturnType<typeof Hub_Installation>>;
//export type Connector_InstallationT = Awaited<ReturnType<typeof Connector_Installation>>;



//Expected_BASYX_Method()
//Full_Test();



export async function Connector_Installation(item: Connector_Installation_Descriptor) {


    let env = item.Config.ENV;

    let create_folder = true;

    let cli_runner = await CLI_Runner2(item.Client_Settings.Executable_Location, item.Client_Settings.Connector_Folder);
    let api_client = await Create_Atlantis_IDS_Client(item.Dataspace_Name, env.IDS_CONNECTOR_ID, item.Client_Settings.Client_URL);


    // let ci = await Connector_Installation(
    //     item.Dataspace_Name,
    //     env,
    //     item.Client_Settings.Executable_Location,
    //     item.Client_Settings.Connector_Folder,
    //     true

    // );
    let linked_consumer = item.Init_Settings.Linked_Consumer_Service;
    let linked_producer = item.Init_Settings.Linked_Producer_Service;

    let init = async (api_key) => {

        if (create_folder) {
            await $`mkdir -p ${item.Client_Settings.Connector_Folder}`;
        }
        env.IDS_API_KEY = api_key;



        await cli_runner.Connector.Config.Set(env)
        await cli_runner.Connector.Server.Init();
        await cli_runner.Connector.Server.Up();





        //#CHANGE HERE--START
        //await ci.start();//.Connector.Config.Set(env)
        if (linked_consumer != undefined) {

             await linked_consumer.Installation.Init(item);
            //await $`docker compose up -d `.cwd(linked_consumer.Service_Folder);
        }
        if (linked_producer != undefined) {
            await Util.sleep(item.Init_Settings.Delay_After_Connector_Start??5000);

            let dataset = Service_Scripts.Build_Dataset(
                item.Dataspace_Name,
                item.Config.ENV.IDS_CONNECTOR_ID,
                linked_producer.DS_Name,
                linked_producer.Service_URL,
                linked_producer.DS_Description,
                linked_producer.Tag);
            let res = await api_client.Mod_Ops.Upsert(dataset.ds);


            //if (!Util.isNullOrWhiteSpace(item.Child_Service.Service_Folder)) {
            await linked_producer.Installation.Init(item);
            // $`docker compose up -d `.cwd(linked_producer.Service_Folder);
            // }
        }

        //#CHANGE HERE--END

    }

    let start = async () => {


        await cli_runner.Connector.Server.Up();

        //#CHANGE HERE--START
        //if (!Util.isNullOrWhiteSpace(item.Child_Service.Service_Folder)) {
        if (linked_producer != undefined) {
             await linked_producer.Installation.Start();
            //await $`docker compose up -d `.cwd(linked_producer.Service_Folder);
            //}
        }
        if (linked_consumer != undefined) {
             await linked_consumer.Installation.Start();
            //await $`docker compose up -d `.cwd(linked_consumer.Service_Folder);

        }
        //#CHANGE HERE--END

    }

    let stop = async () => {


        await cli_runner.Connector.Server.Down();

        //#CHANGE HERE--START
        //if (!Util.isNullOrWhiteSpace(item.Child_Service.Service_Folder)) {
        if (linked_producer != undefined) {
            await linked_producer.Installation.Stop();
            //await $`docker compose down  `.cwd(linked_producer.Service_Folder);
        }

        if (linked_consumer != undefined) {
                await linked_consumer.Installation.Stop();
            //await $`docker compose down  `.cwd(linked_consumer.Service_Folder);
        }
        //}
        //#CHANGE HERE--END


    }

    let drop = async () => {


        await cli_runner.Connector.Server.Remove();
        if (create_folder == true) {
            await $`rm -rf  ${item.Client_Settings.Connector_Folder}`;
        }

        //#CHANGE HERE--START
        //if (!Util.isNullOrWhiteSpace(item.Child_Service.Service_Folder)) {
        if (linked_producer != undefined) {

             await linked_producer.Installation.Drop();
            //await $`docker compose down --volumes `.cwd(linked_producer.Service_Folder);
        }

        if (linked_consumer != undefined) {
                await linked_consumer.Installation.Drop();
           // await $`docker compose down --volumes `.cwd(linked_consumer.Service_Folder);
        }
        //}
        //#CHANGE HERE--END


    }
    return {
        //service_folder: item.Child_Service.Service_Folder,
        item,
        cli_runner,
        api_client,
        //Connector_Installation: ci,
        init,
        stop,
        drop,
        start,

        id: item.Config.ENV.IDS_CONNECTOR_ID,
        type: "CONNECTOR" as const
    } as Connector_InstallationT;
}


//export type Connector_Installation = Awaited<ReturnType<typeof Connector_Installation>>;



export function Test_Dataspace_Installation(
    hub: Hub_Installation_Descriptor,
    participants: Connector_Installation_Descriptor[]
) {





    let Get_Installations = async () => {



        let hub_installation = await Hub_Installation(
            hub,

        );

        let participant_installations: Connector_InstallationT[] = [];
        for (let item of participants) {

            let installation = await Connector_Installation(item);
            // let env = IDS_Env_Builder.Connector(item.Participant_ID, item.Port, common_settings);
            // let installation = await Connector_Installation( 
            //     common_settings.dataspace_name,
            //     env,
            //     common_settings.Dev.Executable_Location ,
            //     common_settings.Dev.Resolve_Folder(env.IDS_CONNECTOR_ID),
            //     true
            //  );



            participant_installations.push(installation);
        }




        return { hub_installation, participant_installations };

    }




    let init = async () => {

        let installations = await Get_Installations();
        let api_keys = await installations.hub_installation.init();

        for (let item of installations.participant_installations) {


            await item.init(api_keys[item.id]);

        }


    }

    let start = async () => {

        let installations = await Get_Installations();
        await installations.hub_installation.start();


        for (let participant of installations.participant_installations) {
            await participant.start();
        }

    }

    let stop = async () => {


        let installations = await Get_Installations();


        await installations.hub_installation.stop();


        for (let participant of installations.participant_installations) {
            await participant.stop();
        }
    }

    let drop = async () => {

        let installations = await Get_Installations();

        await installations.hub_installation.drop();
        // for (let service of installations.service_installations) {
        //     await service.drop();
        // }

        for (let participant of installations.participant_installations) {
            await participant.drop();
        }


    }
    return {
        //service_folder: item.Child_Service.Service_Folder,

        //Connector_Installation: ci,
        init, stop, drop, start, Get_Installations, type: "TD" as const
    } as Test_Dataspace_InstallationT
}


export function Linked_Installation_DOCKER(folder:string):Linked_Service_Installation{
    let ret:Linked_Service_Installation={
      Init: async function (parent: Connector_Installation_Descriptor) {
         await $`docker compose up -d `.cwd(folder);
      },
      Start: async function ()  {
          await $`docker compose up -d `.cwd(folder);
      },
      Drop: async function () {
          await $`docker compose down --volumes `.cwd(folder);
      },
      Stop: async function ()  {
          await $`docker compose down  `.cwd(folder);
      }
    };
    return ret;

}

//export type Test_Dataspace_InstallationT = ReturnType<typeof Test_Dataspace_Installation>;






export async function CLI_Parser(installation: IDS_InstallationT, Post_Init_Script: () => Promise<void>) {

    const [method, arg1] = Deno.args;
    //console.log(method);
    //console.log("*************************");


    //let td = Test_Dataspace_Installation(hub_installation_desc, participants.concat(services));


    if (method == "init") {
        if (installation.type == "CONNECTOR") {

            installation.init(arg1);

        }
        else {
            await installation.init();
        }
        await Post_Init_Script();
    }
    else if (method == "drop") {
        await installation.drop();
    }
    else if (method == "start") {
        await installation.start();
    }
    else if (method == "stop") {
        await installation.stop();
    }
    else if (method == "nginx") {


        let commands = ["add", "remove", "enable", "disable", "certbot"];
        if (!commands.includes(arg1)) {
            console.error("Incorrect nginx related command");
            throw "FAILED";
        }

        let ret: NGINX_Helper[] = [];
        if (installation.type == "TD") {
            let installations = await installation.Get_Installations();
            let items1 = To_NGINX_Config_H(installations.hub_installation.item);
            let items2 = installations.participant_installations.map(x => To_NGINX_Config_C(x.item));
            ret = [...items1, ...items2];


        }
        if (installation.type == "HUB") {

            let items1 = To_NGINX_Config_H(installation.item);

            ret = [...items1];


        }
        if (installation.type == "CONNECTOR") {

            let items1 = To_NGINX_Config_C(installation.item);

            ret = [items1];


        }
        if (arg1 == "add") {

            for (let i of ret) {
                await i.add_command();
                // await i.add_command();
                // await i.enable_command();
            }
        }
        else if (arg1 == "remove") {
            for (let i of ret) {
                await i.remove_command();
                // await i.add_command();
                // await i.enable_command();
            }

        }
        else if (arg1 == "enable") {
            for (let i of ret) {
                await i.enable_command();
                // await i.add_command();
                // await i.enable_command();
            }

        }
        else if (arg1 == "disable") {
            for (let i of ret) {
                await i.disable_command();
                // await i.add_command();
                // await i.enable_command();
            }

        }
        else if (arg1 == "certbot") {
            for (let i of ret) {
                await i.certbot_command();
                // await i.add_command();
                // await i.enable_command();
            }

        }

        //let commands=["add","remove","enable","disable", "certbot"];

        // console.log(JSON.stringify(ret,null,4));

    }
    else {
        console.log("Unsupported command");
    }
}

export namespace Service_Scripts {
    export function Build_Dataset(
        DSP_Name: string,
        Participant_ID: string,
        Name: string,
        url: string,
        Description_ENG: string,
        TAG: string) {


        let ret: Internal.Internal_Dataset = {
            Name: Name,
            Metadata: {
                Tags: [TAG],
                Description: {
                    ["en"]: Description_ENG,
                    //["el"]: "Στο json dictionary  για κάθε κωδικό γλώσσας μπορεί να μπει μια περιγραφή του dataset",
                }
            },
            Offers: [{
                Name: "Offer1",
                Obligations: {
                    Compensation_Amount: null,
                    Delete_After_Days: null,
                    Attribute: false,
                    Certification__Token: false
                },
                Permissions: {
                    Use: true,
                    Read: false,
                    Modify: false,
                    Annotate: false,
                    Extract: false,
                    Index: false,
                    Restrict_On_Days: null,
                    Restrict_On_Interval_Start: null,
                    Restrict_On_Interval_End: null
                },
                Prohibitions: {
                    Modify: false,
                    Distribute: false,
                    Extract: false
                }
            }],
            HTTP_Service_Distribution: {
                Name: "DIST1",
                URL: url,
                Settings: undefined
            },
            File_Distributions: [


                //{ Name: "File", IsDefault: true },
                //{ Name: "AnotherFile", IsDefault: false },


            ]
        };

        let ds_id = Util_IDS.DS_ID(DSP_Name, Participant_ID, Name);
        let offer_id = Util_IDS.Offer_ID(ds_id, "Offer1");
        return { ds: ret, ds_id, offer_id };

    }




}

