const shareable = module.parent.shareable
const config = shareable.config
const db = shareable.db
const url = shareable.url + '/game-events'

const collectionConfig = config.firestore.collections.locations
const collectionName = collectionConfig.name

//    /api/game-events/
const routes = require('express').Router()

routes.get('/', getWorldState)

module.exports = routes

/////////////////////////////////////////////////////////////////////

async function getWorldState(req, res) {
  const id = req.params.id
  console.log('GET /game-events', id)

  const auction = await getLocationById(id)
  if (auction) {
    console.log(auction)
    res.status(200).json(auction)
    return
  }

  console.error('location not found for id', id)
  res.status(404).send()
}