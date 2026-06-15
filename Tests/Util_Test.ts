import { Atlantis_IDS_Client, Create_Atlantis_IDS_Client } from "../Client.ts"; 
import { Entities, Internal, Messages } from "../Types/api_types.ts";
import { guid, Util } from "../Util.ts";
 

// We are using two connectors C1, C2 at local ports 5001,5002
 
let delay = 2000;

export function Sample_Dataset(Name: string) {


  let ret: Internal.Internal_Dataset = {
    Name: Name,
    Metadata: {
      Tags: ["tag1", "tag2"],
      Description: {
        ["en"]: "In this json dictionary, the key is a language code the value is a textual description of the dataset",
        ["el"]: "Στο json dictionary  για κάθε κωδικό γλώσσας μπορεί να μπει μια περιγραφή του dataset",
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
      URL: "https://localhost:8090",
      Settings: undefined
    },
    File_Distributions: [


      { Name: "File", IsDefault: true },
      { Name: "AnotherFile", IsDefault: false },


    ]
  };

  return ret;

}


export async function Perform_Agreement_Negotiation(client1:Atlantis_IDS_Client, ds_id:string, offer_id:string) {
  //console.log(`Agreeing`);
  let data = await client1.Agree(ds_id, offer_id);
//console.log(`Negotiation cID: ${data.cID}`);
 
  //Wait for the DSP Negotiation Process to take place
  //console.log(`Waiting ${delay} ms`);
  await Util.sleep(delay);

  //Check the current Negotiation Process State
  let state2 = await client1.Manage.Negotiations.State(data.cID);
  //console.log(`Negotiation State: ${state2.State}`);

  //Assuming that the Agreement has been obtained after the delay it should be available in the Agreement property
 

  return state2;
}

export function* boolCombos(n: number): Generator<boolean[]> {
    for (let mask = 0; mask < (1 << n); mask++) {
        yield Array.from(
            { length: n },
            (_, i) => !!(mask & (1 << i)),
        );
    }
}


export async function Perform_Τransfer_Negotiation(client1:Atlantis_IDS_Client, agreement_id:string) {
  //console.log(`Agreeing`);
  let data = await client1.Create_Transfer(agreement_id,"format");
 
  await Util.sleep(delay);

   
  let state2 = await client1.Manage.Transfers.State(data.cID);
  
  let ret = state2;

  return ret;
}
export function Simple_Timestamp() {
  let date = new Date();
  return date.getHours() + "-" + new Date().getMinutes() + "-" + new Date().getSeconds()
}
