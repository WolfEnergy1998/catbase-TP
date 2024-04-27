import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class UserNotVerifDelete {
  public static get schedule() {
    return '0 0 * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    let users = await User.query()
      .where('verified', false)
      .where('email_date', '<', DateTime.local().minus({ days: 1 }).toFormat('yyyy-MM-dd HH:mm:ss'))
    await User.query()
      .where('verified', false)
      .where('email_date', '<', DateTime.local().minus({ days: 1 }).toFormat('yyyy-MM-dd HH:mm:ss'))
      .delete()
    if (users.length > 0) {
      console.log(
        'USERS THAT ARE NOT VERIFIED => DELETED: ',
        users.map((user) => user.email)
      )
    }
  }
}
