require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
//const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
const web3 = createAlchemyWeb3(process.env.MAINNET_URL)
describe("invites", () => {
  it("invites", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
      //contract: "0x072250B5001F5b0276BD1741495fB25dA11d84ac",
      contract: "0xF655377696496746b9BFC09075f0F0ba5745a23B",
      key: process.env.RINKEBY_PRIVATE_KEY
    })
    let r = await f0.invites()
    console.log("r", JSON.stringify(r, null, 2))
    for(let key in r) {
      let gas = r[key].condition.raw.price
      let usd = await f0.estimate(gas)
      console.log("gas", gas)
    }
  })
})
