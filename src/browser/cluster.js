import cluster from './cluster.html'
import Address from './address.js'

export default class Cluster extends Address {
  constructor (dispatcher, data, index) {
    super(dispatcher, data, index)
    this.template = cluster
    this.options =
      [
        {icon: 'sign-in-alt', optionText: 'Incoming neighbors', message: 'initIndegreeTable'},
        {icon: 'sign-out-alt', optionText: 'Outgoing neighbors', message: 'initOutdegreeTable'},
        {icon: 'at', optionText: 'Addresses', message: 'initAddressesTable'},
        {icon: 'tags', optionText: 'Tags', message: 'initTagsTable'},
        {icon: 'plus', optionText: 'Add to graph', message: 'addNode'}
      ]
  }
  requestData () {
    return {id: this.data.id, type: 'cluster', index: this.index}
  }
}
