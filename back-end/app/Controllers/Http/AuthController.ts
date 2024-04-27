import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'

export default class AuthController {
  private generateCode() {
    const possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 20; i++) {
      code += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
    }
    return code
  }

  async sendRegMail(user: User) {
    //generate code that is 20 characters long of random alpha letters and numbers
    let code = this.generateCode()
    while ((await User.findBy('code', code)) !== null) {
      code = this.generateCode()
    }
    user.code = code
    user.verified = false
    user.email_date = DateTime.now()
    let url = ''
    if (Env.get('NODE_ENV') === 'production') {
      url = 'https://api.infocat.info/auth/verify/' + code
    } else {
      url = 'http://127.0.0.1:3333/auth/verify/' + code
    }
    await Mail.send((message) => {
      message
        .from('timacikusiacik@gmail.com')
        .to(user.email)
        .subject('Verification email')
        .htmlView('emails/verification', {
          user: user,
          url: url,
        })
    })
  }

  async verifyUser({ view, request }: HttpContextContract) {
    let code = request.params().code
    let user = await User.findBy('code', code)
    if (user !== null && user.verified === false && user.verified !== null) {
      user.verified = true
      await user.save()
      return view.render('emails/verification_good')
    } else {
      return view.render('emails/verification_bad')
    }
  }

  async register({ request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(RegisterUserValidator)
    const user = await User.create(data)
    await this.sendRegMail(user)
    //user basic
    user.roleId = 1
    await user.save()
    await user!.load('role')
    await user!.load('breeds')
    return user
  }

  async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    return auth.use('api').attempt(email, password)
  }

  async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  async me({ auth }: HttpContextContract) {
    await auth.user!.load('role')
    let user = auth.user!
    await user!.load('breeds')

    return user
  }

  async getRoles({}: HttpContextContract) {
    return await Role.query().orderBy('id', 'asc').exec()
  }
}
