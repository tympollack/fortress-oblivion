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

      await usersCollRef.doc(before.id).update(utils.getOptions(after, encounter))
    })