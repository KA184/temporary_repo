import { Atlantis_IDS_Client, Create_Atlantis_IDS_Client } from "../Client.ts";
 
import { Entities, Internal, Messages } from "../Types/api_types.ts";
import { guid, Util, Util_IDS } from "../Util.ts";

import { Perform_Agreement_Negotiation, Perform_Τransfer_Negotiation, Sample_Dataset, Simple_Timestamp } from "./Util_Test.ts";
import { match, P } from 'ts-pattern';

// We are using two connectors C1, C2 at local ports 5001,5002


async function Create_Test(Scenario: string, Add_Agreement: boolean, Add_Transfer: boolean) {
  let client1 = Create_Atlantis_IDS_Client( "WASABI_EVAL_SINTEF","TEST_SINTEF", "http://127.0.0.1:5001");
  let client2 = Create_Atlantis_IDS_Client( "WASABI_EVAL_SINTEF","TEST_SYXIS", "http://127.0.0.1:5002");



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





export namespace __TGE {


  export type CheckAttempt = {
    AG_E: boolean,
    TR_E: boolean,
    AG_SP: boolean,
    TR_SP: boolean,
    OF_SP: boolean
  }

  export type CheckRes = {

    NotPossible?: boolean,
    Ok: boolean,
    Used_Existing_AG: boolean,
    Used_Existing_TR: boolean,
    //Used_Existing_TR:boolean,
    //Ok_With_Added:boolean,
    Error_Code: Messages.Get_Endpoint_Error_Code | null

  }

  export function Create(perm: boolean[]): CheckAttempt {
    return {
      AG_E: perm[0],
      TR_E: perm[1],
      AG_SP: perm[2],
      TR_SP: perm[3],
      OF_SP: perm[4]
    }
  }
  export function Expected2(check: CheckAttempt): CheckRes {


    let not_possible: CheckRes = {
      Ok: true,
      NotPossible: true,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: null
    }
    let created_ret: CheckRes = {
      Ok: true,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: null
    }


    let existing_ret_full: CheckRes = {
      Ok: true,
      Used_Existing_AG: true,
      Used_Existing_TR: true,
      Error_Code: null
    }

    let existing_ret_ag: CheckRes = {
      Ok: true,
      Used_Existing_AG: true,
      Used_Existing_TR: false,
      Error_Code: null
    }

    let validation_error: CheckRes = {
      Ok: false,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: Messages.Get_Endpoint_Error_Code.Validation_Error
    }

    let no_match_error: CheckRes = {
      Ok: false,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: Messages.Get_Endpoint_Error_Code.Transfer_Not_Found
    }

    let early_Exit_not_possible = match(check)
      .returnType<CheckRes | null>()
      .with({ AG_E: false, TR_E: true }, (val) => not_possible)
      .otherwise((x) => null);
    if (early_Exit_not_possible != null) {
      return early_Exit_not_possible
    }

    //block all messages that have tr but not ar specified
    let early_Exit_tr_not_ar = match(check)
      .returnType<CheckRes | null>()
      .with({ AG_SP: false, TR_SP: true }, (val) => validation_error)
      .otherwise((x) => null);
    if (early_Exit_tr_not_ar != null) {
      return early_Exit_tr_not_ar
    }
    //block all messages that have specified and have offer
    let early_Exit_No_Offer_When_At_Least_AG_Specified = match(check)
      .returnType<CheckRes | null>()
      .with({ AG_SP: true, OF_SP: true }, (val) => validation_error)
      .otherwise((x) => null);
    if (early_Exit_No_Offer_When_At_Least_AG_Specified != null) {
      return early_Exit_No_Offer_When_At_Least_AG_Specified
    }

    if (check.AG_E && check.TR_E) {
      return existing_ret_full;


    }
    else if (check.AG_E) {
      let ret = match(check)
        .returnType<CheckRes | null>()

        //************ specify both      
        //error since it will not be attempted

        //no error since it exists

        .with({ TR_SP: true }, (val) => validation_error)

        //************ specify agreement only
        //Not sure if this is a validation error     
        .with({ AG_SP: P._ }, (val) => existing_ret_ag)



        .otherwise((x) => null);

      return ret;

    }
    else {
      let ret = match(check)
        .returnType<CheckRes | null>()

        //************ specify both      
        //error since it will not be attempted

        //no error since it exists
        .with({ TR_SP: true }, (val) => validation_error)
        .with({ AG_SP: true }, (val) => validation_error)
        //************ specify agreement only
        //Not sure if this is a validation error     
        .with({ OF_SP: true }, (val) => created_ret)
        .with({ OF_SP: false }, (val) => no_match_error)



        .otherwise((x) => null);

      return ret;
    }
  }


  export function Expected(check: CheckAttempt): CheckRes {


    let not_possible: CheckRes = {
      Ok: true,
      NotPossible: true,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: null
    }
    let created_ret: CheckRes = {
      Ok: true,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: null
    }


    let existing_ret_full: CheckRes = {
      Ok: true,
      Used_Existing_AG: true,
      Used_Existing_TR: true,
      Error_Code: null
    }

    let existing_ret_ag: CheckRes = {
      Ok: true,
      Used_Existing_AG: true,
      Used_Existing_TR: false,
      Error_Code: null
    }

    let validation_error: CheckRes = {
      Ok: false,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: Messages.Get_Endpoint_Error_Code.Validation_Error
    }

    let no_match_error: CheckRes = {
      Ok: false,
      Used_Existing_AG: false,
      Used_Existing_TR: false,
      Error_Code: Messages.Get_Endpoint_Error_Code.Transfer_Not_Found
    }




    let ret = match(check)
      .returnType<CheckRes | null>()


      .with({ AG_E: false, TR_E: true }, (val) => not_possible)

      .with({ AG_SP: false, TR_SP: true }, (val) => validation_error)
      .with({ TR_E: false, TR_SP: true }, (val) => validation_error)
      .with({ AG_SP: true, OF_SP: true }, (val) => validation_error)
      .with({ AG_E: false, /*TR_E: false,*/ AG_SP: true }, (val) => validation_error)
      //.with({ AG_E: true, TR_E: false, TR_SP: true }, (val) => validation_error)

      .with({ AG_E: true, TR_E: true }, (val) => existing_ret_full)



      .with({ AG_E: true, TR_E: false }, (val) => existing_ret_ag)

      //************ specify agreement only
      //Not sure if this is a validation error     
      .with({ AG_E: false, TR_E: false, OF_SP: false }, (val) => no_match_error)
      .with({ AG_E: false, TR_E: false, OF_SP: true }, (val) => created_ret)



      .otherwise((x) => null);

    return ret;





  }
  export function Compare_Result_And_Expected(
    res: Awaited<ReturnType<typeof Run_Scenario>>,

    expected: CheckRes) {

    let errors = [];
    //console.log(JSON.stringify(res.ret, null, 4));
    if (res.ret.ok != expected.Ok) {
      errors.push("Different OK")
    }

    if (res.ret.ok == false) {

      let er_code_string = Messages.Get_Endpoint_Error_Code[expected.Error_Code];
      if (er_code_string != (res.ret.ErrorCode + ""))
        errors.push("Wrong Error Code")
    }

    else {
      if (expected.Used_Existing_AG) {

        if (!(res.ret.Used_Agreement_ID, res.setup.agreement_id)) {
          errors.push("Agreement_ID not correct");
        }
      }
      if (expected.Used_Existing_TR) {
        if (!(res.ret.Used_Transfer_ID, res.setup.transfer_id)) {
          errors.push("Transfer_ID not correct");
        }

      }

    }
    return errors;
  }

  export async function Run_Scenario_Inner({ Agreement, Transfer, MSG, sleep = 3000 }: { Agreement: boolean, Transfer: boolean, MSG: (setup: Awaited<ReturnType<typeof Create_Test>>) => Messages.Get_Endpoint_MSG, sleep?: number }) {

    //####################**********  NOTHING SPECIFIED "FULL" mode, no agreement exists


    let setup = await Create_Test("Testing_Get_Endpoints", Agreement, Transfer);



    await Util.sleep(sleep);


    let msg = MSG(setup);

    let ret = await setup.client2.Get_Endpoint(msg);

    return { setup, ret };

  }

  export async function Run_Scenario(check: CheckAttempt) {




    //let res.ret = await Scenario1();
    let res = await Run_Scenario_Inner({
      Agreement: check.AG_E,
      Transfer: check.TR_E,

      MSG: (setup) => {
        let msg: Messages.Get_Endpoint_MSG = {
          ID: guid(),
          DATASET_ID: setup.ds_id,
          Dist_Spec: "REST",
          AGREEMENT_ID: check.AG_SP ? (setup.agreement_id ?? "RANDOM_SINCE_IT_NOT_EXISTS") : null,
          TRANSFER_ID: check.TR_SP ? (setup.transfer_id ?? "RANDOM_SINCE_IT_NOT_EXISTS") : null,

          AUTO_ACCEPT_OFFER_ID: check.OF_SP ? setup.offer_id : null,
          AUTO_ACCEPT_Token: null
        };
        return msg;
      }
    });

    return res;


  }


}

