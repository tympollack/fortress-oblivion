const { config, db, utils } = module.parent.shareable
const collectionsConfig = config.firestore.collections

const usersCollConfig = collectionsConfig.users
const usersCollFields = usersCollConfig.fields
const usersCollRef = db.collection(usersCollConfig.name)

const worldCollConfig = collectionsConfig.world
const worldCollFields = worldCollConfig.fields
const worldCollRef = db.collection(worldCollConfig.name)

const worldStateDocRef = worldCollRef.doc(worldCollConfig.reserved.state)
const queueCollConfig = collectionsConfig.queue
const queueCollFields = queueCollConfig.fields
const queueCollRef = worldStateDocRef.collection(queueCollConfig.name)

const encountersCollConfig = collectionsConfig.encounters
const encountersCollFields = encountersCollConfig.fields
const encountersCollRef = worldStateDocRef.collection(encountersCollConfig.name)

//    /internal/actions/
const routes = require('express').Router()

routes.use(userWrapperMiddleware)
routes.use(verifyOptionMiddleware)
routes.use(verifyTimerMiddleware)
routes.use(versionHistoryMiddleware)
routes.use(timerWrapperMiddleware)

// general
routes.post('/read-manual', markManualRead)
routes.post('/generate-options', generateOptions)

// village
routes.post('/to-fortress', toFortress)

// fortress
routes.post('/to-village', toVillage)
routes.post('/seek-encounter', seekEncounter)
routes.post('/visit-trading-post', visitTradingPost)
routes.post('/leave-trading-post', leaveTradingPost)

module.exports = routes

/////////////////////////////////////////////////////////////////////

// adds req.playerUser
async function userWrapperMiddleware(req, res, next) {

  console.log(req.user)
  console.log(req.method, req.path, req.body)
  const id = req.body.data.id
  const user = await getUserById(id)
  if (user) {
    req.playerUser = user
    const ret = await next()
    if (!res.headersSent) {
      res.status(200).json({ data: ret || {} })
    }
  } else {
    console.error('user id not found', id)
    res.status(404).send()
  }
}

// requires req.playerUser
async function verifyOptionMiddleware(req, res, next) {
  const chosenOption = req.path.substr(1)
  if (['generate-options', 'read-manual'].includes(chosenOption)) {
    next()
    return
  }

  const user = req.playerUser
  const availableOptions = utils.getOptions(user)
  const isChosenOptionValid = availableOptions.options
      .map(o => o.apiPath)
      .includes(chosenOption)

  if (isChosenOptionValid) {
    next()
  } else {
    const message = 'invalid option attempted'
    console.error(message, user.id, chosenOption, availableOptions)
    res.status(400).send(`${message}, this event has been logged`)
  }
}

// requires req.playerUser
async function verifyTimerMiddleware(req, res, next) {
  const user = req.playerUser
  if (Date.now() - user.timerStart >= user.timerLength * 1000) {
    next()
  } else {
    const message = 'action attempted before timer expiry'
    console.error(message, user.id, req.path)
    res.status(400).send(`${message}, this event has been logged`)
  }
}

// requires req.playerUser
async function versionHistoryMiddleware(req, res, next) {
  const user = req.playerUser
  const action = req.path.substr(1)
  usersCollRef.doc(user.id)
      .collection('version-history')
      .doc(`${Date.now()}_${action}`)
      .set({
        ...user,
        action: action
      })
  next()
}

// should be last called
async function timerWrapperMiddleware(req, res, next) {
  const start = Date.now();
  await next()
  console.log(req.path, 'finished in', Date.now() - start, 'ms')
}

/////////////////////////////////////////////////////////////////////

async function markManualRead(req) {
  return await updateStatus(req.playerUser.id, 'deciding')
}

async function visitTradingPost(req) {
  return await updateSubstatus(req.playerUser.id, 'trading')
}

async function leaveTradingPost(req) {
  return await updateSubstatus(req.playerUser.id, 'idle')
}

async function generateOptions(req) {
  return await updateStatus(req.playerUser.id, 'deciding')
}

async function toFortress(req) {
  console.log(this.$timestamp)
  await usersCollRef
      .doc(req.playerUser.id)
      .update({
        ...getTimerData(15),
        [usersCollFields.location.name]: 'fortress oblivion'
      })
}

async function toVillage(req) {
  await usersCollRef
      .doc(req.playerUser.id)
      .update({
        ...getTimerData(15),
        [usersCollFields.location.name]: 'the village'
      })
}

async function seekEncounter(req) {
  let queuedUserId
  const queuedUsers = await queueCollRef.get()
  queuedUsers.forEach(doc => {
    if (doc.exists) {
      queuedUserId = doc.id
    }
  })

  const time = Date.now()
  const promises = []
  const userId = req.playerUser.id
  const userDocRef = usersCollRef.doc(userId)
  if (queuedUserId) {
    const queuedUserDocRef = usersCollRef.doc(queuedUserId)
    const queuedUser = await queuedUserDocRef.get()
    console.log(queuedUser.data())
    if (queuedUser.data().status === 'queueing') {
      promises.push(queueCollRef.doc(queuedUserId).delete())

      const user = await userDocRef.get()
      const gameId = [Date.now(), ...[userId, queuedUserId].sort()].join('_')
      console.log(gameId)
      promises.push(encountersCollRef.doc(gameId).set({
        [encountersCollFields.format.name]: chooseRandomEncounterFormat(),
        [encountersCollFields.player1.name]: user.data(),
        [encountersCollFields.player1Id.name]: userId,
        [encountersCollFields.player2.name]: queuedUser.data(),
        [encountersCollFields.player2Id.name]: queuedUserId,
        [encountersCollFields.playPace.name]: '48 hour',
        [encountersCollFields.start.name]: time,
      }))

      const fightingUpdateObj = {
        [usersCollFields.encounterId.name]: gameId,
        [usersCollFields.fightingSince.name]: time,
        [usersCollFields.status.name]: 'fighting'
      }
      promises.push(userDocRef.update(fightingUpdateObj))
      promises.push(queuedUserDocRef.update(fightingUpdateObj))
    }
  } else {
    promises.push(queueCollRef.doc(userId).set({ id: userId }))
    promises.push(userDocRef.update({
      [usersCollFields.queuedSince.name]: time,
      [usersCollFields.status.name]: 'queueing'
    }))
  }

  await Promise.all(promises)
}

/////////////////////////////////////////////////////////////////////

function getUserById(id) {
  return new Promise(async resolve => {
    const doc = await usersCollRef.doc(id).get()
    resolve(doc.data())
  })
}

function getTimerData(timerLength) {
  return {
    [usersCollFields.status.name]: 'timing',
    [usersCollFields.timerLength.name]: timerLength,
    [usersCollFields.timerStart.name]: Date.now()
  }
}

function chooseRandomEncounterFormat() {
  return `${getRandomSubstring('VWR', 1)}-${getRandomSubstring('G1BEHFC2KUALN')}`
}

function getRandomSubstring(str, minChars) {
  const chars = []
  do {
    for (const c of str) {
      if (Math.round(Math.random())) {
        chars.push(c)
      }
    }
  } while(chars.length < minChars)
  return chars.join('')
}

async function updateStatus(id, status) {
  return await updateUserFields(id, { [usersCollFields.status.name]: status })
}

async function updateSubstatus(id, substatus) {
  return await updateUserFields(id, { [usersCollFields.substatus.name]: substatus })
}

async function updateUserFields(id, fieldMap) {
  return await usersCollRef.doc(id).update(fieldMap)
}