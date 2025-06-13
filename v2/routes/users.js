import { Router } from 'express'
import { UsersControllerV2 } from '../controllers/users.js'

export const usersRouterV2 = Router()

usersRouterV2.get('/:id', UsersControllerV2.getUser)