import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Log from 'App/Models/Log'
import { DateTime } from 'luxon'

export default class LogsController {
  async getLogsByCron({ params, request }: HttpContextContract) {
    try {
      const { cron } = params

      let uppercaseCron: string = cron.toUpperCase()

      // Fetch logs with the specified cron
      const logs = await Log.query().where('cron', uppercaseCron).select('event', 'value', 'timestamp').orderBy('timestamp', 'desc').limit(20)

      return {
        message: 'Logs fetched successfully',
        data: logs
      }
    } catch (error) {
      console.error(error)
      return {
        message: 'Internal server error',
        error: error.message
      }
    }
  }

  async getLogsByEvent({ params, request }: HttpContextContract) {
    try {
      const { event } = params

      let uppercaseEvent: string = event.toUpperCase()

      // Fetch logs with the specified cron
      const logs = await Log.query().where('event', uppercaseEvent).select('value', 'timestamp', 'cron').orderBy('timestamp', 'desc').limit(20)

      return {
        message: 'Logs fetched successfully',
        data: logs
      }
    } catch (error) {
      console.error(error)
      return {
        message: 'Internal server error',
        error: error.message
      }
    }
  }

  async createLog({ request }: HttpContextContract) {
    try{
      const { event, value, cron } = request.body()
      // VALIDATE INPUTS
      if (!event || !value || !cron) {
        return {
          message: 'Please provide all required fields'
        }
      }

      const log = await Log.create({ event, value, cron, timestamp: DateTime.now() })

      // SAVE TO DB
      await log.save()

      return {
        message: 'Log created successfully',
        data: log
      }
    } catch (error) {
      return {
        message: 'Internal server error',
        error: error.message
      }
    }
  }
}
