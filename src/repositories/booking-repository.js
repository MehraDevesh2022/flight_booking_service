const {CrudRepository} = require("./index")

class BookingRepository extends CrudRepository {
       constructor(model){
        super(model)
       }
}


module.exports = BookingRepository;