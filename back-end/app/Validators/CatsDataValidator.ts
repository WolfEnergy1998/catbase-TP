import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CatsDataValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    per_page: schema.number(),
    page: schema.number(),
    order_by: schema.string.optional(),
    order_type: schema.string.optional(),
    sex: schema.enum.optional(['M', 'F']),
    born_after: schema.date.optional(),
    born_before: schema.date.optional(),
    country: schema.string.optional({}, []),
    breed: schema.string.optional({}, []),
    name: schema.string.optional({}, []),
    ems: schema.string.optional({}, []),
    id: schema.string.optional({}, []),
    father_name: schema.string.optional({}, []),
    mother_name: schema.string.optional({}, []),
  })
  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
