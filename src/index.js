import death from 'death'

import Time from './helpers/time'
import Logger from './helpers/logger'
import Binance from './exchange/Binance'
import Store from './services/store'
import Broker from './services/broker'
import Telegram from './services/telegram'
import User from './store/User'

/**
 * 1. Записать текущее время
 * 2. Получить параметры диапазона
 * 3. Заинитить Инстанс биржи
 * 4. Заинитить стор
 * 5. Заинитить рейт
 */
let startTime = Time.getCurrentTimestamp()

const timeInRange = [0.5, 2, 3]
const ratio = 1


const storeInstance = new Store(process.env.MONGO_STRING)
const exchangeInstance = new Binance(process.env.BINANCE_API_KEY, process.env.BINANCE_API_SECRET)
const telegramInstance = new Telegram(process.env.TELEGRAM_API_KEY)

exchangeInstance.setStore(storeInstance)
telegramInstance.run()

/**
 * 5. Запустить прослушку на BTC пары, писать все данные в монгу, в формате:
 *
 * @code
 * {
 *  pair: 'BNBBTC',
 *  time: DateTime
 *  value: *close value*
 * }
 * @code
 */
;(async () => {
  const pairs = await exchangeInstance.pairs()

  await exchangeInstance.runListener(pairs)
})().catch(Logger.error)


/**
 *  6. Запустить обработчик диапазона минут
 *  7. После окончания считывания всех минут подбить разницу между
 *    стартовым значением каждой пары и конечного значения по каждой минуте
 */
;(async () => {
  await storeInstance.reset()

  const processor = async () => {
    let rateValues = []

    timeInRange.forEach(async minute => {
      let tsByMinute = Time.getTimestampByMinute(startTime, minute)

      let data = await storeInstance.getByTimeStamp(tsByMinute)

      rateValues[minute] = await Broker.processPairs(data)

      if (minute === timeInRange[timeInRange.length - 1]) {
        let result = await Broker.processByRatio(ratio, rateValues)
        console.log(result)
        if (result) {
          await (new User).notifyActiveUsers(result, telegramInstance)
        }


        await storeInstance.reset()
        startTime = Time.getCurrentTimestamp()

        await processor()
      }
    })
  }

  await processor()
})().catch(Logger.error)


death(() => {
  console.log('exit')
  storeInstance.reset()

  process.exit(99)
})
