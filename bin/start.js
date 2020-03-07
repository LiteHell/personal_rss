#!node
const webapp = require('../src/web'),
      config = require('../config.json')
webapp.listen(config.httpPort, () => {
    console.log('Now Listening on ' + config.httpPort);
});