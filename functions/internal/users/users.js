module.shareable = module.parent.shareable

//    /api/users/
const routes = require('express').Router()

routes.use('/', require('./user-info'))

module.exports = routes