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
routes.use(passiveHealingMiddleware)
routes.use(performanceWrapperMiddleware)

// general
routes.post('/generate-options', generateOptions)
routes.post('/read-manual', markManualRead)
routes.post('/see-alert', markAlertSeen)
routes.post('/report-result', reportResult)
routes.post('/confirm-result', confirmResult)
routes.post('/dispute-result', disputeResult)
routes.post('/visit-bank', visitBank)
routes.post('/leave-bank', leaveBank)
routes.post('/deposit-gold', depositGold)
routes.post('/withdraw-gold', withdrawGold)

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
      'abandon-queue',
      'generate-options',
      'read-manual',
      'report-result',
      'see-alert',
      'leave-bank',
      'deposit-gold',
      'withdraw-gold'
      ].includes(chosenOption)) {
    next()
    return
  }

  const user = req.playerUser
  user.action = chosenOption

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
  const timeSince = (Date.now() - user.timerStart) / 1000
  if (timeSince >= user.timerLength) {
    next()
  } else if (timeSince >= user.timerLength + 10) {
    console.log('timer leniency shown', user.id, req.path)
    next()
  } else {
    const message = 'action attempted before timer expiry'
    console.error(message, user.id, req.path)
    res.status(400).send(`${message}, this event has been logged`)
  }
}

async function passiveHealingMiddleware(req, res, next) {
  const user = req.playerUser
  if (user.substatus.indexOf('resting') === 0) {
    const restingRate = (user.substatus.indexOf('repair bot') > -1 ? 65 : 80) * 60 + 2 * user.level
    const timeSince = (Date.now() - user.timerEnd) / 1000
    const gainedHealth = Math.min(Math.round(timeSince / restingRate), 6)
    user.health = Math.min(user.health + gainedHealth, user.maxHealth)
  }
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
  return updateUserFields(req, { [usersCollFields.status.name]: 'deciding' })
}

async function markAlertSeen(req) {
  return updateUserFields(req, { [usersCollFields.playerAlertSeen.name]: true })
}

async function visitTradingPost(req) {
  return updateUserFields(req, { [usersCollFields.substatus.name]: 'trading' })
}

async function leaveTradingPost(req) {
  return updateUserFields(req, { [usersCollFields.substatus.name]: 'idle' })
}

async function visitBank(req) {
  await updateUserFields(req, { [usersCollFields.status.name]: 'banking' })
}

async function leaveBank(req) {
  await updateUserFields(req, { [usersCollFields.status.name]: 'deciding' })
}

async function depositGold(req) {
  const { body, playerUser } = req
  const { amount } = body.data
  const { bank, gold } = playerUser
  const trueAmount = isNaN(amount) || amount < 0 ? 0 : Math.min(amount, gold)
  await updateUserFields(req, {
    [usersCollFields.bank.name]: bank + trueAmount,
    [usersCollFields.gold.name]: gold - trueAmount,
  })
}

async function withdrawGold(req) {
  const { body, playerUser } = req
  const { amount } = body.data
  const { bank, gold } = playerUser
  const trueAmount = isNaN(amount) || amount < 0 ? 0 : Math.min(amount, bank)
  await updateUserFields(req, {
    [usersCollFields.bank.name]: bank - trueAmount,
    [usersCollFields.gold.name]: gold + trueAmount,
  })
}

async function generateOptions(req) {
  return updateUserFields(req, { [usersCollFields.status.name]: 'deciding' })
}

async function standGround(req) {
  const { chest, equipment, health, maxHealth } = req.playerUser
  const optionValue = req.chosenOption.value
  const hasEquipment = utils.hasEquipment(equipment, 'defense bot')
  const fieldMap = hasEquipment ? {[usersCollFields.equipment.name]: utils.subtractEquipment(equipment, 'defense bot')} : {}
  const newMaxHp = maxHealth - (hasEquipment ? 1 : 2)
  const newHp = Math.min(Math.max(health - optionValue, 0), newMaxHp)
  return updateUserFields(req, {
    ...fieldMap,
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: newHp,
    [usersCollFields.maxHealth.name]: newMaxHp,
    [usersCollFields.chest.name]: chest + Math.round(optionValue / 5)
  })
}

async function retreatDownstairs(req) {
  const { equipment, health, level, maxHealth } = req.playerUser
  const hasEquipment = utils.hasEquipment(equipment, 'defense bot')
  const fieldMap = hasEquipment ? {[usersCollFields.equipment.name]: utils.subtractEquipment(equipment, 'defense bot')} : {}
  const newMaxHp = maxHealth - (hasEquipment ? 1 : 2)
  return updateUserFields(req, {
    ...fieldMap,
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: Math.min(health - req.chosenOption.value, newMaxHp),
    [usersCollFields.maxHealth.name]: newMaxHp,
    [usersCollFields.level.name]: level - 1
  })
}

async function claimKey(req) {
  return updateUserFields(req, {
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.hasKey.name]: true,
    [usersCollFields.chest.name]: req.playerUser.chest + Math.round(req.chosenOption.value / 4)
  })
}

async function siphonPotion(req) {
  const { equipment } = req.playerUser
  const optionValue = req.chosenOption.value
  let timerValue = optionValue
  const fieldMap = {}
  if (utils.hasEquipment(equipment, 'plasma bot')) {
    fieldMap[usersCollFields.equipment.name] = utils.subtractEquipment(equipment, 'plasma bot.')
    timerValue /= 3
  }

  return updateUserFields(req, {
    ...fieldMap,
    ...getTimerData(timerValue, 'siphoning a potion.'),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.potion.name]: optionValue
  })
}

async function drinkPotion(req) {
  const { health, maxHealth, potion } = req.playerUser
  const healAmount = Math.min(maxHealth - health, potion)
  return updateUserFields(req, {
    ...getTimerData(healAmount, 'drinking your potion.'),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.health.name]: health + healAmount,
    [usersCollFields.potion.name]: potion - healAmount
  })
}

async function climbStairs(req) {
  return updateUserFields(req, {
    ...getTimerData(15, 'climbing the stairs.'),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.hasKey.name]: false,
    [usersCollFields.level.name]: req.playerUser.level + 1
  })
}

async function searchTreasure(req) {
  const { chest, gold } = req.playerUser
  return updateUserFields(req, {
    ...getTimerData(5, 'searching for treasure.'),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.chest.name]: 0,
    [usersCollFields.gold.name]: gold + chest
  })
}

async function buyEquipment(req) {
  const { equipment, gold } = req.playerUser
  const { price, quantity, type } =  req.chosenOption.value
  return updateUserFields(req, {
    [usersCollFields.gold.name]: gold  - price,
    [usersCollFields.equipment.name]: utils.addEquipment(equipment, type, quantity)
  })
}

async function embraceDeath(req) {
  return updateUserFields(req, {
    ...getTimerData(10 * req.playerUser.level + 200, 'being dragged back to the village.'),
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
  return updateUserFields(req, {
    ...getTimerData(10, 'riding to the village.'),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.location.name]: 'the village',
    [usersCollFields.gold.name]: req.playerUser.gold - req.chosenOption.value,
    [usersCollFields.maxHealth.name]: 100
  })
}

async function takeRest(req) {
  const { health, level, maxHealth, equipment } = req.playerUser
  const equipmentType = 'repair bot'
  const hasEquipment = utils.hasEquipment(equipment, equipmentType)
  const fieldMap = {}
  let timeVal = 80 + 2 * level
  if (hasEquipment) {
    [usersCollFields.equipment.name] = utils.subtractEquipment(equipment, equipmentType)
    timeVal -= 15
  }

  return updateUserFields(req, {
    ...fieldMap,
    ...getTimerData(timeVal * 2, 'resting in the fortress.'),
    [usersCollFields.substatus.name]: hasEquipment ? 'resting repair bot' : 'resting',
    [usersCollFields.health.name]: Math.min(health + 2, maxHealth)
  })
}

async function hireLyle(req) {
  const { gold, health, maxHealth, timerEnd } = req.playerUser
  const passiveHeal = Math.max(Math.floor((Date.now() - timerEnd) / 10000), 0)
  const currentHealth = Math.min(health + passiveHeal, maxHealth)
  const activeHeal = Math.max(Math.min(maxHealth - currentHealth, req.chosenOption.value), 0)
  return updateUserFields(req, {
    ...getTimerData(0, 'being healed.'),
    [usersCollFields.gold.name]: gold - activeHeal,
    [usersCollFields.health.name]: health + activeHeal
  })
}

async function toFortress(req) {
  const { health, maxHealth, timerEnd } = req.playerUser
  const passiveHeal = Math.floor((Date.now() - timerEnd) / (10 * 60 * 1000))
  return updateUserFields(req, {
    ...getTimerData(10, 'heading to The Fortress Oblivion. Good luck..'),
    [usersCollFields.location.name]: 'fortress oblivion',
    [usersCollFields.health.name]: Math.min(health + passiveHeal, maxHealth)
  })
}

async function toVillage(req) {
  return updateUserFields(req, {
    ...getTimerData(210, 'walking to the village.'),
    [usersCollFields.substatus.name]: 'idle',
    [usersCollFields.location.name]: 'the village',
    [usersCollFields.maxHealth.name]: 100
  })
}

async function seekEncounter(req) {
  const user = req.playerUser
  const userId = req.playerUser.id
  const time = Date.now()
  await updateUserFields(req, {
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
}

async function abandonQueue(req) {
  const { playerUser } = req
  const docRef = queueCollRef.doc(playerUser.id)
  const doc = await docRef.get()
  if (doc.exists) {
    await docRef.delete()
    return updateUserFields(req, {
      [usersCollFields.status.name]: 'deciding'
    })
  }
}

async function reportResult(req, res) {
  const result = req.body.data.result
  const { encounterId, id } = req.playerUser

  if ((isNaN(result) || !Number.isInteger(Number(result))) || Number(result) === 0) {
    const message = 'result must be a non-zero integer'
    console.error(message, encounterId)
    res.status(400).send(message)
    return
  }

  const playerWon = result > 0
  const opponentId = encounterId.split('_').slice(1).find(s => s !== id)

  const ret = await updateUserFields(req, {
    [usersCollFields.status.name]: 'deciding',
    [usersCollFields.substatus.name]: playerWon ? 'post-win' : 'post-loss',
    [usersCollFields.encounterResult.name]: result
  })

  const encounterDocRef = encountersCollRef.doc(encounterId)
  const encounterDoc = await encounterDocRef.get()
  const encounter = encounterDoc.data()

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
  await utils.updateUserFieldsForUser(opponentId === encounter.player1Id ? encounter.player1 : encounter.player2, {
    [usersCollFields.status.name]: 'deciding',
    [usersCollFields.substatus.name]: 'post-encounter',
    [usersCollFields.encounterResult.name]: result * -1
  })

  return ret
}

async function confirmResult(req) {
  await actOnEncounterResult(req, true)
}

async function disputeResult(req) {
  await actOnEncounterResult(req, false)
}

/////////////////////////////////////////////////////////////////////

async function actOnEncounterResult(req, isConfirmed) {
  const { encounterId, encounterResult } = req.playerUser
  const fieldToUpdate = isConfirmed ? encountersCollFields.resultConfirmed : encountersCollFields.resultDisputed
  await updateUserFields(req, {
    [usersCollFields.status.name]: 'deciding',
    [usersCollFields.substatus.name]: encounterResult > 0 ? 'post-win' : 'post-loss'
  })
  encountersCollRef.doc(encounterId).update({
    [fieldToUpdate.name]: true,
  })
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

function chooseRandomEncounterFormat(player1Expansions, player2Expansions) {
  const commonBaseSets = 'V' + 'WR'.split('').filter(c => player1Expansions.includes(c) && player2Expansions.includes(c)).join('')
  const commonSets = 'G1BEHFC2KUALN'.split('').filter(c => player1Expansions.includes(c) && player2Expansions.includes(c)).join('')
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

async function updateUserFields(req, updatedFields) {
  return await utils.updateUserFieldsForUser(req.playerUser, updatedFields)
}
