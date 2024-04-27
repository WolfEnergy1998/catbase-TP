import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Breed from 'App/Models/Breed'
import Cat from 'App/Models/Cat'
import CatInformation from 'App/Models/CatInformation'
import CatReference from 'App/Models/CatReference'
import Link from 'App/Models/Link'
import CatTreeService from 'App/Services/CatTreeService'
import CatsDataValidator from 'App/Validators/CatsDataValidator'
import CatValidator from 'App/Validators/CatValidator'
import { DateTime } from 'luxon'
import * as console from 'console'

export default class CatController {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async getCat({ request }: HttpContextContract) {
    try {
      let catId = atob(request.params().id)

      let cat = await Cat.query()
        .preload('history')
        .preload('breed')
        .preload('information')
        .preload('reference', (query) => query.preload('father').preload('mother'))
        .preload('links')
        .where('id', catId)
        .first()
      if (cat === null) throw new Error('Cat not found')

      return cat?.serialize()
    } catch (error) {
      return {
        error: 'Cat not found',
      }
    }
  }

  async deleteCat({ request }: HttpContextContract) {
    try {
      let catId = atob(request.params().id)

      let cat = await Cat.query().where('id', catId).first()
      if (cat) {
        await cat.softDelete()
        return {
          message: 'Cat deleted',
        }
      } else {
        throw new Error('Cat not found')
      }
    } catch (error) {
      return {
        error: 'Cat not found',
      }
    }
  }

  async createCat({ request }: HttpContextContract) {
    const data = await request.validate(CatValidator)
    try {
      let breed = null as Breed | null
      if (data.breed) {
        breed = await Breed.query().where('code', data.breed.code).first()
        if (breed === null) throw new Error('Breed not found')
      }
      let cat = await Cat.create({
        gender: data.gender as 'F' | 'M',
        name: data.name,
        countryOrigin: data.countryOrigin,
        countryCurrent: data.countryCurrent,
        color: data.color,
        colorCode: data.colorCode,
        dateOfBirth: data.dateOfBirth
          ? DateTime.fromFormat(data.dateOfBirth, 'yyyy-MM-dd')
          : undefined,
        breedId: breed ? (breed!.id as number) : null,
        regNumCurrent: data.regNumCurrent,
        regNumOrigin: data.regNumOrigin,
      })

      if (data.additionalInfo) {
        await CatInformation.create({
          catId: cat.id,
          chip: data.additionalInfo.chip,
          titleAfter: data.additionalInfo.titleAfter,
          titleBefore: data.additionalInfo.titleBefore,
          verifiedStatus: data.additionalInfo.verifiedStatus,
          cattery: data.additionalInfo.cattery,
        })
      }

      if (data.links) {
        await Link.createMany(
          data.links.map((link) => ({
            content: link.content,
            catId: cat.id,
            type: link.type as 'HEALTH_STATUS' | 'NOTE' | 'URL' | 'AWARD',
          }))
        )
      }

      if (data.reference) {
        await CatReference.create({
          catId: cat.id,
          fatherId:
            data.reference.father === undefined
              ? null
              : parseInt(atob(data.reference.father.id as string)),
          motherId:
            data.reference.mother === undefined
              ? null
              : parseInt(atob(data.reference.mother.id as string)),
        })
      }
      await cat.save()
      return {
        message: 'Cat created',
      }
    } catch (error) {
      return {
        error: 'Cat not found',
      }
    }
  }

  async updateCat({ request }: HttpContextContract) {
    const data = await request.validate(CatValidator)
    try {
      let catId = atob(request.params().id)
      let breed = null as Breed | null
      if (data.breed) {
        breed = await Breed.query().where('code', data.breed.code).first()
        if (breed === null) throw new Error('Breed not found')
      }

      let cat = await Cat.query().where('id', catId).first()
      if (cat && breed) {
        cat.gender = data.gender as 'F' | 'M'
        cat.name = data.name
        cat.countryOrigin = data.countryOrigin
        cat.countryCurrent = data.countryCurrent
        cat.color = data.color
        cat.colorCode = data.colorCode
        cat.dateOfBirth = data.dateOfBirth
          ? DateTime.fromFormat(data.dateOfBirth, 'yyyy-MM-dd')
          : undefined
        cat.regNumCurrent = data.regNumCurrent
        cat.regNumOrigin = data.regNumOrigin
        if (breed) {
          await cat.related('breed').dissociate()
          await cat.related('breed').associate(breed)
        }
        await cat.save()

        if (data.additionalInfo) {
          let info = await CatInformation.query().where('catId', catId).first()
          if (info) {
            info.chip = data.additionalInfo.chip === undefined ? null : data.additionalInfo.chip
            info.titleAfter =
              data.additionalInfo.titleAfter === undefined ? null : data.additionalInfo.titleAfter
            info.titleBefore =
              data.additionalInfo.titleBefore === undefined ? null : data.additionalInfo.titleBefore
            info.verifiedStatus =
              data.additionalInfo.verifiedStatus === undefined
                ? null
                : data.additionalInfo.verifiedStatus
            info.cattery =
              data.additionalInfo.cattery === undefined ? null : data.additionalInfo.cattery
            await info.save()
          } else {
            await CatInformation.create({
              catId: cat.id,
              chip: data.additionalInfo.chip,
              titleAfter: data.additionalInfo.titleAfter,
              titleBefore: data.additionalInfo.titleBefore,
              verifiedStatus: data.additionalInfo.verifiedStatus,
              cattery: data.additionalInfo.cattery,
            })
          }
        }

        //TODO update links
        let dbLinks = await Link.query().where('catId', catId)

        if (data.links) {
          for (let link of data.links) {
            let dbLink = dbLinks.find((l) => l.id === link.id)
            if (dbLink) {
              dbLinks.splice(dbLinks.indexOf(dbLink), 1)

              dbLink.content = link.content
              dbLink.type = link.type as 'HEALTH_STATUS' | 'NOTE' | 'URL' | 'AWARD'
              await dbLink.save()
            } else {
              await Link.create({
                content: link.content,
                catId: cat.id,
                type: link.type as 'HEALTH_STATUS' | 'NOTE' | 'URL' | 'AWARD',
              })
            }
          }
        }
        if (dbLinks.length > 0) {
          await Link.query()
            .whereIn(
              'id',
              dbLinks.map((l) => l.id)
            )
            .delete()
        }

        if (data.reference) {
          let ref = await CatReference.query().where('catId', catId).first()
          if (ref) {
            ref.fatherId =
              data.reference.father === undefined
                ? null
                : parseInt(atob(data.reference.father.id as string))
            if (data.reference.father === undefined) ref.fatherName = undefined
            ref.motherId =
              data.reference.mother === undefined
                ? null
                : parseInt(atob(data.reference.mother.id as string))
            if (data.reference.mother === undefined) ref.motherName = undefined
            await ref.save()
          } else {
            await CatReference.create({
              catId: cat.id,
              fatherId:
                data.reference.father === undefined
                  ? null
                  : parseInt(atob(data.reference.father.id as string)),
              motherId:
                data.reference.mother === undefined
                  ? null
                  : parseInt(atob(data.reference.mother.id as string)),
            })
          }
        }
      } else {
        throw new Error('Cat not found')
      }

      return {
        message: 'Cat updated',
      }
    } catch (error) {
      console.log(error)
      return {
        error: error.message,
      }
    }
  }

  async getOffspringData(catId: string, gender: string) {
    console.log(catId, gender)
    return await Database.rawQuery(
      `SELECT
      json_agg(
        jsonb_build_object(
          'offspring_count', data.count,
          'id',data.id,
          'name',data.name,
          'gender',data.gender,
          'color_code',data.color_code,
          'date_of_birth',data.date_of_birth :: DATE :: text ,
          'code',data.code
          )
      ) as offsprings,
          data.parent, data.litter_date
      FROM (
              SELECT
                  c.id,
                  COUNT(cf2) as count
              FROM cats c
                  LEFT JOIN cat_references cf on cf.cat_id = c.id
                  LEFT JOIN cat_references cf2 on cf2.father_id = c.id or cf2.mother_id = c.id
              WHERE (cf.${gender === 'F' ? 'mother_id' : 'father_id'} = ${catId})
                  AND c.deleted_at IS NULL GROUP BY c.id
          ) counts
          LEFT JOIN LATERAL (
              SELECT
                  counts.count,
                  c.id,
                  c.name,
                  c.gender,
                  c.color_code,
                  c.date_of_birth :: DATE :: text,
                  b.code,
                  jsonb_build_object(
                      'id',
                      second_parent.id,
                      'name',
                      second_parent.name,
                      'gender',
                      second_parent.gender,
                      'color_code',
                      second_parent.color_code,
                      'date_of_birth',
                      second_parent.date_of_birth :: DATE :: text,
                      'code',
                      b2.code
                  ) as parent,
                  c.date_of_birth :: DATE :: text as litter_date
              FROM cats c
                  LEFT JOIN breeds b ON b.id = c.breed_id
                  LEFT JOIN cat_references cf on cf.cat_id = c.id
                  LEFT JOIN cats second_parent on cf.${
                    gender === 'M' ? 'mother_id' : 'father_id'
                  } = second_parent.id
                  LEFT JOIN breeds b2 ON b2.id = second_parent.breed_id
          WHERE c.id = counts.id
          ) data ON true
      GROUP BY data.parent, data.litter_date
      order by data.litter_date
      `
    )
  }

  async getFoundation({ request }: HttpContextContract) {
    try {
      let catId = atob(request.params().id)
      let data = await Database.rawQuery(
        `
        SELECT
            c.id,
            c.name,
            c.gender,
            c.color_code,
            c.date_of_birth,
            c.code,
            c.generation_number,
            father_id,
            mother_id,
            SUM(probability) AS probability
        FROM (
                WITH RECURSIVE data AS (
                        SELECT
                            c.id,
                            c.name,
                            c.gender,
                            c.color_code,
                            c.date_of_birth :: DATE :: text,
                            b.code,
                            cr.father_id,
                            cr.mother_id,
                            0 AS generation_number
                        FROM cats c
                            LEFT JOIN breeds b on b.id = c.breed_id
                            LEFT JOIN cat_references cr on c.id = cr.cat_id
                        WHERE c.id = ${catId}
                        UNION ALL
                        SELECT
                            c.id,
                            c.name,
                            c.gender,
                            c.color_code,
                            c.date_of_birth :: DATE :: text,
                            b.code,
                            cr.father_id,
                            cr.mother_id,
                            generation_number + 1 AS generation_number
                        FROM cats c
                            LEFT JOIN cat_references cr on c.id = cr.cat_id
                            LEFT JOIN breeds b on b.id = c.breed_id
                            JOIN data ON (
                                c.id = data.father_id OR c.id = data.mother_id
                            )
                        WHERE
                            c.deleted_at IS NULL
                            AND generation_number < 15
                    )
                SELECT
                    data.id,
                    data.name,
                    data.gender,
                    data.color_code,
                    data.date_of_birth,
                    data.code,
                    generation_number,
                    father_id,
                    mother_id,
                    1 / 2 ^ generation_number AS probability
                FROM data
                WHERE
                    generation_number != 0
                    AND ( (
                            father_id is NULL
                            and mother_id IS NULL
                        )
                        OR (
                            father_id is NULL
                            and mother_id IS NOT NULL
                        )
                        OR (
                            father_id is NOT NULL
                            and mother_id IS NULL
                        )
                    )
            ) c
        GROUP BY
            c.id,
            c.name,
            c.gender,
            c.color_code,
            c.date_of_birth,
            c.code,
            c.generation_number,
            c.father_id,
            c.mother_id
        ORDER BY probability DESC;`
      )

      for (let foundation of data.rows) {
        if (foundation.id) {
          foundation.id = btoa(foundation.id.toString())
          if (foundation.father_id === null && foundation.mother_id !== null) {
            data.rows.push({
              name: 'Unknown sire of ' + foundation.name,
              probability: 1 / 2 ** (foundation.generation_number + 1),
            })
          }
          if (foundation.mother_id === null && foundation.father_id !== null) {
            data.rows.push({
              name: 'Unknown dam of ' + foundation.name,
              probability: 1 / 2 ** (foundation.generation_number + 1),
            })
          }
        }
      }

      data.rows.sort((a: any, b: any) => b.probability - a.probability)

      return data.rows
    } catch (error) {
      console.log(error)
      return {
        error: 'Foundation not found',
      }
    }
  }

  async getOffsprings({ request }: HttpContextContract) {
    try {
      let catId = atob(request.params().id)
      let data = await this.getOffspringData(catId, 'F')
      if (data.rows.length === 0) data = await this.getOffspringData(catId, 'M')

      let modif = data.rows.filter((e: any) => e.parent.id !== null)

      for (let litter of modif) {
        litter.parent.id = btoa(litter.parent.id.toString())
        litter.offsprings = litter.offsprings.map((offspring: any) => {
          offspring.id = btoa(offspring.id.toString())
          return offspring
        })
      }

      return modif
    } catch (error) {
      console.log(error)
      return {
        error: 'Offsprings not found',
      }
    }
  }

  findMeObj(arr: any[], id: number, generation: number) {
    let obj = arr.find(
      (e) => e.id === id && e.used === false && e.generation_number === generation + 1
    )
    if (obj) obj.used = true
    return obj === undefined ? { generation_number: generation + 1 } : obj
  }

  async getPedigree({ request }: HttpContextContract) {
    try {
      let catId = atob(request.params().id)
      let pedigreeGenerations = parseInt(
        request.only(['gen']).gen ? request.only(['gen']).gen : '1'
      )
      return await CatTreeService.getTree(parseInt(catId), pedigreeGenerations)
    } catch (error) {
      console.log(error)
      return {
        error: 'Cat not found',
      }
    }
  }

  async getCats({ request }: HttpContextContract) {
    try {
      const data = await request.validate(CatsDataValidator)
      if (data['order_by'] === undefined) data['order_by'] = 'id'
      if (data['order_type'] === undefined) data['order_type'] = 'asc'
      if (data['sex'] === 'male') data['sex'] = 'M'
      if (data['sex'] === 'female') data['sex'] = 'F'
      if (data['order_by'] === 'breed') data['order_by'] = 'breedCode'

      // if invalid, exception
      let catQuery = Cat.query()
      try {
        if (data.id !== undefined)
          catQuery = catQuery.where('cats.id', '=', `${parseInt(atob(data.id))}`)
      } catch (error) {}
      if (data.name !== undefined) catQuery = catQuery.where('cats.name', 'ilike', `%${data.name}%`)
      if (data.sex !== undefined) catQuery = catQuery.where('cats.gender', '=', `${data.sex}`)
      if (data.country !== undefined)
        catQuery = catQuery.where('cats.country_current', '=', `${data.country}`)
      if (data.father_name !== undefined)
        catQuery = catQuery.where('c2.name ', 'ilike', `%${data.father_name}%`)
      if (data.mother_name !== undefined)
        catQuery = catQuery.where('c1.name', 'ilike', `%${data.mother_name}%`)
      if (data.ems !== undefined)
        catQuery = catQuery.where('cats.color_code', 'ilike', `%${data.ems}%`)
      if (data.born_after !== undefined)
        catQuery = catQuery.where('cats.date_of_birth', '>=', `%${data.born_after}%`)
      if (data.born_before !== undefined)
        catQuery = catQuery.where('cats.date_of_birth', '<=', `%${data.born_before}%`)
      if (data.breed !== undefined)
        catQuery = catQuery.whereHas('breed', (query) => {
          query.where('code', `${data.breed}`)
        })

      if (data.father_name !== undefined || data.mother_name !== undefined)
        catQuery = catQuery
          .join('cat_references', 'cat_references.cat_id', 'cats.id')
          .join('cats as c1', 'cat_references.mother_id', 'c1.id')
          .join('cats as c2', 'cat_references.father_id', 'c2.id')

      const count = await catQuery.clone().count('* as count').first()

      catQuery = catQuery
        .leftJoin('breeds', 'cats.breed_id', 'breeds.id')
        .select('cats.*')
        .select('breeds.code as breedCode')

      const cats = await catQuery
        .preload('history')
        .preload('links')
        .preload('breed')
        .preload('information')
        .preload('reference', (query) => query.preload('father').preload('mother'))
        .limit(data.per_page)
        .offset(data.page * data.per_page)
        .orderBy(data['order_by'], data['order_type'] as 'asc' | 'desc')
        .exec()

      return {
        metadata: {
          page: data.page,
          per_page: data.per_page,
          pages: Math.ceil(count?.$extras.count / data.per_page) - 1,
          total: parseInt(count?.$extras.count),
        },
        items: cats.map((cat) => cat.serialize()),
      }
    } catch (error) {
      console.log(error)
      return {
        error: 'Something went wrong',
      }
    }
  }

  async getCatNamesByAlphabet({ request }: HttpContextContract) {
    const data = await request.validate(CatsDataValidator)
    const catCharacter = request.params().character
    if (data['order_by'] === undefined) data['order_by'] = 'name'
    if (data['order_type'] === undefined) data['order_type'] = 'asc'
    if (data['per_page'] === undefined) data['per_page'] = 100
    if (data['page'] === undefined) data['page'] = 0
    if (data['sex'] === undefined) data['sex'] = '%'

    try {
      let cat = await Database.rawQuery(
        `SELECT DISTINCT name, gender, random() as randomX FROM cats WHERE gender ilike '${
          data.sex
        }' AND name ilike '${catCharacter}%' AND length(name) > 3 ORDER BY randomX LIMIT ${
          data['per_page']
        } OFFSET ${data['page'] * data['per_page']}`
      )

      const count = await Database.rawQuery(
        `SELECT DISTINCT COUNT(name) as count FROM cats WHERE gender ilike '${data.sex}' AND name ilike '${catCharacter}%' AND length(name) > 3`
      )

      return {
        metadata: {
          page: data.page,
          per_page: data.per_page,
          pages: Math.ceil(count.rows[0].count / data.per_page) - 1,
          total: parseInt(count.rows[0].count),
        },
        items: cat.rows,
      }
    } catch (error) {
      let cat = {
        error: 'error on catnames/:character endpoint',
      }
      return cat
    }
  }

  async countCats() {
    try {
      const count = await Cat.query().count('* as count').first()
      return {
        count: count?.$extras.count,
      }
    } catch (error) {
      console.log(error)
      return {
        error: 'Something went wrong',
      }
    }
  }
}
