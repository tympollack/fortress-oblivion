const config = require('./config/config').get()
const express = require('express')
const cors = require('cors')({ origin: true })
const admin = require('firebase-admin')
const functions = require('firebase-functions');
require('firebase')
require('firebase/firestore')

const db = require('./firestore/init')
const utils = require('./util/utils')

module.shareable = {
    admin: admin,
    config: config,
    cors: cors,
    db: db,
    functions: functions,
    url: config.url.base + config.url.apiPath,
    utils: utils,
}

function addExpressMiddleware(app) {
    app.use(cors)
    if (process.env.NODE_ENV === 'production') app.use(utils.validateFirebaseIdToken)
}

exports.test = functions.https.onRequest(async(req, res) => {
    res.send('poop')
})

const apiApp = express()
addExpressMiddleware(apiApp)
const apiRouter = express.Router()
apiRouter.use('/users/', require('./api/users/users'))
apiApp.use(utils.tryCatchAsync)
apiApp.use(apiRouter) // must be after others
exports.api = functions.https.onRequest(apiApp)