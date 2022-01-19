require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
describe("mint", () => {
  it.skip("mint", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
      contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
      key: process.env.RINKEBY_PRIVATE_KEY
    })
    let invites = await f0.invites()
    console.log("invites = ", invites)
    console.log("account = ", f0.account)
    let tokens = await f0.mint("0x0000000000000000000000000000000000000000000000000000000000000000", 2)
    console.log("tokens", tokens)
  })
  it("mintCost", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
      contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
      key: process.env.RINKEBY_PRIVATE_KEY
    })
    let invites = await f0.invites()
    console.log("invites = ", invites)
    console.log("account = ", f0.account)
    let cost = await f0.mintCost("0x0000000000000000000000000000000000000000000000000000000000000000", 2)
    console.log("cost", cost)
  })
})
