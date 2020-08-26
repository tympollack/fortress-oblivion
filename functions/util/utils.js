const db = require('../firestore/init')

exports.newPromise = promise => {
    return new Promise((resolve, reject) => {
        promise().then(() => { resolve() }, e => { reject(e) })
    })
}

// for use with firestore
exports.batchPromise = (batchData, method = 'set') => {
    return this.newPromise(() => {
        const batch = db.batch()
        for (let i = 0, len = batchData.length; i < len; i++) {
            const d = batchData[i]
            batch[method](d.docRef, d.data)
        }
        return batch.commit()
    })
}

exports.roundTo = (n, digits = 0) => {
    let negative = false
    if (n < 0) {
        negative = true
        n *= -1
    }
    const multiplier = Math.pow(10, digits)
    n = parseFloat((n * multiplier).toFixed(11))
    n = (Math.round(n) / multiplier).toFixed(2)
    n = negative ? (n * -1).toFixed(digits) : n
    return parseFloat(n)
}

exports.pluralize = (noun, count) => {
    return count === 1 ? noun : (noun + 's')
}

exports.tryCatchAsync = async (req, res, next) => {
    try {
        await next()
    } catch (e) {
        const easter = '' + e
        console.error(easter)
        res.status(500).send(easter)
    }
}

exports.sendHttpResponse = (res, httpResponse = { status:200, clean:'' }) => {
    res.status(httpResponse.status).send(httpResponse.clean)
}

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
exports.validateFirebaseIdToken = async (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token')

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.')
        res.status(403).send('Unauthorized')
        return
    }

    let idToken
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header')
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else if(req.cookies) {
        console.log('Found "__session" cookie')
        // Read the ID Token from cookie.
        idToken = req.cookies.__session
    } else {
        // No cookie
        res.status(403).send('Unauthorized')
        return
    }

    try {
        const decodedIdToken = await module.parent.shareable.admin.auth().verifyIdToken(idToken)
        console.log('ID Token correctly decoded', decodedIdToken)
        req.user = decodedIdToken
        next()
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error)
        res.status(403).send('Unauthorized')
    }
}