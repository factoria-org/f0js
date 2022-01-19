const abi = require('./abi.js')
const ipfsh = require('ipfsh')
const axios = require('axios')
const traverse = require('traverse')
const Invitelist = require('invitelist')
class F0 {
  async init (options) {
    this.abi = abi;
    this._invites = {}
    this.web3 = options.web3;
    this.address = options.contract;
    this.currency = options.currency ? options.currency : "usd"

    if (options.network) {
      let net = await this.web3.eth.net.getNetworkType()
      if (net !== options.network) {
        throw new Error(`Please sign into ${options.network} network`)
      }
    }

    // account
    if (options.key) {
      this.key = options.key
      this.wallet = this.web3.eth.accounts.privateKeyToAccount("0x" + options.key)
      this.account = this.wallet.address
    } else {
      this.key = null
      this.wallet = null
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      let _res = await this.web3.eth.getAccounts()
      this.account = _res[0];
    }
    
    // collection
    this.collection = new this.web3.eth.Contract(this.abi, this.address);

    // api
    let methods = this.abi.filter((item) => { return item.type === 'function' })
    this.api = {}
    if (this.key) {
      // node.js
      for(let method of methods) {
        this.api[method.name] = (...args) => {
          return {
            send: async (param) => {
              let action = this.collection.methods[method.name](...args)
              let data = action.encodeABI()
              let o = {
                from: (param && param.from ? param.from : this.account),
                to: this.address,
                data: data,
              }
              if (param && param.value) o.value = param.value
              if (param && param.gas) o.gas = param.gas
              if (param && param.gasPrice) o.gasPrice = param.gasPrice
              let estimate = await action.estimateGas(o)
              o.gas = estimate
              const signedTx = await this.wallet.signTransaction(o)
              let tx = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
              return tx
            },
            call: (param) => {
              return this.collection.methods[method.name](...args).call(param)
            },
            estimate: async (param) => {
              let action = this.collection.methods[method.name](...args)
              let data = action.encodeABI()
              let o = {
                from: (param && param.from ? param.from : this.account),
                to: this.address,
                data: data,
              }
              if (param && param.value) o.value = param.value
              if (param && param.gas) o.gas = param.gas
              if (param && param.gasPrice) o.gasPrice = param.gasPrice
              let estimate = await action.estimateGas(o)
              let e = await this.estimate(estimate)
              e.gas = estimate
              return e
            }
          }
        }
      }
    } else {
      // browser
      for(let method of methods) {
        this.api[method.name] = (...args) => {
          return {
            send: async (param) => {
              let o = {
                from: (param && param.from ? param.from : this.account),
              }
              if (param && param.value) o.value = param.value
              if (param && param.gas) o.gas = param.gas
              if (param && param.gasPrice) o.gasPrice = param.gasPrice
              let estimate = await this.collection.methods[method.name](...args).estimateGas(o)
              let r = await this.collection.methods[method.name](...args).send(o)
              return r
            },
            call: async (param) => {
              let o = {
                from: (param && param.from ? param.from : this.account),
              }
              if (param && param.value) o.value = param.value
              let r = await this.collection.methods[method.name](...args).call(o)
              return r
            },
            estimate: async (param) => {
              let o = {
                from: (param && param.from ? param.from : this.account),
              }
              if (param && param.value) o.value = param.value
              if (param && param.gas) o.gas = param.gas
              if (param && param.gasPrice) o.gasPrice = param.gasPrice
              let estimate = await this.collection.methods[method.name](...args).estimateGas(o)
              let e = await this.estimate(estimate)
              e.gas = estimate
              return e
            }
          }
        }
      }
    }
    // invites
    let logs = await this.collection.getPastEvents("Invited", { fromBlock: 0, toBlock  : "latest", })
    for(let log of logs) {
      let key = log.returnValues.key
      let condition = await this.collection.methods.invite(log.returnValues.key).call()
      let rawCondition = {
        price: parseInt(condition.price),
        start: parseInt(condition.start),
        limit: parseInt(condition.limit)
      }
      let convertedCondition = {
        eth: rawCondition.price / Math.pow(10, 18),
        start: new Date(rawCondition.start * 1000),
        limit: rawCondition.limit
      }
      let invite = {
        key: log.returnValues.key,
        cid: ipfsh.dtoc(log.returnValues.cid),
        condition: {
          raw: rawCondition,
          converted: convertedCondition
        }
      }
      if (invite.key === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        invite.list = []
        invite.proof = []
        invite.invited = true
      } else {
        let res = await axios.get("https://ipfs.io/ipfs/" + invite.cid).then((r) => {
          return r.data
        })
        invite.list = res.addresses
        let list = new Invitelist(invite.list)
        invite.proof = list.proof(this.account)
        invite.invited = list.verify(this.account, invite.proof)
      }
      this._invites[key] = invite
    }
  }
  async config() {
    // config
    let config = await this.collection.methods.config().call()
    let rawConfig = {
      placeholder: config.placeholder ? config.placeholder : "ipfs://bafkreieqcdphcfojcd2vslsxrhzrjqr6cxjlyuekpghzehfexi5c3w55eq",
      base: config.base,
      supply: parseInt(config.supply),
      permanent: config.permanent
    }
    return {
      raw: rawConfig,
      converted: this.convert(rawConfig)
    }
  }
  async placeholder() {
    let config = await this.config()
    let p = await axios.get(config.converted.placeholder).then((r) => {
      return r.data
    })
    return {
      raw: p,
      converted: this.convert(p)
    }
  }
  nextId() {
    return this.collection.methods.nextId().call()
  }
  name() {
    return this.collection.methods.name().call()
  }
  symbol() {
    return this.collection.methods.symbol().call()
  }
  async mintCost(key, count, options) {
    if (!key) { key = "0x0000000000000000000000000000000000000000000000000000000000000000" }
    let auth = { key, proof: this._invites[key].proof }
    let cost = "" + this._invites[key].condition.raw.price * count
    let o = (options ? options : {});
    o.value = cost;
    let estimate = await this.api.mint(auth, count).estimate(o)
    return estimate
  }
  async mint (key, count, options) {
    if (!key) { key = "0x0000000000000000000000000000000000000000000000000000000000000000" }
    let auth = { key, proof: this._invites[key].proof }
    let cost = "" + this._invites[key].condition.raw.price * count
    let o = (options ? options : {});
    o.value = cost;
    let tx = await this.api.mint(auth, count).send(o)
    let tokenIds;
    if (this.key) {
      tokenIds = tx.logs.map((log) => {
        return "" + parseInt(Number(log.topics[3]), 10)
      })
    } else {
      let Transfers = (Array.isArray(tx.events.Transfer) ? tx.events.Transfer : [tx.events.Transfer])
      tokenIds = Transfers.map((t) => {
        return "" + t.returnValues.tokenId
      })
    }
    let net = await this.web3.eth.net.getNetworkType()
    return tokenIds.map((tokenId) => {
      let urls = {
        rinkeby: {
          opensea: `https://testnets.opensea.io/assets/${this.address}/${tokenId}`,
          rarible: `https://rinkeby.rarible.com/token/${this.address}:${tokenId}`
        },
        main: {
          opensea: `https://opensea.io/assets/${this.address}/${tokenId}`,
          rarible: `https://rarible.com/token/${this.address}:${tokenId}`
        }
      }
      return {
        tokenId,
        links: urls[net]
      }
    })
  }
  async calc(invite) {
    let { gas, price } = await this.cost()
    console.log("#", gas, price)
    let currency = this.currency
    return traverse(invite).map(function (x) {
      if (this.isLeaf && this.key === "eth") {
        this.parent.node[currency] = this.parent.node.eth * price
      }
    })
  }
  async myInvites() {
    let i = JSON.parse(JSON.stringify(this._invites))
    for(let key in i) {
      if (!i[key].invited) {
        delete i[key]
      }
    }
    return i;
  }
  async invites() {
    let i = JSON.parse(JSON.stringify(this._invites))
    return i
  }
  async invite(key) {
    let k = (key ? key : "0x0000000000000000000000000000000000000000000000000000000000000000")
    return this._invites[k]
  }
  async get(tokenId) {
    let r
    let tokenURI
    let config = await this.config()
    let placeholder = await this.placeholder()
    if (config.converted.base) {
      tokenURI = `${config.converted.base}${tokenId}.json` 
      r = await axios.get(tokenURI).then((r) => {
        return r.data
      })
    } else if (config.converted.placeholder) {
      tokenURI = config.raw.placeholder
      r = placeholder.raw
    } else {
      tokenURI = config.raw.placeholder
      r = placeholder.raw
    }
    let converted = this.convert(r)
    return {
      tokenURI: tokenURI,
      raw: r,
      converted: converted
    }
  }
  async logs(eventName, options) {
    if (!eventName) eventName = "allEvents"
    let o = Object.assign({
      fromBlock: 0,
      toBlock: 'latest'
    }, options)
    let events = await this.collection.getPastEvents(eventName, o)
    return events;
  }

  // UTIL
  convert(raw) {
    let r = JSON.parse(JSON.stringify(raw))
    return traverse(r).map(function (x) {
      if (this.isLeaf && typeof x === 'string' && x.startsWith("ipfs://")) {
        this.update("https://ipfs.io/ipfs/" + x.replace("ipfs://", ""))
      }
    })
  }
  async cost() {
    let [gas, price] = await Promise.all([
      axios.get("https://ethgasstation.info/api/ethgasAPI.json").then((r) => {
        delete r.data.gasPriceRange
        return r.data
      }),
      axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${this.currency}&ids=ethereum`).then((r) => {
        return r.data
      }).then((r) => {
        return r[0].current_price
      })
    ])
    return { gas, price }
  }
  async estimate(gas) {
    let cost = await this.cost()
    let eth = {}
    let fiat = {}
    // gwei/gas
    for(let speed of ["fastest", "fast", "average", "safeLow"]) {
      eth[speed] = cost.gas[speed] * gas / Math.pow(10, 10)
      fiat[speed] = eth[speed] * cost.price
    }
    return {
      eth,
      [this.currency]: fiat
    }
  }
  parseURL (url) {
    let u = new URL(url)
    let hash = u.hash
    if (!hash) return {}
    hash.trim();
    if(hash[0] === "#") hash = hash.slice(1);
    let items = hash.split("&");
    return items.reduce((res, item) => {
      const pair = item.split("=");
      res[pair[0]] = pair[1];
      return res;
    }, {})
  }
}
module.exports = F0
