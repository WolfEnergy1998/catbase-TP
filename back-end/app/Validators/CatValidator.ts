import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
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
    name: schema.string.nullable([], []),
    additionalInfo: schema.object.optional().members({
      id: schema.number.optional(),
      chip: schema.string.optional([], []),
      verifiedStatus: schema.string.optional([], []),
      titleBefore: schema.string.optional([], []),
      titleAfter: schema.string.optional([], []),
      cattery: schema.string.optional([], []),
    }),
    breed: schema.object().members({
      id: schema.number(),
      code: schema.string(),
    }),
    reference: schema.object.optional().members({
      id: schema.number.optional(),
      father: schema.object.optional().members({
        id: schema.string.nullable(),
      }),
      mother: schema.object.optional().members({
        id: schema.string.nullable(),
      }),
    }),
    links: schema.array.optional().members(
      schema.object().members({
        id: schema.number.nullable(),
        content: schema.string(),
        type: schema.string(),
      })
    ),
    countryCurrent: schema.string.optional([], []),
    countryOrigin: schema.string.optional([], []),
    gender: schema.string.optional([], [rules.maxLength(1)]),
    color: schema.string.optional([], []),
    colorCode: schema.string.optional([], []),
    dateOfBirth: schema.string.optional([], []),
    regNumCurrent: schema.string.optional([], []),
    regNumOrigin: schema.string.optional([], []),
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
