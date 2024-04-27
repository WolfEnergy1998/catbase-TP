import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class StatsController {
  async groupByBreeds({}: HttpContextContract) {
    let data = await Database.rawQuery(
      'SELECT breeds.code as name, COUNT(*) AS count FROM cats INNER JOIN breeds ON cats.breed_id = breeds.id GROUP BY breeds.code ORDER BY count DESC'
    )
    return data.rows.map((e: { name: any; count: string }) => {
      return { name: e.name, count: parseInt(e.count) }
    })
  }

  async groupByYear({}: HttpContextContract) {
    let data = await Database.rawQuery(
      'SELECT extract(year from cats.date_of_birth) as name, COUNT(*) AS count FROM cats WHERE cats.date_of_birth is not null GROUP BY extract(year from cats.date_of_birth) ORDER BY count DESC'
    )
    return data.rows.map((e: { name: any; count: string }) => {
      return { name: e.name, count: parseInt(e.count) }
    })
  }

  async groupByCurrentCountry({}: HttpContextContract) {
    let data = await Database.rawQuery(
      "SELECT cats.country_current as name, COUNT(*) AS count FROM cats WHERE cats.country_current is not null and cats.country_current != '-' GROUP BY cats.country_current ORDER BY count DESC"
    )
    return data.rows.map((e: { name: any; count: string }) => {
      return { name: e.name, count: parseInt(e.count) }
    })
  }

  async getCatYears() {
    const result = await Database.from('cats')
      .select(Database.raw('extract(year from date_of_birth) as yearOfBirth'))
      .whereNotNull('date_of_birth')

    const yearsOfBirth = result.map((row) => row.yearOfBirth)

    return yearsOfBirth
  }

  async getBreedCount({ request }: HttpContextContract) {
    let year = request.body().year
    let data = await Database.rawQuery(
      `SELECT breeds.code as name, COUNT(*) AS count FROM cats INNER JOIN breeds ON cats.breed_id = breeds.id WHERE EXTRACT(YEAR FROM cats.date_of_birth) = ${year} GROUP BY breeds.code ORDER BY count DESC`
    )

    return data.rows.reduce((acc, e) => {
      acc[e.name] = parseInt(e.count)
      return acc
    }, {})
  }

  async getBreedYearCount({ request }: HttpContextContract) {
    let breedsArray = request.body().breeds
    if (breedsArray.length === 0) {
      return {}
    }
    let stringArray = ''
    if (breedsArray.length === 1) {
      stringArray = breedsArray.map((str) => `'${str}'`).join('')
    } else {
      stringArray = breedsArray.map((str) => `'${str}', `).join('')
      stringArray = stringArray.slice(0, -2)
    }

    let data = await Database.rawQuery(
      `SELECT breeds.code, EXTRACT(year FROM cats.date_of_birth) AS birth_year, COUNT(*) AS cat_count
      FROM cats
      INNER JOIN breeds ON cats.breed_id = breeds.id
      WHERE breeds.code IN (${stringArray})
      AND cats.date_of_birth IS NOT NULL
      GROUP BY breeds.code, birth_year
      ORDER BY breeds.code, birth_year`
    )

    const currentYear = new Date().getFullYear()

    const result = data.rows.reduce((acc, e) => {
      acc[e.code] = acc[e.code] || {
        birth_year_array: [],
        cat_count_array: [],
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      }

      const birthYear = parseInt(e.birth_year)
      if (birthYear >= 1899 && birthYear <= currentYear) {
        acc[e.code].birth_year_array.push(birthYear)
        acc[e.code].cat_count_array.push(parseInt(e.cat_count))
      }

      return acc
    }, {})
    return result
  }
}
