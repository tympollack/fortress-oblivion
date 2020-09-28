const { config, db, utils } = module.parent.shareable
const collectionsConfig = config.firestore.collections

const chatCollConfig = collectionsConfig.chat
const chatCollFields = chatCollConfig.fields
const chatCollRef = db.collection(chatCollConfig.name)

const usersCollConfig = collectionsConfig.users
const usersCollFields = usersCollConfig.fields
const usersCollRef = db.collection(usersCollConfig.name)

//    /internal/chat-service/
const routes = require('express').Router()

routes.use(isAuthMiddleware)
routes.use(performanceWrapperMiddleware)

routes.post('/begin-conversation', beginConversation)
routes.post('/send-message', sendMessage)

routes.use(sendBack)

module.exports = routes

/////////////////////////////////////////////////////////////////////

async function isAuthMiddleware(req, res, next) {
  console.log(req.method, req.path, req.body)
  const id = req.body.data.id
  const doc = await usersCollRef.doc(id).get()
  if (!doc.exists) {
    console.error('user id not found', id)
    res.status(404).send()
    return
  }

  req.sender = doc.data().username
  req.senderId = id

  await next()
}

// should be last called
async function performanceWrapperMiddleware(req, res, next) {
  const start = Date.now()
  const ret = await next()
  console.log(req.path, 'finished in', Date.now() - start, 'ms')
  return ret
}

// afterware
async function sendBack(req, res, next) {
  const { ret } = req
  if (!res.headersSent) {
    res.status(200).json({data: ret || {}})
  }
  await next()
}

/////////////////////////////////////////////////////////////////////

async function sendMessage(req, res, next) {
  const { body, sender, senderId } = req
  const { chatId, message } = body.data
  await chatCollRef.doc(chatId).collection('messages').add({
    created: Date.now(),
    content: message,
    sender,
    senderId
  })
  next()
}

async function beginConversation(req, res, next) {
  const { sender, senderId } = req
  const { recipientId } = req.body.data

  const existingDocRefs = await chatCollRef
      .where('userIds', 'array-contains', senderId)
      .get()

  let existingChat
  existingDocRefs.forEach(chatDocRef => {
    const chat  = chatDocRef.data()
    const { userIds } = chat
    if (userIds && userIds.length === 2 && userIds.includes(recipientId)) {
      existingChat = { ...chat, id: chatDocRef.id }
    }
  })

  if (existingChat) {
    req.ret = existingChat
    next()
    return
  }

  const recipientDocRef = await usersCollRef.doc(recipientId).get()
  const recipientInfo = recipientDocRef.data()

  const newChatData = {
    all: false,
    pinned: false,
    public: false,
    restricted: false,
    group: false,
    title: `${recipientInfo.username};${sender}`,
    userIds: [senderId, recipientId]
  }
  const newChatDocRef = await chatCollRef.add(newChatData)
  req.ret = { ...newChatData, id: newChatDocRef.id }
  next()
}
