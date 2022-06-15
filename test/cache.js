require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
//const web3 = createAlchemyWeb3(process.env.MAINNET_URL)
describe.skip("cache", () => {
  it("cache while fetching", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
//      contract: "0xF655377696496746b9BFC09075f0F0ba5745a23B",
      contract: "0xD7eEa022eF295D893c56634c2Eba7f289fcd158B",
      key: process.env.RINKEBY_PRIVATE_KEY,
      cache: true
    })
    console.log(Object.keys(f0.cached))
    let r = await f0.invites()
    console.log(Object.keys(f0.cached))
    let config = await f0.config()
    console.log(Object.keys(f0.cached))
    let placeholder = await f0.placeholder()
    console.log(Object.keys(f0.cached))
    assert(Object.keys(f0.cached).length > 0)
  })
  it("fetch without caching", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
      //contract: "0xF655377696496746b9BFC09075f0F0ba5745a23B",
      contract: "0xD7eEa022eF295D893c56634c2Eba7f289fcd158B",
      key: process.env.RINKEBY_PRIVATE_KEY,
    })
    console.log(Object.keys(f0.cached))
    let r = await f0.invites()
    console.log(Object.keys(f0.cached))
    let config = await f0.config()
    console.log(Object.keys(f0.cached))
    let placeholder = await f0.placeholder()
    console.log(Object.keys(f0.cached))
    assert(Object.keys(f0.cached).length === 0)
  })
  it("pass the cache for initialization", async () => {
    const f0 = new F0();
    // Fetch and cache
    await f0.init({
      web3: web3,
      //contract: "0xF655377696496746b9BFC09075f0F0ba5745a23B",
      contract: "0xD7eEa022eF295D893c56634c2Eba7f289fcd158B",
      key: process.env.RINKEBY_PRIVATE_KEY,
      cache: true
    })
    let r = await f0.invites()
    let config = await f0.config()
    let placeholder = await f0.placeholder()
    const cached = f0.cached

    // Re-initialize, but with the cache
    await f0.init({
      web3: web3,
      //contract: "0xF655377696496746b9BFC09075f0F0ba5745a23B",
      contract: "0xD7eEa022eF295D893c56634c2Eba7f289fcd158B",
      key: process.env.RINKEBY_PRIVATE_KEY,
      cached
    })
  })
})
