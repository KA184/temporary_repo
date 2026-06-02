 
import { Entities, Internal, Messages, Responses } from "./Types/api_types.ts";
import { guid, Util_IDS } from "./Util.ts";

 

export type Atlantis_IDS_Client= ReturnType<typeof Create_Atlantis_IDS_Client>;
 
export function Create_Atlantis_IDS_Client(ds_name:string, participant_id, url)
{

     
    let rdr=()=>url;
   let {Create,...calls_tr}=BEC_Transfer_Admin(rdr);
   let {Agree,...calls_neg}=BEC_Neg_Admin(rdr);
   let mod_calls= BEC_Saving_Operations(rdr);

   let {Get_Endpoint}= New_Operations(rdr);

   let calls_read=BEC_Read(rdr);
    
   return {
    Create_Transfer:Create,
    Agree,
	Get_Endpoint:async (x:Messages.Get_Endpoint_MSG)=>{
        let res=await Get_Endpoint(x);
         
        return res;
    },
    //edo prepei na ginei GET CONNECTION

    Search: calls_read.Search,
    Datasets:{
        Local:calls_read.Datasets,
        AgreedTo:calls_read.DatasetsAgreedTo,
    },

    Manage:{
        Negotiations:calls_neg,
        Transfers:calls_tr,
       
    },

    Mod_Ops:{
        Upsert:mod_calls.Upsert
    },

	Dataspace_Name:ds_name,
	Participant_ID:participant_id,
     

    //TEMP
     Get_Token: async () => {

        // var url = rdr() + "/" + controller(req.Table) + "/Rows_Excel";
       
        let ret = await fetch(
              url + `/DataPlane/ConnectorToken/`,
            {
                method: 'GET',
                //  body: JSON.stringify(req)
            }
         );
         let ret2=await ret.text();
         //.then(x=>x.text());

        
        return ret2; 

    },
   }
}

function BEC_Neg_Admin(rdr:()=>string) {
     let Agree=async function (DatasetID: string, OfferID: string) {
        let msg: Messages.Negotiation__Begin_As_Consumer = {
            ID: guid(),
            ds_id: DatasetID,
            offer_id: OfferID,
            Token: ""
        };
        let resp = await fetch(
            rdr() + "/ClientAPI/Negotiation/Begin",

            {
                method: 'POST',
                body: JSON.stringify(msg)
            }

        );
        let reply = await resp.text();
		//todo
        return JSON.parse(reply) as Responses.Process_Created_Response;

    }


    let Status=async function(Negotiation_Cid_Or_PID: string) {

        let resp = await fetch(
            rdr() + "/ClientAPI/Negotiation/Status/" + Negotiation_Cid_Or_PID,

            {
                method: 'GET',

            }

        );
        let reply = await resp.text();

        return JSON.parse(reply) as Entities.Negotiation_State;

    }

    return{
        Agree,State: Status
    }

}

function BEC_Transfer_Admin (rdr:()=>string){

    let Create= async function (AgreementID: string, Format: string) {
        let msg: Messages.Transfer__BeginAsConsumer = {
            ID: guid(),
            AgreementID: AgreementID,
            Format: Format,

        };
        let resp = await fetch(
            rdr() + "/ClientAPI/Transfer/Create",

            {
                method: 'POST',
                body: JSON.stringify(msg)
            }

        );
		//todo
        let reply = await resp.text();

        return JSON.parse(reply) as Responses.Process_Created_Response;

    }


   
    let Status = async function (Transfer_Cid_Or_PID: string) {

        let resp = await fetch(
            rdr() + "/ClientAPI/Transfer/Status/" + Transfer_Cid_Or_PID,

            {
                method: 'GET',

            }

        );
        let reply = await resp.text();

        return JSON.parse(reply) as Entities.Transfer_State;

    }

     let __call= async function (Transfer_Cid_Or_PID: string, type: string) {

        let resp = await fetch(
            rdr() + `/ClientAPI/Transfer/${type}`  ,

            {
                body: JSON.stringify({ ID: Transfer_Cid_Or_PID }),
                method: 'POST',

            }

        );
        let reply = await resp.text();

        return JSON.parse(reply) as Entities.Protocol.TransferProcess|Entities.Protocol.TransferError;

    }

    let Start= async function (Transfer_Cid_Or_PID: string) {

        let ret = await __call(Transfer_Cid_Or_PID, "Start");
        return ret;

    }

    let Suspend= async function (Transfer_Cid_Or_PID: string) {

        let ret = await __call(Transfer_Cid_Or_PID, "Suspend");
        return ret;

    }
    let Complete= async function (Transfer_Cid_Or_PID: string) {

        let ret = await __call(Transfer_Cid_Or_PID, "Complete");
        return ret;

    }

    let Terminate= async function (Transfer_Cid_Or_PID: string) {

        let ret = await __call(Transfer_Cid_Or_PID, "Terminate");
        return ret;

    }

    return {
            Create,State: Status, Start, Suspend, Complete, Terminate
    };
   

}
function BEC_Read (rdr:()=>string){
    let Datasets= async function () {
        let resp = await fetch(
            rdr() + "/ClientAPI/View/Datasets",

            {
                method: 'GET'
            }

        );
        let reply = await resp.json() as any;
        return reply as Entities.Dataset_Report[];

    }

    let DatasetsAgreedTo= async function () {
        let resp = await fetch(
            rdr() + "/ClientAPI/View/DatasetsAgreedTo",

            {
                method: 'GET'
            }

        );
        let reply = await resp.json() as any;
        return reply as Entities.Dataset_Agreed_To_Report[];

    }

    let Search= async function (query: Messages.FederatedSearchQuery) {
        let resp = await fetch(
            rdr() + "/ClientAPI/Search",

            {
                body: JSON.stringify(query),
                method: 'POST'
            }

        );
        let reply0 = await resp.text() as any;
        let reply = JSON.parse(reply0);
        return reply as Entities.Protocol.Dataset[];

    }

    return {Datasets,DatasetsAgreedTo, Search}

}



function BEC_Saving_Operations (rdr:()=>string){
    let Upsert= async function (msg:Internal.Internal_Dataset) {
        let resp = await fetch(
            rdr() + "/ClientAPI/Upsert",

            {
                method: 'POST',
                body: JSON.stringify(msg)
            }

        );
        let reply = await resp.text();
        return reply ;

    }

   
    return {Upsert}

}



function New_Operations (rdr:()=>string){
    let Get_Endpoint= async function (msg:Messages.Get_Endpoint_MSG) {
        let resp = await fetch(
            rdr() + "/ClientAPI/Get_Endpoint",

            {
                method: 'POST',
                body: JSON.stringify(msg)
            }

        );
        let reply = await resp.json() as Messages.Get_Endpoint_RESPONSE;
        
        return reply ;

    }

   
    return {Get_Endpoint}

}
