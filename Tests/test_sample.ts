import {  Create_Atlantis_IDS_Client } from "../Client.ts";
import { guid, Util } from "..//Util.ts";

// We are using two connectors C1, C2 at local ports 5001,5002
let delay = 2000;


async function Big_Test() {

  let client1 = Create_Atlantis_IDS_Client("WASABI_EVAL_SINTEF", "TEST_SINTEF", "http://127.0.0.1:5001");
  let client2 = Create_Atlantis_IDS_Client("WASABI_EVAL_SINTEF", "TEST_SYXIS", "http://127.0.0.1:5002");
  //Display all local datasets of C1
  let all_C1_local = await client1.Datasets.Local();
  let C1 = "TEST_SINTEF";
  let C2 = "TEST_SYXIS";
  //C1 runs a federated query targeting C2 and Datasets containing the keyword Waste
  let c1_search = await client1.Search({
    ParticipantID: C2,
    Keywords: ["Waste"]
  });

  //We will delay between calls to let the DSP process state machines to run


  // Use the first found datase
  let first_C2_Dataset = c1_search[0];

  //Agree to its second offer and obtain the ID of the Negotiation Process
  console.log(`Agreeing`);
  let data = await client1.Agree(first_C2_Dataset["@id"], first_C2_Dataset.hasPolicy[1]["@id"]);
  console.log(`Negotiation cID: ${data.cID}`);

  //Agree to its second offer and obtain the ID of the Negotiation Process
  let state1 = await client1.Manage.Negotiations.State(data.cID);
  console.log(`Negotiation State: ${state1.State}`);

  //Wait for the DSP Negotiation Process to take place
  console.log(`Waiting ${delay} ms`);
  await Util.sleep(delay);

  //Check the current Negotiation Process State
  let state2 = await client1.Manage.Negotiations.State(data.cID);
  console.log(`Negotiation State: ${state2.State}`);

  //Assuming that the Agreement has been obtained after the delay it should be available in the Agreement property
  let agreement = state2.Agreement;

  console.log(`Agreement ID: ${agreement["@id"]}`);

  //Create a Transfer using  the Agreement 
  console.log(`Creating Transfer`);
  let create_Transfer = await client1.Create_Transfer(agreement["@id"], "");
  console.log(`Created Transfer: ${create_Transfer.cID}`);

  //Check Transfer State
  let trans_state1 = await client1.Manage.Transfers.State(create_Transfer.cID);
  console.log(`Transfer State: ${trans_state1.State}`);

  //Wait for the DSP Negotiation Process to take place
  console.log(`Waiting ${delay} ms`);
  await Util.sleep(delay);

  //Check Transfer State again
  let trans_state2 = await client1.Manage.Transfers.State(create_Transfer.cID);
  console.log(`Transfer State: ${trans_state2.State}`);


  //Atempt to Suspend the Transfer directly, wait for the DSP process and check state
  console.log(`Suspending Transfer`);
  let res_susp = await client1.Manage.Transfers.Suspend(create_Transfer.cID);
  console.log(`Result : ${res_susp["state"]}`);
  console.log(`Waiting ${delay} ms`);
  await Util.sleep(delay);
  let trans_state3 = await client1.Manage.Transfers.State(create_Transfer.cID);
  console.log(`Transfer State: ${trans_state3.State}`);


  //Atempt to Start the Transfer directly, wait for the DSP process and check state
  console.log(`Starting Transfer Again`);
  let resp_start = await client1.Manage.Transfers.Start(create_Transfer.cID);
  console.log(`Result : ${resp_start["state"]}`);
  console.log(`Waiting ${delay} ms`);
  await Util.sleep(delay);
  let trans_state4 = await client1.Manage.Transfers.State(create_Transfer.cID);
  console.log(`Transfer State: ${trans_state4.State}`);

  //Attempt to Complete the Transfer directly, wait for the DSP process and check state
  // console.log(`Complete Transfer `);
  // let resp_compl= await client1.Manage.Transfers.Complete(create_Transfer.cID);
  // console.log(`Result : ${resp_compl["state"]}`);
  // console.log(`Waiting ${delay} ms`);
  // await Util.sleep(delay);
  // let trans_status5= await client1.Manage.Transfers.State(create_Transfer.cID);
  // console.log(`Transfer State: ${trans_status5.State}`);

  //Check the current Datasets, Agreed To Datasets for each connector
  let c1_local = await client1.Datasets.Local();
  let c2_local = await client2.Datasets.Local();

  let c1_agreed_to = await client1.Datasets.AgreedTo();
  let c2_agreed_to = await client2.Datasets.AgreedTo();



  console.log("done");

}