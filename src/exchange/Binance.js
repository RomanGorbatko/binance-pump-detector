import Time from '../helpers/time'
import BinanceNode from 'binance-api-node'

export default class Binance {

  constructor (key, secret) {
    this.instance = BinanceNode({
      apiKey: key,
      apiSecret: secret,
    })

    this.cache = {}
  }

  setStore (store) {
    this.store = store
  }

  async pairs () {
    if (this.cache[Time.getCurrentTimestamp()]) {
      return this.cache[Time.getCurrentTimestamp()]
    }

    let pairs = await this.instance.prices()
    let result = {}

    Object.keys(pairs).forEach(key => {
      if (key.slice(-3) === 'BTC') {
        result[key] = pairs[key]
      }
    })

    this.cache[Time.getCurrentTimestamp()] = result

    return Object.keys(result)
  }


  async runListener (pairs) {
    let self = this

    return await this.instance.ws.candles(pairs, '1m', symbol => {
      this.store.log({
        'pair': symbol.symbol,
        'value': symbol.close,
        'timestamp': Time.getCurrentTimestamp()
      })
    });
  }

}
