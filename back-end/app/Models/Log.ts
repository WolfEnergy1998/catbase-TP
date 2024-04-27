import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Log extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public event: string | null

  @column()
  public value: string | null

  @column()
  public cron: string | null

  @column()
  public timestamp: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
