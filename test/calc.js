require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
describe("calc", () => {
  it("calc", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
      contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
      key: process.env.RINKEBY_PRIVATE_KEY
    })
    let r = await f0.invite("0x0000000000000000000000000000000000000000000000000000000000000000")
    //let r = await f0.invites()
    console.log("r", JSON.stringify(r,null,2))
    let converted = await f0.calc(r)
    console.log("converted", JSON.stringify(converted,null,2))
  })
})
