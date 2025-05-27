import { Router } from 'express'
import { FriendsController } from "../controllers/friends.js"

export const friendsRouter = Router()

friendsRouter.post('/request', FriendsController.requestFriendship)
friendsRouter.get('/:id/requests', FriendsController.getFriendRequests)
friendsRouter.post('/request/accept', FriendsController.acceptFriendRequest)