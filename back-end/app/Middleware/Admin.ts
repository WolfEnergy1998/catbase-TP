import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Admin {
  public async handle({ request, auth }: HttpContextContract, next: () => Promise<void>) {
    await auth.user?.load('role')
    await auth.user?.load('breeds')
    if (auth.user?.role.name === 'SUPERADMIN' || auth.user?.role.name === 'ADMIN') {
      if (auth.user?.role.name === 'ADMIN') {
        if (request.url().includes('cats')) {
          if (!auth.user?.breeds.map((breed) => breed.code).includes(request.body().breed.code)) {
            throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
          }
        }
      }
      await next()
    }
  }
}
