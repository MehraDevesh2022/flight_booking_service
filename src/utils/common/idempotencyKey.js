

class IdempotencyManager {
    constructor() {
        this.idempotentStore = new Map();
        this.cache_ttl = 15 * 60  * 1000;

    }

    checkIdempotentKey(idempotencyKey) {

     let exist = this.idempotentStore.get(idempotencyKey)

         if(!exist) return {"notFound" : true , "expired" : false , "available" : false};
      
         if(Date.now() - exist.ttl >= this.cache_ttl){
            // this.idempotentStore.delete(idempotencyKey);
            return {"notFound" : false , "expired" : true , "available" : false};
         }
         return {"notFound" : false , "expired" : false , "available" : true};
    }


    setIdempotencyKey(idempotencyKey, response){
        
       return this.idempotentStore.set(idempotencyKey , {
        ttl : Date.now(),
        data : response
       }
       );
     }

} 

module.exports = IdempotencyManager
