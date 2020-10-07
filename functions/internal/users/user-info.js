const { config, db } = module.parent.shareable
const collectionsConfig = config.firestore.collections

const usersCollConfig = collectionsConfig.users
const usersCollFields = usersCollConfig.fields
const usersCollRef = db.collection(usersCollConfig.name)

//    /internal/users/
const routes = require('express').Router()

routes.post('/', addUser)
routes.post('/save-settings', saveSettings)

module.exports = routes

/////////////////////////////////////////////////////////////////////

const getUserById = id => {
  return new Promise(async resolve => {
    const doc = await usersCollRef.doc(id).get()
    resolve(doc.data())
  })
}

async function addUser(req, res) {
  const body = req.body
  const { id, username } = body.data
  console.log('POST /users', body)

  const doesExist = id && await getUserById(id)
  if (doesExist) {
    res.status(403).send()
    return
  }

  const now = Date.now()
  const player = {
    action: 'created',
    chest: 0,
    created: now,
    equipment: [],
    expansionsOwned: 'WRG1BEHFC2KUAMLNP',
    gold: 0,
    id,
    isAdmin: false,
    isGod: false,
    hasKey: false,
    health: 100,
    level: 1,
    location: 'the village',
    maxHealth: 100,
    potion: 0,
    restHealth: 0,
    status: 'about',
    substatus: 'idle',
    timerEnd: now,
    timerLength: 0,
    timerMessage: '',
    timerStart: now,
    timeZone: '',
    username
  }

  await usersCollRef.doc(id).set(player)
  res.status(200).json({ data: player })
}

async function saveSettings(req, res) {
  const body = req.body
  const { id, expansionsOwned, timezone } = body.data
  console.log(req.method, req.path, body)

  const doesExist = id && await getUserById(id)
  if (!doesExist) {
    res.status(403).send()
    return
  }

  await usersCollRef.doc(id).update({
    [usersCollFields.expansionsOwned.name]: expansionsOwned,
    [usersCollFields.timezone.name]: timezone,
  })
  res.status(200).send({data:{}})
}