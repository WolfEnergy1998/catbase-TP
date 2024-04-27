import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Breed from 'App/Models/Breed'
import User from 'App/Models/User'
import UserUpdateValidator from 'App/Validators/UserUpdateValidator'

export default class UserController {
  async getUsers({}: HttpContextContract) {
    return await User.query().preload('breeds').preload('role').orderBy('id', 'asc').exec()
  }

  async deleteUser({ request }: HttpContextContract) {
    const id = request.params().id
    try {
      let user = await User.query().where('id', id).first()
      if (user === null) {
        throw new Error('User does not exist')
      }
      await user?.delete()
      return {
        message: 'User deleted',
      }
    } catch (error) {
      return {
        message: 'User does not exist',
      }
    }
  }

  async updateUser({ request }: HttpContextContract) {
    const id = request.params().id
    const data = await request.validate(UserUpdateValidator)
    try {
      let user = await User.query().preload('breeds').preload('role').where('id', id).first()
      if (user === null) {
        throw new Error('User does not exist')
      }
      user.fullname = data.fullname
      user.email = data.email
      user.roleId = data.role.id
      await user.related('breeds').detach()
      await user.related('breeds').attach(data.breeds.map((breed: Breed) => breed.id))
      await user.save()
      return {
        message: 'User updated',
      }
    } catch (error) {
      return {
        message: 'User does not exist',
      }
    }
  }
}
