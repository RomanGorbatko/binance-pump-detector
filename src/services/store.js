import monk from 'monk'
import Time from '../helpers/time'

export default class Store {

  constructor (database) {
    this.instance = monk(database).get('pairs')

    Array.prototype.groupBy = function(prop) {
      return this.reduce(function(groups, item) {
        const val = item[prop]
        groups[val] = groups[val] || []
        groups[val].push(item)
        return groups
      }, {})
    }
  }

  log (data) {
    return this.instance.insert(data)
  }

  async getByTimeStamp (timestamp) {
    if (timestamp > Time.getCurrentTimestamp()) {
      await Time.delay()

      return await this.getByTimeStamp(timestamp)
    }

    let data = await this.instance.find({timestamp: {'$lt': timestamp}})

    return data.groupBy('pair')
  }

  async reset () {
    return await this.instance.remove({})
  }
}
