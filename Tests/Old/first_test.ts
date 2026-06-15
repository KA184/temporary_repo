import { Atlantis_IDS_Client, Create_Atlantis_IDS_Client } from "../../Client.ts";
 
import { Entities, Internal, Messages } from "../../Types/api_types.ts";
import { guid, Util ,Util_IDS} from "../../Util.ts";
 
import { Perform_Agreement_Negotiation, Perform_Τransfer_Negotiation, Sample_Dataset, Simple_Timestamp } from "../Util_Test.ts";
import { assertEquals } from "@std/assert";
import { match, P } from 'ts-pattern';

// We are using two connectors C1, C2 at local ports 5001,5002



async function Create_Test(Scenario: string, Add_Agreement: boolean, Add_Transfer: boolean) {
  let client1 = Create_Atlantis_IDS_Client("WASABI_EVAL_SINTEF", "TEST_SINTEF", "http://127.0.0.1:5001");
  let client2 = Create_Atlantis_IDS_Client("WASABI_EVAL_SINTEF", "TEST_SYXIS", "http://127.0.0.1:5002");



  let dataset = Sample_Dataset(`TEST${Scenario}_` + Simple_Timestamp());
  let ds_id = Util_IDS.DS_ID(client1.Dataspace_Name, client1.Participant_ID, dataset.Name);
  let offer_id = Util_IDS.Offer_ID(ds_id, "Offer1");
  let res = await client1.Mod_Ops.Upsert(dataset);

  let agreement_id = null;
  let transfer_id = null;

  if (Add_Agreement) {
    let agreement_state = await Perform_Agreement_Negotiation(client2, ds_id, offer_id);
    agreement_id = agreement_state.Agreement["@id"];

    if (Add_Transfer) {
      let transfer = await Perform_Τransfer_Negotiation(client2, agreement_id)
      transfer_id = transfer.cID;

    }

  }

  return { client1, client2, ds_id, offer_id, agreement_id, transfer_id }

}


Deno.test(" **********  Validation Checks ********** ", () => {

  return;

});
Deno.test("DS that does not exist", async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: false,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: null,
        Dist_Spec: "REST",
        AGREEMENT_ID: null,
        TRANSFER_ID: "",

        AUTO_ACCEPT_OFFER_ID: null,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });

  assertEquals(res.ret.ok, false);
  if (res.ret.ok == false) {
    assertEquals(res.ret.ErrorCode + "", Messages.Get_Endpoint_Error_Code[Messages.Get_Endpoint_Error_Code.Validation_Error]);
  }
  console.log(JSON.stringify(res.ret, null, 4));




});

//todo:
Deno.test("Bad DS, currently a generic error because it can take time to scan the dataspace ", async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: false,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: "dsfsdfg",
        Dist_Spec: "REST",
        AGREEMENT_ID: "",
        TRANSFER_ID: "",

        AUTO_ACCEPT_OFFER_ID: null,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });

  assertEquals(res.ret.ok, false);
  if (res.ret.ok == false) {
    assertEquals(res.ret.ErrorCode + "", Messages.Get_Endpoint_Error_Code[Messages.Get_Endpoint_Error_Code.Generic]);
  }
  console.log(JSON.stringify(res.ret, null, 4));




});



Deno.test("Bad Agreement that does not exist", async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: false,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: "fs",
        TRANSFER_ID: "",

        AUTO_ACCEPT_OFFER_ID: setup.offer_id,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });

  assertEquals(res.ret.ok, false);
  if (res.ret.ok == false) {
    assertEquals(res.ret.ErrorCode + "", Messages.Get_Endpoint_Error_Code[Messages.Get_Endpoint_Error_Code.Validation_Error]);
  }
  console.log(JSON.stringify(res.ret, null, 4));




});


Deno.test("Agreement exists we specified transfer that does not exist", async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: true,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: setup.agreement_id,
        TRANSFER_ID: "hfghf",

        AUTO_ACCEPT_OFFER_ID: null,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });

  assertEquals(res.ret.ok, false);
  if (res.ret.ok == false) {
    assertEquals(res.ret.ErrorCode + "", Messages.Get_Endpoint_Error_Code[Messages.Get_Endpoint_Error_Code.Validation_Error]);
  }
  console.log(JSON.stringify(res.ret, null, 4));




});


Deno.test("Bad Offer", async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: false,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: null,
        TRANSFER_ID: null,

        AUTO_ACCEPT_OFFER_ID: "fsdfsdg",
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });
  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, false);
  if (res.ret.ok == false) {
    assertEquals(res.ret.ErrorCode + "", Messages.Get_Endpoint_Error_Code[Messages.Get_Endpoint_Error_Code.Generic]);
  }





});


Deno.test(" **********  With existing Agreement And Transfer********** ", () => {

  return;

});

Deno.test(`Agreement [Y] Transfer [Y] |Specify: Agreement [N] Transfer [N] |  Auto Offer [Y]`, async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: true,
    Transfer: true,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: setup.agreement_id,
        TRANSFER_ID: setup.transfer_id,


        AUTO_ACCEPT_OFFER_ID: setup.offer_id,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });


  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, false);

  if (res.ret.ok == false) {
    assertEquals(res.ret.ErrorCode + "", Messages.Get_Endpoint_Error_Code[Messages.Get_Endpoint_Error_Code.Validation_Error]);

  }



});

Deno.test(`Agreement [Y] Transfer [Y] |Specify: Agreement [Y] Transfer [Y] |  Auto Offer [N]`, async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: true,
    Transfer: true,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: setup.agreement_id,
        TRANSFER_ID: setup.transfer_id,


        AUTO_ACCEPT_OFFER_ID: null,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });


  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);

  if (res.ret.ok) {
    assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);
    assertEquals(res.ret.Used_Transfer_ID, res.setup.transfer_id);
  }



});

Deno.test(`Agreement [Y] Transfer [Y] |Specify: Agreement [Y] Transfer [N] |  Auto Offer [N]`, async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: true,
    Transfer: true,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: setup.agreement_id,
        TRANSFER_ID: null,


        AUTO_ACCEPT_OFFER_ID: null,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });


  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);

  if (res.ret.ok) {
    assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);
    assertEquals(res.ret.Used_Transfer_ID, res.setup.transfer_id);
  }



});

Deno.test(`Agreement [Y] Transfer [Y] |Specify: Agreement [N] Transfer [N] |  Auto Offer [N]`, async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: true,
    Transfer: true,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: null,
        TRANSFER_ID: null,


        AUTO_ACCEPT_OFFER_ID: null,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });


  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);

  if (res.ret.ok) {
    assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);
    assertEquals(res.ret.Used_Transfer_ID, res.setup.transfer_id);
  }



});

Deno.test(`Agreement [Y] Transfer [Y] |Specify: Agreement [N] Transfer [N] |  Auto Offer [Y (ignored)]`, async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: true,
    Transfer: true,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: null,
        TRANSFER_ID: null,


        AUTO_ACCEPT_OFFER_ID: setup.offer_id,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });


  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);

  if (res.ret.ok) {
    assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);
    assertEquals(res.ret.Used_Transfer_ID, res.setup.transfer_id);
  }



});

Deno.test(" **********  With existing Agreement ********** ", () => {

  return;

});

Deno.test("Agreement [Y] Transfer [N] | Specify: Agreement [Y] Transfer [N] | Auto Offer [N]", async () => {

  let res = await Run_Scenario({
    Agreement: true,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: setup.agreement_id,
        TRANSFER_ID: null,
        AUTO_ACCEPT_OFFER_ID: setup.offer_id,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });
  //let ret = await Scenario3();
  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);

  if (res.ret.ok) {
    assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);

  }

});
Deno.test("Agreement [Y] Transfer [N] | Specify: Agreement [Y] Transfer [N] | Auto Offer [Y]", async () => {

  let res = await Run_Scenario({
    Agreement: true,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: setup.agreement_id,
        TRANSFER_ID: null,
        AUTO_ACCEPT_OFFER_ID: setup.offer_id,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });
  //let ret = await Scenario3();
  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);

  if (res.ret.ok) {
    assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);

  }

});
Deno.test(`Agreement [Y] Transfer [N] |Specify: Agreement [N] Transfer [N] |  Auto Offer [Y ]`, async () => {

  //let ret = await Scenario1();
  let res = await Run_Scenario({
    Agreement: true,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",


        AUTO_ACCEPT_OFFER_ID: setup.offer_id,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });


  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);

  if (res.ret.ok) {
    assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);

  }


});



Deno.test(" **********  With NO existing Agreement ********** ", () => {

  return;

});
Deno.test("Agreement [N] Transfer [N] | Specify: Agreement [N] Transfer [N] | Auto Offer [N]", async () => {

  let res = await Run_Scenario({
    Agreement: false,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: null,
        TRANSFER_ID: null,
        AUTO_ACCEPT_OFFER_ID: null,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });
  //let ret = await Scenario3();
  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, false);
  if (res.ret.ok == false) {
    assertEquals(res.ret.ErrorCode + "", Messages.Get_Endpoint_Error_Code[Messages.Get_Endpoint_Error_Code.Transfer_Not_Found]);
  }


});


Deno.test("Agreement [N] Transfer [N] | Specify: Agreement [N] Transfer [N] | Auto Offer [Y]", async () => {

  let res = await Run_Scenario({
    Agreement: false,
    Transfer: false,

    MSG: (setup) => {
      let msg: Messages.Get_Endpoint_MSG = {
        ID: guid(),
        DATASET_ID: setup.ds_id,
        Dist_Spec: "REST",
        AGREEMENT_ID: null,
        TRANSFER_ID: null,
        AUTO_ACCEPT_OFFER_ID: setup.offer_id,
        AUTO_ACCEPT_Token: null
      };
      return msg;
    }
  });
  //let ret = await Scenario3();
  console.log(JSON.stringify(res.ret, null, 4));
  assertEquals(res.ret.ok, true);
  // assertEquals(res.ret.Used_Agreement_ID, res.setup.agreement_id);



});


export async function Run_Scenario({ Agreement, Transfer, MSG, sleep = 3000 }: { Agreement: boolean, Transfer: boolean, MSG: (setup: Awaited<ReturnType<typeof Create_Test>>) => Messages.Get_Endpoint_MSG, sleep?: number }) {

  //####################**********  NOTHING SPECIFIED "FULL" mode, no agreement exists


  let setup = await Create_Test("Testing_Get_Endpoints", Agreement, Transfer);



  await Util.sleep(sleep);


  let msg = MSG(setup);

  let ret = await setup.client2.Get_Endpoint(msg);

  return { setup, ret };

}

 




