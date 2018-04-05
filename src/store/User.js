import Store from './store'
import Telegram from '../services/telegram'

export default class User extends Store {
  constructor () {
    super(process.env.MONGO_STRING)

    this.model = this.mongoInstance.get('users')
  }

  getModel () {
    return this.model
  }

  async getUser (id) {
    return await this.getModel().findOne({id})
  }

  async getActiveUsers () {
    return await this.getModel().find() //{active: true}
  }

  async findOrCreate (chat) {
    let user = await this.getUser(chat.id)

    if (user === null) {
      await this.createFromChat(chat)

      return await this.findOrCreate(chat)
    }

    return user
  }

  async createFromChat (chat) {
    return await this.getModel().insert(chat)
  }

  async notifyActiveUsers (text, notifier) {
    let users = await this.getActiveUsers()

    users.forEach(async user => {
      try {
        await notifier.notifyUser(user.id, text)
      } catch (e) {
        console.log(e)
      }
    })
  }
}
