const shareable = module.parent.shareable
const config = shareable.config
const db = shareable.db

const collectionConfig = config.firestore.collections.users
const collectionFields = config.firestore.collections.users.fields
const collRef = db.collection(collectionConfig.name)

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
  const availableOptions = getOptions(user)
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
  collRef.doc(user.id)
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
  await collRef
      .doc(req.playerUser.id)
      .update({ [collectionFields.status.name]: 'deciding' })
}

async function generateOptions(req) {
  const user = req.playerUser
  const options = getOptions(user)
  await collRef
      .doc(user.id)
      .update({
        [collectionFields.status.name]: 'deciding',
        [collectionFields.options.name]: options.options,
        [collectionFields.optionsTitle.name]: options.optionsTitle
      })
}

async function toFortress(req) {
  console.log(this.$timestamp)
  await collRef
      .doc(req.playerUser.id)
      .update({
        ...getTimerData(15),
        [collectionFields.location.name]: 'fortress oblivion'
      })
}

async function toVillage(req) {
  await collRef
      .doc(req.playerUser.id)
      .update({
        ...getTimerData(15),
        [collectionFields.location.name]: 'the village'
      })
}

/////////////////////////////////////////////////////////////////////

function getUserById(id) {
  return new Promise(async resolve => {
    const doc = await collRef.doc(id).get()
    resolve(doc.data())
  })
}

function getTimerData(timerLength) {
  return {
    [collectionFields.status.name]: 'timing',
    [collectionFields.timerLength.name]: timerLength,
    [collectionFields.timerStart.name]: Date.now()
  }
}

function getOptions(user) {

  let optionsTitle = ''
  const options = []
  const addOption = (apiPath, description) => {
    options.push({ apiPath, description })
  }

  switch (user.location) {
    case 'the village':
      optionsTitle = `you are ${user.health < user.maxHealth ? "resting" : "waiting"} in the village`
      addOption('to-fortress', 'head to the fortress')
      break;

    case 'fortress oblivion':
      addOption('to-village', 'back to the village')
      break;
  }

  return { options, optionsTitle}
}