/// <reference lib="deno.ns" />
 
import * as _ from "es-toolkit";
 

export function guid() {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
export namespace Util_IDS {
  
 
export function DS_ID(DATASPACE_NAME, Participant_ID: string, DATASET_NAME: string) {
  return `${DATASPACE_NAME}:${Participant_ID}:${DATASET_NAME}`;
}

export function Offer_ID(DS_ID: string, OfferName: string) {
  return `${DS_ID}:${OfferName}`;
}


}

export namespace Util {
  export function isNullOrWhiteSpace(val) { return (!val || val.length === 0 || /^\s*$/.test(val)); }

  export function base64UrlEncode(str) {
    // Step 1: Convert to base64 using btoa
    const base64 = btoa(unescape(encodeURIComponent(str)));

    // Step 2: Replace + with -, / with _ and remove padding
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
    export function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}
