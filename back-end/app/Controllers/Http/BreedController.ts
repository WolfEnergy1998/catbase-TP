import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Breed from 'App/Models/Breed'
import BreedValidator from 'App/Validators/BreedValidator'

export default class BreedController {
  async getBreeds({}: HttpContextContract) {
    return await Breed.query().orderBy('code', 'asc').exec()
  }

  async createBreed({ request }: HttpContextContract) {
    const data = await request.validate(BreedValidator)
    try {
      let breed = await Breed.query().where('code', data.code).first()
      if (breed === null) {
        breed = await Breed.create({
          code: data.code,
        })
        return {
          message: 'Breed created',
        }
      }
      throw new Error('Breed already exists')
    } catch (error) {
      return {
        message: error.message,
      }
    }
  }

  async deleteBreed({ request }: HttpContextContract) {
    const id = request.params().id
    try {
      let breed = await Breed.query().where('id', id).first()
      if (breed === null) {
        throw new Error('Breed does not exist')
      }
      await breed?.delete()
      return {
        message: 'Breed deleted',
      }
    } catch (error) {
      return {
        message: 'Breed does not exist',
      }
    }
  }

  async updateBreed({ request }: HttpContextContract) {
    const data = await request.validate(BreedValidator)
    const id = request.params().id
    try {
      let breed = await Breed.query().where('id', id).first()
      if (breed === null) {
        throw new Error('Breed does not exist')
      }
      breed.code = data.code
      await breed.save()
      return {
        message: 'Breed updated',
      }
    } catch (error) {
      return {
        message: 'Breed does not exist',
      }
    }
  }
}
