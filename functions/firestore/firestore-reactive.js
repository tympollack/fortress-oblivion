const { config, db, functions, utils } = module.parent.shareable
const firestore = functions.firestore
const collectionsConfig = config.firestore.collections
const usersCollConfig = collectionsConfig.users
const usersCollFields = usersCollConfig.fields
const usersCollRef = db.collection(usersCollConfig.name)

const encountersCollConfig = collectionsConfig.encounters
const encountersCollFields = encountersCollConfig.fields
const encountersCollRef = db.collection(collectionsConfig.world.name).doc(collectionsConfig.world.reserved.state).collection(encountersCollConfig.name)

exports.onUserUpdated = firestore
    .document(usersCollConfig.id.path)
    .onUpdate(async (snap, context) => {
      const before = snap.before.data()
      const after = snap.after.data()
      if (before.status === after.status
          && before.substatus === after.substatus
          && before.gold === after.gold
          && before.chest === after.chest) {
        return
      }

      if (before.substatus.indexOf('resting') === 0) {
        const restingRate = (before.substatus.indexOf('repair bot') > -1 ? 65 : 80) + 2 * before.level
        const timeSince = (Date.now() - before.timerEnd) / 1000
        const gainedHealth = Math.min(Math.round(timeSince / restingRate), 6)
        after.health = Math.min(after.health + gainedHealth, after.maxHealth)
      }

      await usersCollRef.doc(before.id).update({
        ...utils.getOptions(after),
        [usersCollFields.health.name]: after.health
      })
    })