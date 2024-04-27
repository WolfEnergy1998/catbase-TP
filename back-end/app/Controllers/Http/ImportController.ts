import { DateTime } from 'luxon'
import { parse } from 'csv-parse'
import Breed from 'App/Models/Breed'
import Cat from 'App/Models/Cat'
import CatInformation from 'App/Models/CatInformation'
import CatReference from 'App/Models/CatReference'
import Link from 'App/Models/Link'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportController {
  async importCsv({ request }: HttpContextContract) {
    try {
      const body = await JSON.parse(request.raw())
      let file = new Uint8Array(Object.values(body.file))
      let fileContent = new TextDecoder().decode(file)
      type SexEnum = 'F' | 'M'
      type Cats = {
        ID: number
        NAME: string | null
        SOURCE_DB: string | null
        SOURCE_ID: number | null
        REGISTRATION_NUMBER_BEFORE: string | null
        REGISTRATION_NUMBER_CURRENT: string | null
        ORIGIN_COUNTRY: string | null
        CURRENT_COUNTRY: string | null
        TITLE_BEFORE: string | null
        TITLE_AFTER: string | null
        BREED: string | null
        COLOR: string | null
        COLOR_CODE: string | null
        BIRTH_DATE: DateTime | null
        GENDER: SexEnum | null
        CHIP: string | null
        NOTE: string | null
        AWARDS: string | null
        HEALTH_STATUS: string | null
        CATTERY: string | null
        MOTHER_ID: string | null
        FATHER_ID: string | null
        MOTHER_NAME: string
        FATHER_NAME: string
        MOTHER_CATTERY: string
        FATHER_CATTERY: string
        MOTHER_REG_NUMBER: string
        FATHER_REG_NUMBER: string
      }
      let createCats = async (cats: Cats[]) => {
        for (let i = 0; i < cats.length; i++) {
          if (cats[i].ID > 0) {
            let breed = null as Breed | null
            if (cats[i].BREED) {
              breed = await Breed.query().where('code', cats[i].BREED).first()
              if (breed === null) throw new Error('Breed not found')
            }
            let cat = await Cat.create({
              gender: cats[i].GENDER as 'F' | 'M',
              name: cats[i].NAME,
              countryOrigin: cats[i].ORIGIN_COUNTRY,
              countryCurrent: cats[i].CURRENT_COUNTRY,
              color: cats[i].COLOR,
              colorCode: cats[i].COLOR_CODE,
              dateOfBirth: cats[i].BIRTH_DATE
                ? DateTime.fromFormat(cats[i].BIRTH_DATE, 'yyyy-MM-dd')
                : undefined,
              breedId: breed ? (breed!.id as number) : null,
              regNumCurrent: cats[i].REGISTRATION_NUMBER_CURRENT,
              regNumOrigin: cats[i].REGISTRATION_NUMBER_BEFORE,
            })
            if (cats[i].CHIP || cats[i].TITLE_AFTER || cats[i].TITLE_BEFORE || cats[i].CATTERY) {
              await CatInformation.create({
                catId: cat.id,
                chip: cats[i].CHIP,
                titleAfter: cats[i].TITLE_AFTER,
                titleBefore: cats[i].TITLE_BEFORE,
                cattery: cats[i].CATTERY,
              })
            }

            if (cats[i].HEALTH_STATUS) {
              await Link.create({
                content: cats[i].HEALTH_STATUS,
                catId: cat.id,
                type: 'HEALTH_RECORD',
              })
            }

            if (cats[i]['NOTE(DESCRIPTION)']) {
              await Link.create({
                content: cats[i]['NOTE(DESCRIPTION)'],
                catId: cat.id,
                type: 'NOTE',
              })
            }

            if (cats[i].AWARDS) {
              await Link.create({
                content: cats[i].AWARDS,
                catId: cat.id,
                type: 'AWARD',
              })
            }

            if (cats[i].FATHER_ID || cats[i].MOTHER_ID) {
              await CatReference.create({
                catId: cat.id,
                fatherId: cats[i].FATHER_ID === '' ? null : parseInt(cats[i].FATHER_ID),
                motherId: cats[i].MOTHER_ID === '' ? null : parseInt(cats[i].MOTHER_ID),
              })
            }
            await cat.save()
          }
        }
      }

      let catsForImport
      let parser = new Promise((resolve) => {
        const headers = [
          'ID',
          'NAME',
          'SOURCE_DB',
          'SOURCE_ID',
          'REGISTRATION_NUMBER_BEFORE',
          'REGISTRATION_NUMBER_CURRENT',
          'ORIGIN_COUNTRY',
          'CURRENT_COUNTRY',
          'TITLE_BEFORE',
          'TITLE_AFTER',
          'BREED',
          'COLOR',
          'COLOR_CODE',
          'BIRTH_DATE',
          'GENDER',
          'CHIP',
          'NOTE(DESCRIPTION)',
          'AWARDS',
          'HEALTH_STATUS',
          'CATTERY',
          'MOTHER_ID',
          'FATHER_ID',
          'MOTHER_NAME',
          'FATHER_NAME',
          'MOTHER_CATTERY',
          'FATHER_CATTERY',
          'MOTHER_REG_NUMBER',
          'FATHER_REG_NUMBER',
        ]

        let parser = parse(
          fileContent,
          {
            delimiter: '|',
            columns: headers,
          },
          (error, result: Cats[]) => {
            if (error) {
              catsForImport = []
            }
            catsForImport = result
          }
        )
        parser.on('end', function () {
          createCats(catsForImport)
          resolve({
            message: 'Cats imported',
          })
        })
        parser.on('error', function () {
          resolve({
            message: 'Bad csv',
          })
        })
      })

      return parser.then((data) => {
        return data
      })
    } catch (error) {
      return {
        error: 'Cat not found',
      }
    }
  }
}
