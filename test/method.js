require('dotenv').config()
const F0 = require("../index")
const assert = require('assert').strict;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.RINKEBY_URL)
const f0 = new F0();
describe("methods ", () => {
  describe("send", () => {
    it.skip("mint", async () => {
      await f0.init({
        web3: web3,
        contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
        key: process.env.RINKEBY_PRIVATE_KEY
      })
      let invites = await f0.invites()
      console.log("invites = ", invites)
      console.log("account = ", f0.account)
      let tokens = await f0.api.mint({
        key: "0x0000000000000000000000000000000000000000000000000000000000000000",
        proof: []
      }, 1).send({
        value: "10000000000000000"
      })
      console.log("tokens", tokens)
    })
    it.skip("setConfig", async () => {
      await f0.init({
        web3: web3,
        //contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
        contract: "0x4D1555559Ca747B22027c3b1Dae65D1AC676a2F8",
        key: process.env.RINKEBY_PRIVATE_KEY
      })
      let config = await f0.api.config().call()
      console.log("config before", config)

      let tx = await f0.api.setConfig({
        placeholder: config.placeholder,
        base: "",
        supply: 42,
      }).send()
      console.log("tx", tx)
      config = await f0.api.config().call()
      console.log("config after", config)
    })
  })
  describe("call", () => {
    it("ownerOf", async () => {
      await f0.init({
        web3: web3,
        contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
        key: process.env.RINKEBY_PRIVATE_KEY
      })
      let owner = await f0.api.ownerOf(1).call()
      console.log("owner", owner)
    })
    it("balanceOf", async () => {
      await f0.init({
        web3: web3,
        contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
        key: process.env.RINKEBY_PRIVATE_KEY
      })
      let balance = await f0.api.balanceOf("0xFb7b2717F7a2a30B42e21CEf03Dd0fC76Ef761E9").call()
      console.log("balance", balance)
    })
  })
  describe("estimateGas", () => {
    it("setConfig", async () => {
      await f0.init({
        web3: web3,
        contract: "0x4D1555559Ca747B22027c3b1Dae65D1AC676a2F8",
        key: process.env.RINKEBY_PRIVATE_KEY
      })
      let config = await f0.api.config().call()
      console.log("config before", config)

      let estimate = await f0.api.setConfig({
        placeholder: config.placeholder,
        base: "",
        supply: 42,
      }).estimate()
      console.log("estimate", estimate)
    })
    it("mint", async () => {
      await f0.init({
        web3: web3,
        contract: "0x5716cf7a5A69729790b0d351770A081763294A30",
        key: process.env.RINKEBY_PRIVATE_KEY
      })
      let estimate = await f0.api.mint({
        key: "0x0000000000000000000000000000000000000000000000000000000000000000",
        proof: []
      }, 3).estimate({
        value: "30000000000000000"
      })
      console.log("mint estimate", estimate)
    })
  })
})
