const { config, db, functions, utils } = module.parent.shareable
const firestore = functions.firestore
const collectionsConfig = config.firestore.collections
const usersCollConfig = collectionsConfig.users
const usersCollFields = usersCollConfig.fields
const usersCollRef = db.collection(usersCollConfig.name)

exports.onUserUpdated = firestore
    .document(usersCollConfig.id.path)
    .onUpdate((snap, context) => {
      const before = snap.before.data()
      const after = snap.after.data()
      if (before.status === after.status && before.substatus === after.substatus) {
        return
      }

      usersCollRef.doc(before.id).update(utils.getOptions(after))
    })