require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
describe("calculate", () => {
  it("calc", async () => {
    const f0 = new F0();
    await f0.init({
      web3: web3,
      contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
      key: process.env.RINKEBY_PRIVATE_KEY
    })
    let r = await f0.get(1)
    console.log(r)
    assert.deepEqual(r, {
      tokenURI: 'ipfs://bafkreic6dkpzpz637k3jt7g2vv3sey5dtqb2tlmwnfqn4txqhfi3mpw3di',
      raw: {
        image: 'ipfs://bafybeihhl6qexxlf3x6jhhqfm2qdyrcctjrozx7nxfm5a7yo6ntgbajhea'
      },
      converted: {
        image: 'https://ipfs.io/ipfs/bafybeihhl6qexxlf3x6jhhqfm2qdyrcctjrozx7nxfm5a7yo6ntgbajhea'
      }
    })
  })
})
