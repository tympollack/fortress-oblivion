const shareable = module.parent.shareable
const db = shareable.db
const url = shareable.url + '/users'
const collectionName = shareable.config.firestore.collections.users.name
const collRef = db.collection(collectionName)

//    /api/users/
const routes = require('express').Router()

routes.get('/', queryUsers)
routes.post('/', addUser)

routes.get('/:id', getUser)
routes.put('/:id', addUserById)
routes.patch('/:id', updateUser)
routes.delete('/:id', deleteUser)

module.exports = routes

/////////////////////////////////////////////////////////////////////

const getUserById = id => {
  return new Promise(async resolve => {
    const doc = await collRef.doc(id).get()
    resolve(doc.data())
  })
}

async function findByUsername(req, res) {
  const username = req.params.username
  console.log('POST /users/exists', username)

  let userFoundByUsername = false
  const users = await collRef.where('username', '==', username).get()
  users.forEach(doc => {
    if (doc.exists) userFoundByUsername = true
  })
  console.log(userFoundByUsername ? 'found user by username' : 'user not found for username', username)
  res.status(200).json({ data: userFoundByUsername })
}

async function queryUsers(req, res) {
  const query = req.query
  console.log('GET /users', query ? query : 'ALL')

  const content = []
  const collection = await collRef.get()
  collection.forEach(doc => {
    const item = doc.data()
    item._links = [{
      self: {
        href: url + doc.id
      }
    }]
    content.push(item)
  })

  const ret = {
    content: content,
    _links: [{
      _rel: 'users',
      href: url
    }]
  }
  res.status(200).json(ret).send()
}

async function addUser(req, res) {
  const body = req.body
  const id = body.id
  console.log('POST /users', body)

  const doesExist = id && await getUserById(id)
  if (doesExist) {
    res.status(403).send()
    return
  }

  await collRef.add(body)
  res.status(200).send()
}

async function getUser(req, res) {
  const id = req.params.id
  console.log('GET /users', id)

  const user = await getUserById(id)
  if (user) {
    console.log('requested user found', id)
    res.status(200).json(user)
    return
  }
  console.log('user not found for id', id)
  res.status(404).send()
}

async function addUserById(req, res) {
  const body = req.body
  const id = req.params.id
  console.log('PUT /users', id, body)

  if (!id) {
    res.status(400).send()
    return
  }

  await collRef.doc(id).set(body)
  res.status(200).send()
}

async function updateUser(req, res) {
  const body = req.body
  const id = req.params.id
  console.log('PATCH /users', id, body)

  const doesExist = id && await getUserById(id)
  if (!doesExist) {
    res.status(403).send()
    return
  }

  await collRef.doc(id).update(body)
  res.status(200).send()
}

// Warning: Deleting a document does not delete its subcollections!
async function deleteUser(req, res) {
  const id = req.params.id
  console.log('DELETE /users', id)

  await collRef.doc(id).delete()
  res.status(200).send()
}