    const express = require('express');
   const app = express();
    const { serverConfig } = require('./config');









   app.listen(serverConfig.PORT ,() => {
    console.log(`Server is running on port ${serverConfig.PORT}`);
   });

