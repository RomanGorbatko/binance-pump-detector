import TelegramApi from 'node-telegram-bot-api'
import User from '../store/User'

import fs from 'fs'

export default class Telegram {
  constructor (token) {
    this.telegramApi = new TelegramApi(token, {polling: true})
    this.userModel = new User()
  }

  run () {
    this.listen()
  }

  listen () {
    this.telegramApi.onText(/\/start/, (message) => this.listenerStart(message))
  }

  async listenerStart (message) {
    let user = await this.userModel.findOrCreate(message.chat)

    this.telegramApi.sendMessage(user.id, `🚀🚀🚀 Hi ${message.chat.first_name || message.chat.username}, \n Welcome to have a rich profit! 🚀🚀🚀`);
    this.telegramApi.sendVideo(user.id, 'BAADAgADJAEAAsSSMEqp7-3pBvQFZAI');
  }

  async notifyUser (userId, message) {
    await this.telegramApi.sendMessage(userId, `💥💥💥\n${message}`)
  }
}
