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

const internalApiApp = express()
addExpressMiddleware(internalApiApp)
const internalApiRouter = express.Router()
internalApiRouter.use('/actions/', require('./internal/actions/actions'))
internalApiRouter.use('/admin-service/', require('./internal/admin-service/admin-service'))
internalApiRouter.use('/game-events/', require('./internal/game-events/game-events'))
internalApiRouter.use('/users/', require('./internal/users/users'))
internalApiApp.use(utils.tryCatchAsync)
internalApiApp.use(internalApiRouter) // must be after others
exports.internal = functions.https.onRequest(internalApiApp)

const apiApp = express()
apiApp.use(cors)
const apiRouter = express.Router()
apiRouter.use('/', require('./api/api'))
apiApp.use(utils.tryCatchAsync)
apiApp.use(apiRouter) // must be after others
exports.api = functions.https.onRequest(apiApp)

exports.firestoreReactive = require('./firestore/firestore-reactive')