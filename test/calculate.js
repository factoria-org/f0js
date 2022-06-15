require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
describe("calculate", () => {
  it("calculate", async () => {
    const f0 = new F0();
    console.log("initailize")
    await f0.init({
      web3: web3,
      //contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
      contract: "0xD7eEa022eF295D893c56634c2Eba7f289fcd158B",
      key: process.env.RINKEBY_PRIVATE_KEY
    })
    console.log("initailzied")
    let r = await f0.cost()
    console.log(JSON.stringify(r, null, 2))
    let keys = Object.keys(r)
    assert.deepEqual(keys, ["gas", "price"])
  })
})
