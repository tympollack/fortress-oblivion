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

exports.getOptions = (user, encounter) => {

  let optionsTitle = ''
  const options = []
  const addOption = (apiPath, heading, subheading = '', value = 0) => {
    options.push({ apiPath, heading, subheading, value })
  }

  switch (user.location) {
    case 'the village':
      optionsTitle = `you are ${user.health < user.maxHealth ? "resting" : "waiting"} in the village`
      addOption('to-fortress', 'head to the fortress')
      break

    case 'fortress oblivion':
      switch (user.substatus) {
        case 'trading':
          optionsTitle = 'welcome to the Trading Post'
          addOption('leave-trading-post', 'leave', 'i\'m done here')
          break

        case 'post-encounter':
          const userWon = encounter.winner === user.id
          const message = `${userWon ? 'winning' : 'losing'} by ${encounter.result}`
          optionsTitle = userWon ? 'you are victorious!' : 'you have been defeated!'
          addOption('confirm-result', `confirm ${message}`)
          addOption('dispute-result', `dispute ${message}`)
          break

        case 'post-win':
          const potionAmount = Math.floor(encounter.result / 2)
          optionsTitle = 'the fight has ended, and you have emerged victorious! choose your reward.'
          if (!user.hasKey) {
            addOption('claim-key', 'claim a key', `a key to floor ${user.level + 1}!`, encounter.result)
          }
          if (!user.potion) {
            addOption('siphon-potion', 'siphon a potion', `a potion for ${potionAmount} health!`, potionAmount)
          }
          break

        case 'post-loss':
          const fullHpLoss = Math.min(encounter.result, user.health)
          const partialHpLoss = Math.min(Math.ceil(encounter.result / 3), user.health)
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
          optionsTitle = 'you are inside Fortress Oblivion'
          if (user.hasKey) {
            addOption('climb-stairs', 'climb the stairs', `use your key to go upstairs`)
          } else if (user.chest) {
            addOption('search-treasure', 'search for treasure')
          }

          addOption('seek-encounter', 'seek an encounter', 'find something to fight')

          if (user.gold && user.level % 3 === 0) {
            addOption('visit-trading-post', 'visit the trading post', 'purchase equipment')
          }

          if (user.health < user.maxHealth) {
            if (user.potion) {
              const healAmount = Math.min(user.maxHealth - user.health, user.potion)
              addOption('drink-potion', 'drink your potion', `drink to heal ${healAmount} health`)
            }
            // addOption('rest', 'take a rest', 'very slow healing')
          }

          if (user.level === 1 && !user.hasKey && !user.potion) {
            if (user.gold >= 15) {
              addOption('hire-convoy', 'hire convoy bot', 'faster trip to the village', 15)
            }
            addOption('to-village', 'back to the village')
          }
          break
      }
      break
  }

  return { options, optionsTitle}
}