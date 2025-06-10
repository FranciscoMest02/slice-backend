import { Router } from 'express'
import { FriendsController } from "../controllers/friends.js"

export const friendsRouter = Router()

friendsRouter.post('/request', FriendsController.requestFriendship)
friendsRouter.get('/:id/requests', FriendsController.getFriendRequests)
friendsRouter.post('/request/accept', FriendsController.acceptFriendRequest)
friendsRouter.post('/remove', FriendsController.removeFriend)
friendsRouter.post('/block', FriendsController.blockUser)
friendsRouter.post('/unblock', FriendsController.unblockUser)
friendsRouter.post('/:id/info', FriendsController.getUserInfoForFriendRequest) // This request is used for get the user info for a friend request. This is the first standarized request