const CosmosV3API = require('./cosmosV3-source')

class TerraV2Api extends CosmosV3API {
  setReducers() {
    this.reducers = require('./terraV2-reducers')
  }
}

export default TerraV2Api
