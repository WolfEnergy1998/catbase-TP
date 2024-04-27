import Database from '@ioc:Adonis/Lucid/Database'

export default class CatTreeService {
  static findMeObj(arr: any[], id: number, generation: number) {
    let obj = arr.find(
      (e) => e.id === id && e.used === false && e.generation_number === generation + 1
    )
    if (obj) obj.used = true
    return obj === undefined ? {} : obj
  }

  public static async getTree(catId: number, generations: number): Promise<any> {
    let data = await Database.rawQuery(
      `WITH RECURSIVE
        data AS
            (
                SELECT
                c.id,
                c.gender,
                false as used,
                random():: text as idef,
                c.name,
                c.color_code,
                c.date_of_birth::DATE::text,
                c.color,
                b.code,
                c.reg_num_current,
                cr.father_name,
                cr.father_id,
                cr.mother_name,
                cr.mother_id,
                ci.chip,
                0 AS generation_number
                FROM cats c
				        LEFT JOIN breeds b on b.id = c.breed_id
				        LEFT JOIN cat_references cr on c.id = cr.cat_id
				        LEFT JOIN cat_informations ci ON ci.cat_id = c.id
				        WHERE c.id = ${catId}
                UNION ALL

                SELECT
                c.id,
                c.gender,
                false as used,
                random():: text as idef,
                c.name,
                c.color_code,
                c.date_of_birth::DATE::text,
                c.color,
                b.code,
                c.reg_num_current,
                cr.father_name,
                cr.father_id,
                cr.mother_name,
                cr.mother_id,
                ci.chip,
                generation_number+1 AS generation_number
                FROM cats c
                LEFT JOIN cat_references cr on c.id = cr.cat_id
                LEFT JOIN breeds b on b.id = c.breed_id
                LEFT JOIN cat_informations ci ON ci.cat_id = c.id
                JOIN data ON c.id = data.father_id OR c.id = data.mother_id
                WHERE generation_number < ${generations} AND c.deleted_at IS NULL
            )
          SELECT *
          FROM data WHERE generation_number != 0;`
    )

    if (
      data.rows[0] !== undefined &&
      data.rows[1] !== undefined &&
      data.rows[0].gender === 'F' &&
      data.rows[1].gender === 'M'
    ) {
      let temp = data.rows[0]
      data.rows[0] = data.rows[1]
      data.rows[1] = temp
    }

    let modifiedArr = Array(Math.pow(2, generations + 1) - 2).fill(null)
    let j = 0
    for (let i = 0; i < data.rows.length; i++) {
      let e = data.rows[i]
      j = i
      if (modifiedArr.find((x) => x === null) === undefined) break
      while (modifiedArr[j] !== null) {
        j++
        if (j > modifiedArr.length) break
      }
      if (
        modifiedArr[j] === null &&
        modifiedArr.find((x) => x !== null && x.idef === e.idef) === undefined
      ) {
        modifiedArr[j] = e
      }
      j = modifiedArr.indexOf(modifiedArr.find((x) => x !== null && x.idef === e.idef))
      if (Math.pow(2, generations + 1) - 2 > j * 2 + 2) {
        if (modifiedArr[j * 2 + 2] === null) {
          let father = this.findMeObj(data.rows, e.father_id, e.generation_number as number)
          if (father.id === null) father.name = e.father_name ? e.father_name : null
          modifiedArr[j * 2 + 2] = father
        }
        if (modifiedArr[j * 2 + 3] === null) {
          let mother = this.findMeObj(data.rows, e.mother_id, e.generation_number as number)
          if (mother.id === null) mother.name = e.mother_name ? e.mother_name : null
          modifiedArr[j * 2 + 3] = mother
        }
      }
    }

    modifiedArr = modifiedArr.map((e) => {
      if (e === null) {
        return {}
      }
      return e
    })

    //fill empty object with generation_number
    for (let i = 0; i < modifiedArr.length; i++) {
      modifiedArr[i].generation_number = Math.floor(Math.log2(i + 2))
    }

    return modifiedArr.map(
      (e: {
        id: number | null
        name: string | null
        color_code: string | null
        date_of_birth: string | null
        code: string | null
        father_name: string | null
        father_id: number | null
        mother_name: string | null
        mother_id: number | null
      }) => {
        return {
          ...e,
          id: e.id ? btoa(e.id + '') : null,
          father_id: e.father_id ? btoa(e.father_id + '') : null,
          mother_id: e.mother_id ? btoa(e.mother_id + '') : null,
        }
      }
    )
  }
}
