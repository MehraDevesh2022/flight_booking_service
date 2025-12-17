const cron  = require("node-cron");

function cronSchedulder(){
    const {BookingController} = require("../../controllers/index"); // IMPORT INSIDE to prevent circular import issue
    cron.schedule("*/15 * * * * *" , async () => {
       try {
         await BookingController.cancelBookings();
         console.log("CRON SUCCESSFULLY RUNT AT :" , new Date());
         
       } catch (error) {
        console.error("SOMTHIN WENT WRONG WITH cancelBookings CRON :" , error);
        
       }
    })
}

module.exports = {
  cronSchedulder
}