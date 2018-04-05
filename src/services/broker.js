import User from '../store/User'

export default class Broker {

  static async processPairs (paris) {
    let result = {}

    Object.keys(paris).forEach(async pair => {
      const values = paris[pair]

      if (!values.length) return

      const startValue = parseFloat(values[0].value)
      const lastValue = parseFloat(values[values.length - 1].value)

      result[pair] = {
        start: startValue,
        last: lastValue,
        diff: lastValue - startValue,
        rate: Math.round((100 / (lastValue / (lastValue - startValue))) * 100) / 100
      }
    })

    return result
  }

  static processByRatio (ratio = 1, rateValues) {
    const ranges = Object.keys(rateValues).sort()

    let result = {}
    ranges.forEach(range => {
      let pairs = rateValues[range]

      Object.keys(pairs).forEach(pairName => {
        let pairData = pairs[pairName]

        if (!result[pairName]) {
          result[pairName] = []
        }

        result[pairName].push({
          range,
          value: pairData.rate
        })

        if (ranges[ranges.length - 1] === range && pairData.rate < ratio) {
          delete result[pairName]
        }
      })
    })

    return this.prepareString(result)
  }

  static prepareString (data) {
    if (!Object.keys(data).length) return

    return Object.keys(data).map(pair => {
      let results = data[pair].map(item => {
        return `${item.range}m: ${item.value}%`
      }).join(' / ')

      return `${pair}: ${results}`
    }).join("\n\n")
  }
}
