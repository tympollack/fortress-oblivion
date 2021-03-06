const config = require('../config/config').get()
const db = require('../firestore/init')

const collectionsConfig = config.firestore.collections
const usersCollConfig = collectionsConfig.users
const usersCollFields = usersCollConfig.fields
const usersCollRef = db.collection(usersCollConfig.name)

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

exports.updateUserFieldsForUser = async (user, updatedFields) => {
  const updatedOptions = this.getOptions({
    ...user,
    ...updatedFields // overlay updated values onto user copy
  })
  const fieldMap = {
    ...user,
    ...updatedFields,
    ...updatedOptions,
  }
  await usersCollRef.doc(user.id).update(fieldMap)
  return { ...user, ...fieldMap }
}

exports.getOptions = user => {

  let optionsTitle = ''
  const options = []
  const addOption = (apiPath, heading, subheading = '', value = 0, disabled = false) => {
    options.push({ apiPath, heading, subheading, value, disabled })
  }

  const userWon = user.encounterResult > 0
  const encounterResult = Math.abs(user.encounterResult)

  switch (user.location) {
    case 'the village':
      const damageTaken = user.maxHealth - user.health
      optionsTitle = `you are ${damageTaken ? "resting" : "waiting"} in the village`
      addOption('to-fortress', 'head to the fortress')

      if (damageTaken && user.gold) {
        const lyleHealAmount = Math.ceil(Math.min(damageTaken, user.gold, 19) * .8)
        addOption('hire-lyle', 'hire High Priest Lyle', `${lyleHealAmount}g - faster healing for gold`, lyleHealAmount)
      }
      break

    case 'fortress oblivion':
      switch (user.substatus) {
        case 'trading':
          optionsTitle = 'welcome to the Trading Post'
          addOption('buy-plasma-bots', '5 plasma bots', '25g - reduce siphon potion time', { type: 'plasma bot', quantity: 5, price: 25 }, user.gold < 25)
          addOption('buy-repair-bots', '5 repair bots', '25g - reduced rest rate', { type: 'repair bot', quantity: 5, price: 25 }, user.gold < 25)
          addOption('buy-defense-bots', '5 defense bots', '40g - reduce max hit point reduction', { type: 'defense bot', quantity: 5, price: 40 }, user.gold < 40)
          addOption('leave-trading-post', 'leave', 'i\'m done here')
          break

        case 'post-encounter':
          const message = `${userWon ? 'winning' : 'losing'} by ${encounterResult}`
          optionsTitle = userWon ? 'you are victorious!' : 'you have been defeated!'
          addOption('confirm-result', `confirm ${message}`)
          addOption('dispute-result', `dispute ${message}`)
          break

        case 'post-win':
          const potionAmount = Math.floor(encounterResult / 2)
          optionsTitle = 'the fight has ended, and you have emerged victorious! choose your reward.'
          if (!user.hasKey) {
            addOption('claim-key', 'claim a key', `a key to floor ${user.level + 1}!`, encounterResult)
          }
          if (!user.potion) {
            addOption('siphon-potion', 'siphon a potion', `a potion for ${potionAmount} health!`, potionAmount)
          }
          break

        case 'post-loss':
          const fullHpLoss = Math.min(encounterResult, user.health)
          const partialHpLoss = Math.min(Math.ceil(encounterResult / 3), user.health)
          optionsTitle = 'the fight has ended in your defeat. you must now select your fate.'
          if (user.health > fullHpLoss) {
            addOption('stand-ground', 'stand your ground', `take ${(fullHpLoss + '')[0] === '8' ? 'an': 'a'} ${fullHpLoss} damage hit`, fullHpLoss)
          } else {
            addOption('embrace-death', 'enjoy a swift death', 'embrace the darkness')
          }
          if (user.level > 1 && user.health > partialHpLoss) {
              addOption('retreat-downstairs', 'retreat downstairs', `suffer only ${partialHpLoss} damage`, partialHpLoss)
          }
          break

        default:
          optionsTitle = `you are ${user.substatus.includes('resting') ? 'resting' : ''} inside Fortress Oblivion`
          if (user.hasKey) {
            addOption('climb-stairs', 'climb the stairs', `use your key to go upstairs`)
          }

          if (!user.hasKey || !user.potion ) {
            addOption('seek-encounter', 'seek an encounter', 'find something to fight')
          }

          if (!user.hasKey && user.chest) {
            addOption('search-treasure', 'search for treasure', `let's find some gold`)
          }

          if (user.level % 3 === 0) {
            addOption('visit-trading-post', 'visit the trading post', 'purchase equipment')
          }

          if (user.health < user.maxHealth) {
            if (user.potion) {
              const healAmount = Math.min(user.maxHealth - user.health, user.potion)
              addOption('drink-potion', 'drink your potion', `drink to heal ${healAmount} health`)
            }
            addOption('take-rest', 'take a rest', 'very slow healing')
          }

          if (user.level === 1 && !user.hasKey && !user.potion) {
            addOption('hire-convoy', 'hire a convoy bot', '15g - quicker trip to the village', 15, user.gold < 15)
            addOption('to-village', 'return to the village', 'go heal up, takes lots of time')
          }
          break
      }
      break
  }

  return { options, optionsTitle }
}

exports.hasEquipment = (equipment, type) => {
  return equipment.findIndex(e => e.type === type) > -1
}

exports.addEquipment = (equipment, type, quantity = 1) => {
  const equipmentIndex = equipment.findIndex(e => e.type === type)
  const newEquipment = equipment.concat()
  equipmentIndex === -1
    ? newEquipment.push({quantity, type})
    : newEquipment[equipmentIndex].quantity += quantity
  return newEquipment
}

exports.subtractEquipment = (equipment, type, quantity = 1) => {
  const newEquipment = equipment.concat()
  const equipmentIndex = equipment.findIndex(e => e.type === type)
  if (equipmentIndex > -1) {
    equipment[equipmentIndex].quantity > quantity
      ? newEquipment[equipmentIndex].quantity -= quantity
      : newEquipment.splice(equipmentIndex, 1)
  }
  return newEquipment
}

exports.deleteCollection = (db, collectionPath, batchSize = 100) => {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    this.deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

exports.deleteQueryBatch = async (db, query, resolve) => {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    this.deleteQueryBatch(db, query, resolve);
  });
}