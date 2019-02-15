#!node
let webapp = require('../src/web'),
    config = require('../config.json')
webapp.listen(config.httpPort, () => {
    console.log('listening')
});