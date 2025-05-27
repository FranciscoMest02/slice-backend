import { Router } from 'express'
import { UserController } from '../controllers/users.js'

export const usersRouter = Router()

usersRouter.post('/create', UserController.create)
usersRouter.post('/connect', UserController.connect) //MAybe this should change the route
usersRouter.get('/pairings/today', UserController.todaysPairings) //MAybe this should change the route
usersRouter.get('/:id/slice/today', UserController.getUserPairing)
usersRouter.get('/:id', UserController.getUser)
usersRouter.get('/username/:username', UserController.getUserByUsername)
usersRouter.patch('/:id', UserController.updateUser)
usersRouter.get('/:id/friends', UserController.getFriends)