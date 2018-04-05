import monk from 'monk'

export default class Store {

  constructor (database) {
    this.mongoInstance = monk(database)
  }

}
