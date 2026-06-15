 
import {  Messages } from "../Types/api_types.ts";
import { guid, Util } from "..//Util.ts";
 
 
import { assertEquals } from "@std/assert";
 
import { __TGE } from "./__Test_Get_Endpoints.ts";
import { boolCombos } from "./Util_Test.ts";
// We are using two connectors C1, C2 at local ports 5001,5002


 

Deno.test(" **********  Validation Checks ********** ", () => {

  return;

});
Deno.test("DS that does not exist", async () => {

  //let ret = await Scenario1();
  let res = await __TGE.Run_Scenario_Inner({
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
  let res = await __TGE.Run_Scenario_Inner({
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
  let res = await __TGE.Run_Scenario_Inner({
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
  let res = await __TGE.Run_Scenario_Inner({
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
  let res = await __TGE.Run_Scenario_Inner({
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


export async function Small_Test_Copy_To_Debug() {

  let special_check: __TGE.CheckAttempt = {
    "AG_E": true,
    "TR_E": false,
    "AG_SP": false,
    "TR_SP": false,
    "OF_SP": false
  };
  let expected = __TGE.Expected(special_check);
  let res = await __TGE.Run_Scenario(special_check);
  let errors = __TGE.Compare_Result_And_Expected(res, expected);





}

export async function Full_Test() {
  let test = [...boolCombos(5)];

  let test2 = test.map(x => __TGE.Create(x));


  let test3 = test2.map(x => ({ check: x, expected: __TGE.Expected(x) }));

  let test4 = test3.filter(x => x.expected == null).length;

  if(test4>0) throw "You didn't handle a case";

  
  let failed: { check: __TGE.CheckAttempt, expected: __TGE.CheckRes, got: Messages.Get_Endpoint_RESPONSE, errors: string[] }[] = [];

  let not_possible: __TGE.CheckAttempt[] = [];


  for (let i of test3) {

    if (i.expected.NotPossible == true) {
      not_possible.push(i.check);
      continue;
    }
    let res = await __TGE.Run_Scenario(i.check);
    let errors = __TGE.Compare_Result_And_Expected(res, i.expected);

    if (errors.length > 0) {
      failed.push({ ...i, got: res.ret, errors })
    }

  }

  let json = JSON.stringify({ not_possible, failed }, null, 4);
  console.log(json);
}
