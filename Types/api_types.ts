 



export namespace Messages {


    export interface FederatedSearchQuery {
        ParticipantID: string;
        Keywords: string[];
    }
    export type Negotiation__Begin_As_Consumer = {
        ID: string,
        ds_id: string;
        offer_id: string;
        Token: string;
        TCK_CID?: string;
        TCK_URL?: string;
    }


    export type Transfer__BeginAsConsumer =
        {
            ID: string
            AgreementID: string
            Format: string


        }



    // VALIDATION:
    // If trasnfer is specified the Agreement should to
    // If agreement is specified it must exists.   Then if Transfer also is then it should be long to id (todo: suspended)

    // EXECUTION:
    // if both agreement and transfer are specified attempt directly
    // if only agreement is specified attempt with a "random" existing transfer filtering by the agreement, and if none exists then create one (or start a suspended?)
    // if neither is specified attempt with a "random" agreement-transfer tuple (filtering by nothing) and if none can be found create both using the offer (or start a suspended transfer?)
    export type Get_Endpoint_MSG = {


        //Strategy: Get_Endpoint_Strategy,

        ID: string,
        DATASET_ID: string;
        Dist_Spec: string,






    } & (
            {
                AGREEMENT_ID: string;
                TRANSFER_ID: string;
            }

            |

            {
                AGREEMENT_ID: string;
            }
            |


            {

                AUTO_ACCEPT_OFFER_ID: string;
                AUTO_ACCEPT_Token: string;
            }
        )


    export type Get_Endpoint_RESPONSE = {
        ID: string,

    } &
        (
            {
                ok: false,
                Error: string,
                ErrorCode: Get_Endpoint_Error_Code
            }
            |
            {
                ok: true,
                ENDPOINT_URL: string;
                Used_Transfer_ID: string;
                Used_Agreement_ID: string;
                Agreement_Details: null | undefined


            }
        )

    export enum Get_Endpoint_Error_Code {


        Validation_Error,
        Transfer_Not_Found,
        Distribution_Not_Found,
        Failed_To_Create_Agreement,
        Failed_To_Create_Transfer,

        Generic,
    }

}

export namespace Responses {
    export interface Process_Created_Response {
        cID: string;
        Operation_Log: any;
    }
}


export namespace Entities {

    export namespace Protocol {

        export interface Dcat_Lang_Val {
            '@value': string;
            '@language': string;
        }
        export type Catalog = {
            '@context': string;
            '@id': string;
            '@type': string;
            'dct:title': string;
            'dcat:keyword': string[];
            'dcat:description': Dcat_Lang_Val[];
            'dataset': Dataset[];
            'service': DataService;
        }
        export interface Dataset {
            '@id': string;
            '@type': string;
            'dct:title': string;
            'dcat:keyword': string[];
            'dcat:description': Dcat_Lang_Val[];
            distribution: Distribution[];
            hasPolicy: ODRL_Policy[];
        }
        export interface Distribution {
            '@id': string;
            '@type': string;
            format: string;
            accessService: DataService;
        }

        export interface DataService {
            '@id': string;
            '@type': string;
            'endpointURL': string;
        }

        export interface ODRL_Rule {
            action: string;
            constraint?: ODRL_Constraint[];
        }


        export type IDSTS =
            "UNDEFINED" | "REQUESTED" | "STARTED" | "SUSPENDED" | "COMPLETED" | "TERMINATED";
        export type IDSNS =
            "CREATED" | "REQUESTED" | "OFFERED" | "ACCEPTED" | "AGREED" | "VERIFIED" | "FINALIZED" | "TERMINATED";


        // ODRL_Permission_Rule (inherits from ODRL_Rule)
        export interface ODRL_Permission_Rule extends ODRL_Rule {
            duty?: ODRL_Rule[];
        }

        // ODRL_Policy
        export type ODRL_Policy_Base = {
            "@type": string;
            "@id": string;
            target?: string;

            assignee?: string;
            assigner?: string;

            permission?: ODRL_Permission_Rule[];
            obligation?: ODRL_Rule[];
            prohibition?: ODRL_Rule[];
        }
        export type ODRL_Policy = ODRL_Policy_Base &
        {
            "dspace_ext:OfferDescription"?: string,
            "dspace_ext:timestamp": string
        }

        // ODRL_Constraint
        export interface ODRL_Constraint {
            leftOperand: string;
            operator: string;
            rightOperand: string;
            "odrl:unit"?: string;
        }

        export type TransferProcess = {
            providerPid: string;
            consumerPid: string;
            state: any
        }

        export type TransferError = {
            providerPid: string;
            consumerPid: string;
            reason: any[],
            code: string
        }

    }






    export type Negotiation_State =
        {

            State: Protocol.IDSNS,
            ID: string,
            cID: string,
            pID: string,
            Other_ID: string,
            Participant_ID: string,
            Participant_URL: string,
            My_URL: string,
            DS_ID: string,
            Offer: Protocol.ODRL_Policy,


            Token: string,
            Agreement: Protocol.ODRL_Policy
            Is_Provider: boolean
            Protocol: "Negotiation",
            Created: string

        }


    export type Transfer_State =
        {

            State: Protocol.IDSTS,
            ID: string,
            cID: string,
            pID: string,
            Other_ID: string,
            Participant_ID: string,
            Participant_URL: string,
            My_URL: string,
            DS_ID: string,
            Agreement_ID: string,
            Format: string,
            Agreement: Protocol.ODRL_Policy
            Is_Provider: boolean
            Protocol: "Transfer",
            Created: string

        }



    export type Transfer_Report = {
        cID: string;
        pID: string;
        state: any;
    }

    export type Agreement_Report = {
        Consumer: string;
        Agreement: Protocol.ODRL_Policy;
        Transfers: Transfer_Report[];
    }

    export type Dataset_Report = {
        Dataset: Protocol.Dataset;
        Agreements: Agreement_Report[];
    }

    export interface Dataset_Agreed_To_Report {
        DatasetID: string;
        Provider: string;
        Agreements: Agreement_Report[];
    }

}

export namespace Internal {


    export interface Internal_Dataset {
        Name: string;
        Metadata: Metadata_;
        Offers: Internal_DS_Offer[];
        HTTP_Service_Distribution: RESTDistribution;
        File_Distributions: FileDistribution[];
    }
    export interface Metadata_ {
        Tags: string[];
        Description: { [key: string]: string; };
    }

    export interface Internal_DS_Offer {
        Name: string;
        Obligations: IDS_Obligations;
        Permissions: IDS_Permissions;
        Prohibitions: IDS_Prohibitions;
    }

    export interface FileDistribution {
        //format?
        Name: string;
        IsDefault: boolean;
    }

    export interface RESTDistribution {
        Name: string;
        URL: string;
        Settings: REST_Settings_;
    }

    export interface REST_Settings_ {
        BaseAuth_User: string;
        BaseAuth_Password: string;
        Default_Query_Parameters: string;
    }

    ///////////////////
    ///////////////////
    ///////////////////
    ///////////////////
    ///////////////////
    export interface IDS_Permissions {
        Use: boolean;
        Read: boolean;
        Modify: boolean;
        Annotate: boolean;
        Extract: boolean;
        Index: boolean;
        Restrict_On_Days: number | null;
        Restrict_On_Interval_Start: string | null;
        Restrict_On_Interval_End: string | null;
    }



    export interface IDS_Obligations {
        Compensation_Amount: number | null;
        Delete_After_Days: number | null;
        Attribute: boolean;
        Certification__Token: boolean;
    }

    export interface IDS_Prohibitions {
        Modify: boolean;
        Distribute: boolean;
        Extract: boolean;
    }

    export enum IDS_Policy_Type {
        Offer,
        Agreement,
        Candidate_Offer,
        Template
    }

    export type IDS_Policy_Internal = Internal_DS_Offer & {
        ID: string; //????????????????? how to handle this
        Type: IDS_Policy_Type;



        //fields relevant based on policy type
        Target: string;
        Assignee: string;
        Assigner: string;
        Timestamp: string | null;

    }
}


 

export namespace CLI {

    export type Enroll_Participant_Spec = {
        PARTICIPANT_ID: string,
        URL: string
    }

    export type Enroll_Reply = {
        PARTICIPANT_ID: string,
        API_KEY: string
    }
    
}