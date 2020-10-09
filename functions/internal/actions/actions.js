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
routes.use(applyDeltaMiddleware)
routes.use(passiveHealingMiddleware)

// general
routes.post('/generate-options', generateOptions)
routes.post('/read-manual', markManualRead)
routes.post('/see-alert', markAlertSeen)
routes.post('/report-result', reportResult)
routes.post('/confirm-result', confirmResult)
routes.post('/dispute-result', disputeResult)

// village
routes.post('/to-fortress', toFortress)
routes.post('/hire-lyle', hireLyle)

// fortress
routes.post('/to-village', toVillage)
routes.post('/seek-encounter', seekEncounter)
routes.post('/abandon-queue', abandonQueue)
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
routes.post('/no-op', noOperation)

routes.use(sendBack)

module.exports = routes

/////////////////////////////////////////////////////////////////////

// adds req.playerUser
async function userWrapperMiddleware(req, res, next) {

  // console.log(req.user)
  console.log(req.method, req.path, req.body)
  const id = req.body.data.id
  const user = await getUserById(id)
  if (user) {
    req.playerUser = user
    await next()
    if (!res.headersSent) {
      res.status(200).json({ data: {} })
    }
  } else {
    console.error('user id not found', id)
    res.status(404).send()
  }
}

// requires req.playerUser
// adds req.chosenOption
async function verifyOptionMiddleware(req, res, next) {
  req.start = Date.now();
  const chosenOption = req.path.substr(1)
  const user = req.playerUser
  user.action = chosenOption

  if ([
      'abandon-queue',
      'generate-options',
      'no-op',
      'read-manual',
      'report-result',
      'see-alert',
      ].includes(chosenOption)) {
    next()
    return
  }

  let encounter = {}
  if (user.encounterId) {
    const encounterDoc = await encountersCollRef.doc(user.encounterId).get()
    encounter = encounterDoc.data()
  }

  const availableOptions = utils.getOptions(user, encounter)
  const isChosenOptionValid = availableOptions.options
      .filter(o => !o.disabled)
      .map(o => o.apiPath)
      .includes(chosenOption)

  if (isChosenOptionValid) {
    req.chosenOption = user.options.find(o => o.apiPath === chosenOption)
    next()
  } else {
    const message = 'invalid option attempted'
    console.error(message, user.id, chosenOption, availableOptions)
    sendError(res, `${message}, this event has been logged`)
  }
}

// requires req.playerUser
async function verifyTimerMiddleware(req, res, next) {
  const user = req.playerUser
  const timeSince = (Date.now() - user.timerStart) / 1000
  if (timeSince >= user.timerLength) {
    next()
  } else if (timeSince >= user.timerLength + 10) {
    console.log('timer leniency shown', user.id, req.path)
    next()
  } else {
    const message = 'action attempted before timer expiry'
    console.error(message, user.id, req.path)
    sendError(res, `${message}, this event has been logged`)
  }
}

// requires req.playerUser
async function applyDeltaMiddleware(req, res, next) {
  const user = req.playerUser
  const { delta, deltaApplied } = user
  if (delta) {
    if (deltaApplied) {
      req.playerUser[usersCollFields.deltaMessage.name] = ''
    } else {
      req.playerUser = {
        ...user,
        ...delta,
        [usersCollFields.deltaApplied.name]: true
      }
    }
  }
  next()
}

// requires req.playerUser
async function passiveHealingMiddleware(req, res, next) {
  const user = req.playerUser
  const isUserInVillage = user.location === 'the village'
  if (isUserInVillage || user.substatus.includes('resting')) {
    const maxHealthGain = isUserInVillage ? user.maxHealth : 6
    const restingRate = isUserInVillage
        ? 10
        : ((user.substatus.includes('repair bot') ? 65 : 80) + 2 * user.level)

    const timeSince = (Date.now() - user.timerEnd) / 1000
    const gainedHealth = Math.min(Math.round(timeSince / (restingRate * 60)), maxHealthGain)
    const initHealth = typeof user.restHealth === 'undefined' ? user.health : user.restHealth
    user.health = Math.min(initHealth + gainedHealth, user.maxHealth)
  }
  next()
}

// afterware
async function sendBack(req, res, next) {
  if (!res.headersSent) {
    res.status(200).json({data: req.ret || {}})
  }
  console.log(req.path, 'finished in', Date.now() - req.start, 'ms')
  next()
}

/////////////////////////////////////////////////////////////////////

async function markManualRead(req) {
  return await updateUserFields(req, { [usersCollFields.status.name]: 'deciding' })
}

async function markAlertSeen(req, res, next) {
  const val = await updateUserFields(req, { [usersCollFields.playerAlertSeen.name]: true })
  doNext(req, res, next, val)
}

async function visitTradingPost(req, res, next) {
  const val = await updateUserFields(req, { [usersCollFields.substatus.name]: 'trading' })
  doNext(req, res, next, val)
}

async function leaveTradingPost(req, res, next) {
  const val = await updateUserFields(req, { [usersCollFields.substatus.name]: 'idle' })
  doNext(req, res, next, val)
}

async function generateOptions(req, res, next) {
  const val = await updateUserFields(req, { [usersCollFields.status.name]: 'deciding' })
  doNext(req, res, next, val)
}

async function noOperation(req, res, next) {
  const val = await updateUserFields(req)
  doNext(req, res, next, val)
}

async function standGround(req, res, next) {
  const { chest, equipment, health, maxHealth } = req.playerUser
  const optionValue = req.chosenOption.value
  const hasEquipment = utils.hasEquipment(equipment, 'defense bot')
  const fieldMap = hasEquipment ? {[usersCollFields.equipment.name]: utils.subtractEquipment(equipment, 'defense bot')} : {}
  const newMaxHp = maxHealth - (hasEquipment ? 1 : 2)
  const newHp = Math.min(Math.max(health - optionValue, 0), newMaxHp)
  const val = await updateUserFields(req, {
    ...fieldMap,
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: newHp,
    [usersCollFields.maxHealth.name]: newMaxHp,
    [usersCollFields.chest.name]: chest + Math.round(optionValue / 5)
  })
  doNext(req, res, next, val)
}

async function retreatDownstairs(req, res, next) {
  const { equipment, health, level, maxHealth } = req.playerUser
  const hasEquipment = utils.hasEquipment(equipment, 'defense bot')
  const fieldMap = hasEquipment ? {[usersCollFields.equipment.name]: utils.subtractEquipment(equipment, 'defense bot')} : {}
  const newMaxHp = maxHealth - (hasEquipment ? 1 : 2)
  const val = await updateUserFields(req, {
    ...fieldMap,
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: Math.min(health - req.chosenOption.value, newMaxHp),
    [usersCollFields.maxHealth.name]: newMaxHp,
    [usersCollFields.level.name]: level - 1
  })
  doNext(req, res, next, val)
}

async function claimKey(req, res, next) {
  const val = await updateUserFields(req, {
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.hasKey.name]: true,
    [usersCollFields.chest.name]: req.playerUser.chest + Math.round(req.chosenOption.value / 4)
  })
  doNext(req, res, next, val)
}

async function siphonPotion(req, res, next) {
  const { equipment } = req.playerUser
  const optionValue = req.chosenOption.value
  let timerValue = optionValue
  const fieldMap = {}
  if (utils.hasEquipment(equipment, 'plasma bot')) {
    fieldMap[usersCollFields.equipment.name] = utils.subtractEquipment(equipment, 'plasma bot.')
    timerValue /= 3
  }

  const val = await updateUserFields(req, {
    ...fieldMap,
    ...getTimerData(timerValue, 'siphoning a potion.'),
    ...getDelta(`you got a potion for ${optionValue} health!`,{
      [usersCollFields.potion.name]: optionValue
    }),
    [usersCollFields.substatus.name]: 'idle',
  })
  doNext(req, res, next, val)
}

async function drinkPotion(req, res, next) {
  const { health, maxHealth, potion } = req.playerUser
  const healAmount = Math.min(maxHealth - health, potion)
  const val = await updateUserFields(req, {
    ...getTimerData(healAmount, 'drinking your potion.'),
    ...getDelta(`you healed ${healAmount} health!`,{
      [usersCollFields.health.name]: health + healAmount,
      [usersCollFields.potion.name]: potion - healAmount
    }),
    [usersCollFields.substatus.name]: 'idle',
  })
  doNext(req, res, next, val)
}

async function climbStairs(req, res, next) {
  const deltaLevel = req.playerUser.level + 1
  const val = await updateUserFields(req, {
    ...getTimerData(15, 'climbing the stairs.'),
    ...getDelta(`you've reached level ${deltaLevel}!`,{
      [usersCollFields.hasKey.name]: false,
      [usersCollFields.level.name]: deltaLevel
    }),
    [usersCollFields.substatus.name]: 'idle',
  })
  doNext(req, res, next, val)
}

async function searchTreasure(req, res, next) {
  const { chest, gold } = req.playerUser
  const val = await updateUserFields(req, {
    ...getTimerData(5, 'searching for treasure.'),
    ...getDelta(`you found ${chest} coins!`,{
      [usersCollFields.chest.name]: 0,
      [usersCollFields.gold.name]: gold + chest
    }),
    [usersCollFields.substatus.name]: 'idle',
  })
  doNext(req, res, next, val)
}

async function buyEquipment(req, res, next) {
  const { equipment, gold } = req.playerUser
  const { price, quantity, type } =  req.chosenOption.value
  const val = await updateUserFields(req, {
    [usersCollFields.gold.name]: gold  - price,
    [usersCollFields.equipment.name]: utils.addEquipment(equipment, type, quantity)
  })
  doNext(req, res, next, val)
}

async function embraceDeath(req, res, next) {
  const val = await updateUserFields(req, {
    ...getTimerData(10 * req.playerUser.level + 200, 'being dragged back to the village.'),
    ...getDelta(),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.chest.name]: 0,
    [usersCollFields.hasKey.name]: false,
    [usersCollFields.health.name]: 0,
    [usersCollFields.maxHealth.name]: 100,
    [usersCollFields.restHealth.name]: 0,
    [usersCollFields.level.name]: 1,
    [usersCollFields.location.name]: 'the village',
    [usersCollFields.potion.name]: 0,
  })
  doNext(req, res, next, val)
}

async function hireConvoy(req, res, next) {
  const { chosenOption, playerUser } = req
  const { gold, health } = playerUser
  const val = await updateUserFields(req, {
    ...getTimerData(10, 'riding to the village.'),
    ...getDelta('', {
      [usersCollFields.location.name]: 'the village',
      [usersCollFields.maxHealth.name]: 100,
      [usersCollFields.restHealth.name]: health,
    }),
    [usersCollFields.gold.name]: gold - chosenOption.value,
    [usersCollFields.substatus.name]: 'idle',
  })
  doNext(req, res, next, val)
}

async function takeRest(req, res, next) {
  const { health, level, maxHealth, equipment } = req.playerUser
  const resultantHealth = Math.min(health + 2, maxHealth)
  const equipmentType = 'repair bot'
  const hasEquipment = utils.hasEquipment(equipment, equipmentType)
  const fieldMap = {}
  let timeVal = 80 + 2 * level
  if (hasEquipment) {
    [usersCollFields.equipment.name] = utils.subtractEquipment(equipment, equipmentType)
    timeVal -= 15
  }

  const val = await updateUserFields(req, {
    ...fieldMap,
    ...getTimerData(timeVal * 2, 'resting in the fortress.'),
    ...getDelta(`you've restored 2 hp.`,{
      [usersCollFields.substatus.name]: hasEquipment ? 'resting repair bot' : 'resting',
      [usersCollFields.health.name]: resultantHealth,
      [usersCollFields.restHealth.name]: resultantHealth,
    })
  })
  doNext(req, res, next, val)
}

async function hireLyle(req, res, next) {
  const { gold, health, maxHealth } = req.playerUser
  const activeHeal = Math.max(Math.min(maxHealth - health, req.chosenOption.value), 0)
  const resultantHealth = health + activeHeal
  const val = await updateUserFields(req, {
    ...getTimerData(0, 'being healed.'),
    ...getDelta(`you have been healed for ${activeHeal} health!`),
    [usersCollFields.gold.name]: gold - activeHeal,
    [usersCollFields.health.name]: resultantHealth,
    [usersCollFields.restHealth.name]: resultantHealth,
  })
  doNext(req, res, next, val)
}

async function toFortress(req, res, next) {
  const val = await updateUserFields(req, {
    ...getTimerData(10, 'heading to The Fortress Oblivion. Good luck..'),
    ...getDelta(`you reached the fortress unscathed.`, {
      [usersCollFields.location.name]: 'fortress oblivion'
    })
  })
  doNext(req, res, next, val)
}

async function toVillage(req, res, next) {
  const val = await updateUserFields(req, {
    ...getTimerData(210, 'walking to the village.'),
    ...getDelta(`you arrived in the village.`,{
      [usersCollFields.location.name]: 'the village',
      [usersCollFields.maxHealth.name]: 100,
      [usersCollFields.restHealth.name]: req.playerUser.health,
    }),
    [usersCollFields.substatus.name]: 'idle',
  })
  doNext(req, res, next, val)
}

async function seekEncounter(req, res, next) {
  const user = req.playerUser
  const userId = req.playerUser.id
  const time = Date.now()
  const ret = await updateUserFields(req, {
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
  const queuedUserDoc = await usersCollRef.doc(queuedUserId).get()
  const queuedUser = queuedUserDoc.data()
  if (queuedUser.status === 'queueing') {
    promises.push(queueCollRef.doc(queuedUserId).delete())

    const gameId = [Date.now(), ...[userId, queuedUserId].sort()].join('_')
    promises.push(encountersCollRef.doc(gameId).set({
      [encountersCollConfig.id.name]: gameId,
      [encountersCollFields.format.name]: chooseRandomEncounterFormat(user.expansionsOwned, queuedUser.expansionsOwned),
      [encountersCollFields.player1.name]: user,
      [encountersCollFields.player1Id.name]: userId,
      [encountersCollFields.player2.name]: queuedUser,
      [encountersCollFields.player2Id.name]: queuedUserId,
      [encountersCollFields.playPace.name]: '48-hour',
      [encountersCollFields.start.name]: time,
    }))

    const fightingUpdateObj = {
      [usersCollFields.encounterId.name]: gameId,
      [usersCollFields.fightingSince.name]: time,
      [usersCollFields.status.name]: 'fighting',
    }
    promises.push(updateUserFields(req, fightingUpdateObj))
    promises.push(utils.updateUserFieldsForUser(queuedUser, fightingUpdateObj))
  }

  await Promise.all(promises)
  return ret
}

async function abandonQueue(req, res, next) {
  const { playerUser } = req
  const docRef = queueCollRef.doc(playerUser.id)
  const doc = await docRef.get()
  let val = {}
  if (doc.exists) {
    await docRef.delete()
    val = await updateUserFields(req, {
      [usersCollFields.status.name]: 'deciding'
    })
  }
  doNext(req, res, next, val)
}

async function reportResult(req, res, next) {
  const result = req.body.data.result
  const { encounterId, id } = req.playerUser

  if ((isNaN(result) || !Number.isInteger(Number(result))) || Number(result) === 0) {
    const message = 'result must be a non-zero integer'
    console.error(message, encounterId)
    sendError(res, message)
    return
  }

  const playerWon = result > 0
  const opponentId = encounterId.split('_').slice(1).find(s => s !== id)
  const encounterDocRef = encountersCollRef.doc(encounterId)
  const encounterDoc = await encounterDocRef.get()
  const encounter = encounterDoc.data()

  if (encounter.result) {
    const message = 'results already entered for encounter'
    console.error(message, encounterId)
    sendError(res, message)
    return
  }

  const [oppRet, encRet, userRet] = await Promise.all([
    await utils.updateUserFieldsForUser(opponentId === encounter.player1Id ? encounter.player1 : encounter.player2, {
      [usersCollFields.status.name]: 'deciding',
      [usersCollFields.substatus.name]: 'post-encounter',
      [usersCollFields.encounterResult.name]: result * -1
    }),
    await encounterDocRef.update({
      [encountersCollFields.end.name]: Date.now(),
      [encountersCollFields.result.name]: Math.abs(result),
      [encountersCollFields.winner.name]: playerWon ? id : opponentId,
      [encountersCollFields.loser.name]: playerWon ? opponentId : id,
    }),
    await updateUserFields(req, {
      [usersCollFields.status.name]: 'deciding',
      [usersCollFields.substatus.name]: playerWon ? 'post-win' : 'post-loss',
      [usersCollFields.encounterResult.name]: result
    })
  ])
  console.log(oppRet, encRet, userRet)
  doNext(req, res, next, userRet)
}

async function confirmResult(req, res, next) {
  const val = actOnEncounterResult(req, true)
  doNext(req, res, next, val)
}

async function disputeResult(req, res, next) {
  const val = actOnEncounterResult(req, false)
  doNext(req, res, next, val)
}

/////////////////////////////////////////////////////////////////////

async function actOnEncounterResult(req, isConfirmed) {
  const { encounterId, encounterResult } = req.playerUser
  const fieldToUpdate = isConfirmed ? encountersCollFields.resultConfirmed : encountersCollFields.resultDisputed
  const ret = await updateUserFields(req, {
    [usersCollFields.status.name]: 'deciding',
    [usersCollFields.substatus.name]: encounterResult > 0 ? 'post-win' : 'post-loss'
  })
  await encountersCollRef.doc(encounterId).update({
    [fieldToUpdate.name]: true,
  })
  return ret
}

function getUserById(id) {
  return new Promise(async resolve => {
    const doc = await usersCollRef.doc(id).get()
    resolve(doc.data())
  })
}

function getTimerData(minutes = 0, message = '') {
  const now = Date.now()
  const seconds = minutes * 60;
  const ret = {
    [usersCollFields.timerEnd.name]: now + seconds * 1000,
    [usersCollFields.timerLength.name]: seconds,
    [usersCollFields.timerMessage.name]: `you are ${message}`,
    [usersCollFields.timerStart.name]: now
  }
  if (minutes) {
    ret[usersCollFields.status.name] = 'timing'
  }
  return ret
}

function getDelta(message = '', fieldMap = {}) {
  return {
    [usersCollFields.delta.name]: fieldMap,
    [usersCollFields.deltaApplied.name]: !fieldMap || !Object.keys(fieldMap).length,
    [usersCollFields.deltaMessage.name]: message,
  }
}

function chooseRandomEncounterFormat(player1Expansions, player2Expansions) {
  const commonBaseSets = 'V' + 'WR'.split('').filter(c => player1Expansions.includes(c) && player2Expansions.includes(c)).join('')
  const commonSets = 'G1BEHFC2KUALNP'.split('').filter(c => player1Expansions.includes(c) && player2Expansions.includes(c)).join('')
  return `${getRandomSubstring(commonBaseSets, 1, 1)}-${getRandomSubstring(commonSets, 0, 0, '1')}`
}

function getRandomSubstring(str, minChars, maxChars, mustHaves) {
  const chars = []
  do {
    for (const c of str) {
      if (Math.round(Math.random()) || (mustHaves && mustHaves.includes(c))) {
        if (!maxChars || chars.length < maxChars) {
          chars.push(c)
        }
      }
    }
  } while(chars.length < minChars)
  return chars.join('')
}

async function updateUserFields(req, updatedFields = {}) {
  return await utils.updateUserFieldsForUser(req.playerUser, updatedFields)
}

function doNext(req, res, next, val) {
  req.ret = val
  next()
}

function sendError(res, message) {
  if (!res.headersSent) {
    res.status(200).json({ data: { error: message } })
  }
}