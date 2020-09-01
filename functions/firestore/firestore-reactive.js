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
      if (before.status === after.status && before.substatus === after.substatus) {
        return
      }

      let encounter = {}
      if (after.encounterId) {
        const encounterDoc = await encountersCollRef.doc(after.encounterId).get()
        encounter = encounterDoc.data()
      }

      if (before.substatus.indexOf('resting') === 0) {
        let restingRate = 80 + 2 * before.level
        if (before.substatus.indexOf('repair bot') > -1) {
          restingRate -= 15
        }
        const timeSince = (Date.now() - before.timerEnd) / 1000
        const gainedHealth = Math.round(timeSince / restingRate)
        after.health = Math.min(after.health + gainedHealth, after.maxHealth)
      }

      await usersCollRef.doc(before.id).update(utils.getOptions(after, encounter))
    })