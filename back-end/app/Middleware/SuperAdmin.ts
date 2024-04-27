import { AuthenticationException } from '@adonisjs/auth/build/src/Exceptions/AuthenticationException'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SuperAdmin {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    await auth.user?.load('role')
    if (auth.user?.role.name !== 'SUPERADMIN')
      throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')

    await next()
  }
}
