const CosmosV3API = require('./cosmosV3-source')

class TerraV4Api extends CosmosV3API {
  setReducers() {
    this.reducers = require('./terraV4-reducers')
  }
}

export default TerraV4Api
