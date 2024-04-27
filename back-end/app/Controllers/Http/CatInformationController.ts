import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cat from 'App/Models/Cat'
import CatInformation from 'App/Models/CatInformation'
import CatInformationValidator from 'App/Validators/CatInformationValidator'

export default class CatInformationController {
  async createCatInfo({ request }: HttpContextContract) {
    const data = await request.validate(CatInformationValidator)
    try {
      let catId = atob(data.catId)
      let cat = await Cat.query().where('id', catId).first()
      if (cat === null) throw new Error('Cat not found')

      let catInfo = await CatInformation.create({
        catId: Number(catId),
        cattery: data.cattery,
        chip: data.chip,
        titleAfter: data.titleAfter,
        titleBefore: data.titleBefore,
        verifiedStatus: data.verifiedStatus,
      })
      await catInfo.save()
      return {
        message: 'Cat information created',
      }
    } catch (error) {
      return {
        error: 'Cat not found',
      }
    }
  }

  async updateCatInfo({ request }: HttpContextContract) {
    const data = await request.validate(CatInformationValidator)
    try {
      let catInfoId = request.params().id
      let catInfo = await CatInformation.query().where('id', catInfoId).first()
      if (catInfo) {
        catInfo.cattery = data.cattery
        catInfo.chip = data.chip
        catInfo.titleAfter = data.titleAfter
        catInfo.titleBefore = data.titleBefore
        catInfo.verifiedStatus = data.verifiedStatus
        await catInfo.save()
      } else {
        throw new Error('Cat information not found')
      }

      return {
        message: 'Cat information updated',
      }
    } catch (error) {
      return {
        error: 'Cat information not found',
      }
    }
  }
}
