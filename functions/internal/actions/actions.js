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
routes.use(performanceWrapperMiddleware)

// general
routes.post('/generate-options', generateOptions)
routes.post('/read-manual', markManualRead)
routes.post('/report-result', reportResult)
routes.post('/confirm-result', confirmResult)
routes.post('/dispute-result', disputeResult)

// village
routes.post('/to-fortress', toFortress)
routes.post('/hire-lyle', hireLyle)

// fortress
routes.post('/to-village', toVillage)
routes.post('/seek-encounter', seekEncounter)
routes.post('/visit-trading-post', visitTradingPost)
routes.post('/leave-trading-post', leaveTradingPost)
routes.post('/stand-ground', standGround)
routes.post('/retreat-downstairs', retreatDownstairs)
routes.post('/claim-key', claimKey)
routes.post('/siphon-potion', siphonPotion)
routes.post('/climb-stairs', climbStairs)
routes.post('/drink-potion', drinkPotion)
routes.post('/search-treasure', searchTreasure)
routes.post('/embrace-death', embraceDeath)
routes.post('/hire-convoy', hireConvoy)
routes.post('/buy-plasma-bots', buyEquipment)
routes.post('/buy-repair-bots', buyEquipment)
routes.post('/buy-defense-bots', buyEquipment)
routes.post('/take-rest', takeRest)

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
// adds req.chosenOption
async function verifyOptionMiddleware(req, res, next) {
  const chosenOption = req.path.substr(1)
  if ([
      'generate-options',
      'read-manual',
      'report-result',
      ].includes(chosenOption)) {
    next()
    return
  }

  const user = req.playerUser

  let encounter = {}
  if (user.encounterId) {
    const encounterDoc = await encountersCollRef.doc(user.encounterId).get()
    encounter = encounterDoc.data()
  }

  const availableOptions = utils.getOptions(user, encounter)
  const isChosenOptionValid = availableOptions.options
      .map(o => o.apiPath)
      .includes(chosenOption)

  if (isChosenOptionValid) {
    req.chosenOption = user.options.find(o => o.apiPath === chosenOption)
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
async function performanceWrapperMiddleware(req, res, next) {
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

async function standGround(req) {
  const { id, chest, equipment, health, maxHealth } = req.playerUser
  const optionValue = req.chosenOption.value
  const hasEquipment = utils.hasEquipment(equipment, 'defense bot')
  const fieldMap = hasEquipment ? {[usersCollFields.equipment.name]: utils.subtractEquipment(equipment, 'defense bot')} : {}
  const newMaxHp = maxHealth - (hasEquipment ? 1 : 2)
  const newHp = Math.min(Math.max(health - optionValue, 0), newMaxHp)
  return await updateUserFields(id, {
    ...fieldMap,
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: newHp,
    [usersCollFields.maxHealth.name]: newMaxHp,
    [usersCollFields.chest.name]: chest + Math.round(optionValue / 5)
  })
}

async function retreatDownstairs(req) {
  const { id, equipment, health, level, maxHealth } = req.playerUser
  const hasEquipment = utils.hasEquipment(equipment, 'defense bot')
  const fieldMap = hasEquipment ? {[usersCollFields.equipment.name]: utils.subtractEquipment(equipment, 'defense bot')} : {}
  const newMaxHp = maxHealth - (hasEquipment ? 1 : 2)
  return await updateUserFields(id, {
    ...fieldMap,
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: Math.min(health - req.chosenOption.value, newMaxHp),
    [usersCollFields.maxHealth.name]: newMaxHp,
    [usersCollFields.level.name]: level - 1
  })
}

async function claimKey(req) {
  const { id, chest } = req.playerUser
  return await updateUserFields(id, {
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.hasKey.name]: true,
    [usersCollFields.chest.name]: chest + Math.round(req.chosenOption.value / 4)
  })
}

async function siphonPotion(req) {
  const { id, equipment } = req.playerUser
  const optionValue = req.chosenOption.value
  let timerValue = optionValue
  const fieldMap = {}
  if (utils.hasEquipment(equipment, 'plasma bot')) {
    fieldMap[usersCollFields.equipment.name] = utils.subtractEquipment(equipment, 'plasma bot')
    timerValue /= 3
  }

  return await updateUserFields(id, {
    ...fieldMap,
    ...getTimerData(timerValue),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.potion.name]: optionValue
  })
}

async function drinkPotion(req) {
  const { id, health, maxHealth, potion } = req.playerUser
  const healAmount = Math.min(maxHealth - health, potion)
  return await updateUserFields(id, {
    ...getTimerData(healAmount),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: health + healAmount,
    [usersCollFields.potion.name]: potion - healAmount
  })
}

async function climbStairs(req) {
  const { id, level } = req.playerUser
  return await updateUserFields(id, {
    ...getTimerData(15),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.hasKey.name]: false,
    [usersCollFields.level.name]: level + 1
  })
}

async function searchTreasure(req) {
  const { id, chest, gold } = req.playerUser
  return await updateUserFields(id, {
    ...getTimerData(5),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.chest.name]: 0,
    [usersCollFields.gold.name]: gold + chest
  })
}

async function buyEquipment(req) {
  const { id, equipment, gold } = req.playerUser
  const { price, quantity, type } =  req.chosenOption.value
  return await updateUserFields(id, {
    [usersCollFields.gold.name]: gold  - price,
    [usersCollFields.equipment.name]: utils.addEquipment(equipment, type, quantity)
  })
}

async function embraceDeath(req) {
  const { id, level } = req.playerUser
  return await updateUserFields(id, {
    ...getTimerData((10 * level + 200)),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.chest.name]: 0,
    [usersCollFields.gold.name]: 0,
    [usersCollFields.hasKey.name]: false,
    [usersCollFields.health.name]: 0,
    [usersCollFields.maxHealth.name]: 100,
    [usersCollFields.level.name]: 1,
    [usersCollFields.location.name]: 'the village',
    [usersCollFields.potion.name]: 0,
  })
}

async function hireConvoy(req) {
  const { id, gold } = req.playerUser
  return await updateUserFields(id, {
    ...getTimerData(10),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.location.name]: 'the village',
    [usersCollFields.gold.name]: gold - req.chosenOption.value,
    [usersCollFields.maxHealth.name]: 100
  })
}

async function takeRest(req) {
  const { id, health, level, maxHealth, equipment } = req.playerUser
  const equipmentType = 'repair bot'
  const hasEquipment = utils.hasEquipment(equipment, equipmentType)
  const fieldMap = {}
  let timeVal = 80 + 2 * level
  if (hasEquipment) {
    [usersCollFields.equipment.name] = utils.subtractEquipment(equipment, equipmentType)
    timeVal -= 15
  }

  return await updateUserFields(id, {
    ...fieldMap,
    ...getTimerData(timeVal * 2),
    [usersCollFields.substatus.name]: hasEquipment ? 'resting repair bot' : 'resting',
    [usersCollFields.health.name]: Math.min(health + 2, maxHealth)
  })
}

async function hireLyle(req) {
  const { id, gold, health, maxHealth, timerEnd } = req.playerUser
  const passiveHeal = Math.floor((Date.now() - timerEnd) / 10000)
  const currentHealth = Math.max(health + passiveHeal, maxHealth)
  const activeHeal = Math.min(maxHealth - currentHealth, req.chosenOption.value)
  return await updateUserFields(id, {
    ...getTimerData(0),
    [usersCollFields.gold.name]: gold - activeHeal,
    [usersCollFields.health.name]: health + activeHeal
  })
}

async function toFortress(req) {
  const { id, health, maxHealth, timerEnd } = req.playerUser
  const passiveHeal = Math.floor((Date.now() - timerEnd) / 10000)
  return await updateUserFields(id, {
    ...getTimerData(10),
    [usersCollFields.location.name]: 'fortress oblivion',
    [usersCollFields.health.name]: Math.max(health + passiveHeal, maxHealth)
  })
}

async function toVillage(req) {
  await usersCollRef
      .doc(req.playerUser.id)
      .update({
        ...getTimerData(210),
        [usersCollFields.substatus.name]: 'idle',
        [usersCollFields.location.name]: 'the village',
        [usersCollFields.maxHealth.name]: 100
      })
}

async function seekEncounter(req) {
  const user = req.playerUser
  const userId = req.playerUser.id
  const userDocRef = usersCollRef.doc(userId)
  const time = Date.now()
  await userDocRef.update({
    [usersCollFields.queuedSince.name]: time,
    [usersCollFields.status.name]: 'queueing'
  })

  let queuedUserId = null
  const queuedUsers = await queueCollRef.get()
  queuedUsers.forEach(doc => {
    if (doc.exists) {
      queuedUserId = doc.id
    }
  })

  const promises = []
  if (!queuedUserId) {
    await queueCollRef.doc(userId).set(user)
    return
  }

  // todo this should eventually be matchmaking service
  const queuedUserDocRef = usersCollRef.doc(queuedUserId)
  const queuedUser = await queuedUserDocRef.get()
  if (queuedUser.data().status === 'queueing') {
    promises.push(queueCollRef.doc(queuedUserId).delete())

    const gameId = [Date.now(), ...[userId, queuedUserId].sort()].join('_')
    promises.push(encountersCollRef.doc(gameId).set({
      [encountersCollFields.format.name]: chooseRandomEncounterFormat(),
      [encountersCollFields.player1.name]: user,
      [encountersCollFields.player1Id.name]: userId,
      [encountersCollFields.player2.name]: queuedUser.data(),
      [encountersCollFields.player2Id.name]: queuedUserId,
      [encountersCollFields.playPace.name]: '48-hour',
      [encountersCollFields.start.name]: time,
    }))

    const fightingUpdateObj = {
      [usersCollFields.encounterId.name]: gameId,
      [usersCollFields.fightingSince.name]: time,
      [usersCollFields.status.name]: 'fighting',
    }
    promises.push(userDocRef.update(fightingUpdateObj))
    promises.push(queuedUserDocRef.update(fightingUpdateObj))
  }

  await Promise.all(promises)
}

async function reportResult(req, res) {
  const result = req.body.data.result
  const playerWon = result > 0
  const { encounterId, id } = req.playerUser
  const opponentId = encounterId.split('_').slice(1).find(s => s !== id)

  const encounterDocRef = encountersCollRef.doc(encounterId)
  const encounterDoc = await encounterDocRef.get()

  const encounter = encounterDoc.data()
  await updateUserFields(id, {
    [usersCollFields.status.name]: 'deciding',
    [usersCollFields.substatus.name]: playerWon ? 'post-win' : 'post-loss',
    [usersCollFields.encounterResult.name]: result
  })

  if (encounter.result) {
    const message = 'results already entered for encounter'
    console.error(message, encounterId)
    res.status(400).send(message)
    return
  }

  await encounterDocRef.update({
    [encountersCollFields.end.name]: Date.now(),
    [encountersCollFields.result.name]: Math.abs(result),
    [encountersCollFields.winner.name]: playerWon ? id : opponentId,
    [encountersCollFields.loser.name]: playerWon ? opponentId : id,
  })
  await updateUserFields(opponentId, {
    [usersCollFields.status.name]: 'deciding',
    [usersCollFields.substatus.name]: 'post-encounter',
    [usersCollFields.encounterResult.name]: result * -1
  })
}

async function confirmResult(req) {
  await actOnEncounterResult(req.playerUser, true)
}

async function disputeResult(req) {
  await actOnEncounterResult(req.playerUser, false)
}

/////////////////////////////////////////////////////////////////////

async function actOnEncounterResult(player, isConfirmed) {
  const { id, encounterId, encounterResult } = player
  const fieldToUpdate = isConfirmed ? encountersCollFields.resultConfirmed : encountersCollFields.resultDisputed
  await updateUserFields(id, {
    [usersCollFields.status.name]: 'deciding',
    [usersCollFields.substatus.name]: encounterResult > 0 ? 'post-win' : 'post-loss'
  })
  await encountersCollRef.doc(encounterId).update({
    [fieldToUpdate.name]: true,
  })
}

function getUserById(id) {
  return new Promise(async resolve => {
    const doc = await usersCollRef.doc(id).get()
    resolve(doc.data())
  })
}

function getTimerData(timerLength) {
  const now = Date.now()
  const ret = {
    [usersCollFields.timerEnd.name]: now + timerLength * 1000,
    [usersCollFields.timerLength.name]: timerLength,
    [usersCollFields.timerStart.name]: now
  }
  if (timerLength) {
    ret[usersCollFields.status.name] = 'timing'
  }
  return ret
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