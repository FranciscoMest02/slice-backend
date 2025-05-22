import { Router } from 'express'
import { UserController } from '../controllers/users.js'

export const usersRouter = Router()

usersRouter.post('/create', UserController.create)
usersRouter.post('/connect', UserController.connect)
usersRouter.get('/pairings/today', UserController.todaysPairings)
usersRouter.get('/:id', UserController.getUser)
usersRouter.get('/:id/friends', UserController.getFriends)