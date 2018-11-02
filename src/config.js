import layout from './config/layout.html'
import graphConfig from './config/graph.html'
import addressConfig from './config/address.html'
import clusterConfig from './config/cluster.html'
import filter from './config/filter.html'
import {replace} from './template_utils.js'
import {firstToUpper} from './util.js'

export default class Config {
  constructor (dispatcher, graph, labelType) {
    this.dispatcher = dispatcher
    this.root = document.createElement('div')
    this.root.className = 'h-full'
    this.labelType = labelType
    this.view = 'graph'
    this.graph = graph
    this.dispatcher.on('selectNode.config', ([type, nodeId]) => {
      console.log('selectNode.config', this.graph, nodeId)
      this.view = type
      let nodes
      if (type === 'address') {
        nodes = this.graph.addressNodes
      } else {
        nodes = this.graph.clusterNodes
      }
      this.node = nodes.get(nodeId)
      console.log('node', type, this.node)
      this.render()
    })
  }
  render () {
    this.root.innerHTML = layout
    this.root.querySelector('button#navbar-config')
      .addEventListener('click', () => {
        this.view = 'graph'
        this.render()
      })
    let el = this.root.querySelector('#config')
    switch (this.view) {
      case 'graph':
        el.innerHTML = graphConfig
        let select = el.querySelector('select#clusterLabel')
        let i = 0
        for (; i < select.options.length; i++) {
          console.log(select.options[i].value)
          console.log(this.labelType)
          if (select.options[i].value === this.labelType) break
        }
        console.log('selectedIndex', i)
        select.options.selectedIndex = i
        select.addEventListener('change', (e) => {
          let labelType = e.target.value
          this.labelType = labelType
          this.dispatcher.call('changeClusterLabel', null, labelType)
        })
        break
      case 'address':
        el.innerHTML = addressConfig
        this.setupTxFilters(el)
        break
      case 'cluster':
        el.innerHTML = clusterConfig
        this.setupTxFilters(el)
        el.querySelector('#address-input select')
          .addEventListener('change', (e) => {
            this.node.addressFilters.set(e.target.value, null)
            this.render()
          })
        this.node.addressFilters.each((value, type) => {
          this.addFilter('address-filters', type, value)
        })
        el.querySelector('#address-input button')
          .addEventListener('click', () => {
            this.applyAddressFilters()
          })
        break
    }
    return this.root
  }
  setupTxFilters (el) {
    el.querySelector('#outgoing-input select')
      .addEventListener('change', (e) => {
        this.node.outgoingTxsFilters.set(e.target.value, null)
        this.render()
      })
    el.querySelector('#incoming-input select')
      .addEventListener('change', (e) => {
        this.node.incomingTxsFilters.set(e.target.value, null)
        this.render()
      })
    this.node.outgoingTxsFilters.each((value, type) => {
      this.addFilter('outgoing-filters', type, value)
    })
    this.node.incomingTxsFilters.each((value, type) => {
      this.addFilter('incoming-filters', type, value)
    })
    el.querySelector('#outgoing-input button')
      .addEventListener('click', () => {
        this.applyTxFilters(true)
      })
    el.querySelector('#incoming-input button')
      .addEventListener('click', () => {
        this.applyTxFilters(false)
      })
  }
  addFilter (id, type, value) {
    let filterSection = this.root.querySelector('#' + id)
    let f = document.createElement('div')
    f.className = 'table'
    f.innerHTML = replace(filter, {filter: firstToUpper(type)})
    let el = f.querySelector('div div')
    switch (type) {
      case 'limit':
        this.addLimitFilter(el, id, value)
        break
    }
    filterSection.appendChild(f)
  }
  addLimitFilter (root, id, value) {
    let el = document.createElement('input')
    el.className = 'border w-8'
    el.setAttribute('type', 'number')
    el.setAttribute('min', '1')
    el.value = value
    el.addEventListener('input', (e) => {
      switch (id) {
        case 'outgoing-filters':
          this.node.outgoingTxsFilters.set('limit', e.target.value)
          break
        case 'incoming-filters':
          this.node.incomingTxsFilters.set('limit', e.target.value)
          break
        case 'address-filters':
          this.node.addressFilters.set('limit', e.target.value)
          break
      }
    })
    root.appendChild(el)
  }
  applyTxFilters (isOutgoing) {
    let filters
    if (isOutgoing) {
      filters = this.node.outgoingTxsFilters
    } else {
      filters = this.node.incomingTxsFilters
    }
    this.dispatcher.call('applyTxFilters', null, [this.node.id, isOutgoing, this.view, filters])
  }
  applyAddressFilters () {
    this.dispatcher.call('applyAddressFilters', null, [this.node.id, this.node.addressFilters])
  }
}
