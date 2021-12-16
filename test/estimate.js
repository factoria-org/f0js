require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
describe("estimate", () => {
  it("estimate", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
      contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
      key: process.env.RINKEBY_PRIVATE_KEY
    })
    let estimate = await f0.estimate(242946)
    console.log("estimate", JSON.stringify(estimate, null, 2))
  })
})
