//  Producer
// ================

// Start (Few) Permissions - Few Prohibitions

// ... add permissions /prohibitons ...

// Max Permissions - Max Prohibitions


// Consumer
// ================

// Start (many) Permissions - Few prohibitons

// ... remove permissions / add prohibitions ...

// Min Permissions - Max prohibitions


// 1. Consumer sends first offer
// 2. Producer replies with which are the prohibitions for the offer that matches what Permissions the Consumer asked
// 3. Consumer checks if the he can accept with these prohibitons ANYWHERE, if yes then OK if not then moves to his next offer



type Permission = number;
type Obligation = number;

let Permissions = {
    A: 1 as Permission, B: 2 as Permission, C: 3 as Permission, D: 4 as Permission, E: 5 as Permission
}

let Obligations = {
    A: 1 as Obligation, B: 2 as Obligation, C: 3 as Obligation, D: 4 as Obligation, E: 5 as Obligation
}

type Incremental_Producer = {
    Add_Permissions: Permission[], Add_Obligations: Obligation[]
}

type Incremental_Consumer = {
    Remove_Permissions: Permission[], Add_Accepted_Obligations: Obligation[]
}

type Consumer_Setup = {
    Start_Permissions: Permission[],
    Start_Accepted_Obligations: Obligation[],

    Steps: Incremental_Consumer[]
}

type Consumer_State = number;

type Producer_Setup = {
    Steps: Incremental_Producer[]
}

type Offer = {
    Permissions: Permission[],
    Obligations: Obligation[]
}

let producer_config: Producer_Setup = {
    Steps: [

        {
            Add_Permissions: [Permissions.A, Permissions.B],
            Add_Obligations: [Obligations.A]
        },

        {
            Add_Permissions: [Permissions.C],
            Add_Obligations: [Obligations.B],
        },
        {
            Add_Permissions: [Permissions.D],
            Add_Obligations: [Obligations.E],
        },

    ]
};



let consumer_config: Consumer_Setup = {
    Start_Permissions: [Permissions.A, Permissions.B, Permissions.C, Permissions.D],
    Start_Accepted_Obligations: [Permissions.A],
    Steps: [
        {
            Remove_Permissions: [],
            Add_Accepted_Obligations: [Obligations.B]
        },
        {
            Remove_Permissions: [Permissions.D],
            Add_Accepted_Obligations: []
        }
    ]
};


export function Test_Expanded() {
    let test_prod = Fn.Expand_To_Offers_Producer(producer_config);
    let test_cons = Fn.Expand_To_Offers_Consumer(consumer_config);
    console.log({test_prod,test_cons});
}


type Log= 
{type:"error", message:string, by:string} |
{type:"accepted",by:string} |
{type:"msg",by:string, Offer:Offer}

export function Test2() {

    
    let const_state:Consumer_State=0;
    let current_offer:Offer|null=null;
    let ret:Log[]=[];
    for(let i=0;i<10000;i++){
        if(ret.length==4){
            let a=5;
        }
        let cons_reply=Fn.Consumer.Accept_Or_Counter(current_offer,const_state,consumer_config);
       
        if(cons_reply.res=="Error"){
            ret.push({type:"error", message:cons_reply.message, by:"Consumer"});
            //console.log("Consumer error:" + cons_reply.message );
            break;
        }
        else if(cons_reply.res=="Accepted"){
            ret.push({type:"accepted",  by:"Consumer"}) ; 
            //console.log("Consumer accepted:" + JSON.stringify(current_offer,null,4) );
            break;
        }
        else{
           
            current_offer = cons_reply.Offer; 
            const_state= cons_reply.NextStep;
            ret.push({type:"msg", Offer:current_offer!, by:"Consumer"}) ; 
            
        }

         let prod_reply=Fn.Producer.Accept_Or_Counter(current_offer,producer_config);

        if(prod_reply.res=="Error"){
            ret.push({type:"error", message:prod_reply.message, by:"Producer"});
            // console.log("Producer error:" + prod_reply.message );
            break;
        }
        else if(prod_reply.res=="Accepted"){
            ret.push({type:"accepted",  by:"Producer"}) ; 
            //console.log("Producer accepted:" + JSON.stringify(current_offer,null,4) );
            break;
        }
        else{
            
            current_offer = prod_reply.Offer; 
            ret.push({type:"msg", Offer:current_offer!, by:"Producer"}) ; 
            
        }

    }


    let ret2= ret.map(x=>Fn.Print_Log(x));
    let ret3= JSON.stringify(ret2);
    return ret3;

}


type Cons_Ret = { res: "Accepted" } | { res: "Send", Offer: Offer, NextStep: Consumer_State } | { res: "Error", message: string };
type Prod_Ret = { res: "Accepted" } | { res: "Send", Offer: Offer } | { res: "Error", message: string };

namespace Fn {

    export function Expand_To_Offers_Producer(c: Producer_Setup): Offer[] {

        let ret: Offer[] = [];
        let cur: Offer = {
            Permissions: [],
            Obligations: []
        };
        for (let i of c.Steps) {
            cur.Permissions.push(...i.Add_Permissions);
            cur.Obligations.push(...i.Add_Obligations);
            ret.push(JSON.parse(JSON.stringify(cur)));
        }

        return ret;
    }
    export function Expand_To_Offers_Consumer(c: Consumer_Setup): Offer[] {

        let ret: Offer[] = [];
        let cur: Offer = {
            Permissions: [...c.Start_Permissions],
            Obligations: [...c.Start_Accepted_Obligations]
        };
        ret.push(JSON.parse(JSON.stringify(cur)));
        for (let i of c.Steps) {
            cur.Permissions = cur.Permissions.filter(x => !i.Remove_Permissions.includes(x));
            cur.Obligations.push(...i.Add_Accepted_Obligations);
            ret.push(JSON.parse(JSON.stringify(cur)));
        }

        return ret;
    }

    export function Satisfies_Producer(incoming_Offer: Offer, target: Offer) {
        //the set of target permissions is larger or equal than offer permissions
        let test_permissions = incoming_Offer.Permissions.every(x => target.Permissions.includes(x));

        //the set of target obligations is smaller   than offer obligation 
        // =>
        //   the set of offer obligations   larger or equal than the target obligations  ]
        let test_obligations =
           // offer.Obligations.length > target.Obligations.length
            //&&
            target.Obligations.every(x => incoming_Offer.Obligations.includes(x));

        return test_permissions && test_obligations;
    }

    export function Satisfies_Consumer(incoming_Offer: Offer, target: Offer) {
        //the set of offer permissions is larger or equal than target permissions
        let test_permissions = target .Permissions.every(x => incoming_Offer.Permissions.includes(x));

        //the set of offer obligations is smaller or equal than  target obligations
        // =>
        //   the set of  target obligations obligations is  larger or equal than the offer obligations  ]
        let test_obligations =
           // offer.Obligations.length > target.Obligations.length
            //&&
            incoming_Offer.Obligations.every(x => target.Obligations.includes(x));

        return test_permissions && test_obligations;
    }

    export function Contains_Obligations(offer: Offer, target: Offer) {
        
        // the target  contains all the obligations 
        let test_obligations =
            
            offer.Obligations.every(x => target.Obligations.includes(x));

        return test_obligations;
    }

    export function Print_Offer(offer:Offer, from:string=""){
        return `${from==""?"":("From : "+from)} : Permissions ${JSON.stringify(offer.Permissions)} | Obligations: ${JSON.stringify(offer.Obligations)}`;

    }

    export function Print_Log(log:Log){
        if(log.type=="error"){
            return `Error from ${log.by} : ${log.message}`;
        }
        else if(log.type=="accepted"){
            return `Accepted from ${log.by} `;
        }
        else{
            return Print_Offer(log.Offer, log.by);
        }

       
    }

    export namespace Producer {
        export function Accept_Or_Counter(offer: Offer ,   conf: Producer_Setup): Prod_Ret {
             let expanded_offers = Expand_To_Offers_Producer(conf);
            
             
            if (offer == null) {
                return { res: "Error", message: "Can not respond without a consumer offer", };
            }
            //first check if the conditions in the offer are accepted

            for (let i = 0; i < expanded_offers.length; i++) {
                if (Satisfies_Producer(offer, expanded_offers[i])) {
                    return { res: "Accepted", }
                }
            }

            // can not satify therefore we chose the closest in terms of what the offer declares as allowed obligations
              for (let i = 0; i < expanded_offers.length; i++) {
                if (Contains_Obligations(offer, expanded_offers[i])) {
                    return { res: "Send",Offer:expanded_offers[i] }
                }
            }

            // return the last one 
              return { res: "Send",Offer:expanded_offers[expanded_offers.length-1] }

          
        }
    }

    export namespace Consumer {
        export function Accept_Or_Counter(offer: Offer | null, nextStep: Consumer_State, conf: Consumer_Setup): Cons_Ret {
            if (nextStep == 0 && offer != null) {
                return { res: "Error", message: "Can not start with a prod message" };
            }

            let expanded_offers = Expand_To_Offers_Consumer(conf);
            if (nextStep == 0) {
                return { res: "Send", Offer: expanded_offers[nextStep], NextStep: 1 };
            }

            //state>1
            if (offer == null) {
                return { res: "Error", message: "Can not respond after stage 0 without a prod message", };
            }
            //first check if the conditions in the offer are accepted

            for (let i = 0; i < expanded_offers.length; i++) {
                if (Satisfies_Consumer(offer, expanded_offers[i])) {
                    return { res: "Accepted", }
                }
            }

            let cur_attempt = expanded_offers[nextStep];
            if (cur_attempt == null) {
                return { res: "Error", message: "Can not establish agreement", };
            }
            let counter: Cons_Ret = {
                res: "Send",
                Offer: cur_attempt,
                NextStep: nextStep + 1
            };
            return counter;
        }
    }
}