import { IREngineBot } from '@ir-engine/ir-bot/src/bot/bot-class'
import { BotHooks } from '@ir-engine/ir-bot/src/enums/BotHooks'
import { Vector3 } from 'three'
import { afterAll, assert, beforeAll, describe, it } from 'vitest'

import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { NetworkPeer } from '@ir-engine/network'
import { delay } from '@ir-engine/spatial/src/common/functions/delay'

const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'test'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {
  const bot = new IREngineBot({ name: 'bot', verbose: true })
  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationReady)
  })

  afterAll(async () => {
    await bot.quit()
  })

  it('Can spawn in the world', async () => {
    const pos = await bot.awaitHookPromise(BotHooks.GetPlayerPosition)
    assert(vector3.copy(pos).length() < sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })
})

describe('Multi-Bot Tests', () => {
  const bots = [] as Array<IREngineBot>

  async function addBot() {
    const bot = new IREngineBot({ name: `bot-${bots.length}`, verbose: true })
    bots.push(bot)
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationReady)
    return bot
  }

  afterAll(async () => {
    for (const bot of bots) {
      await bot.quit()
    }
  })

  // skip for now, as loading multiple uses seems to overload github actions and the test fails
  it('Can connect multiple players', async () => {
    const numPlayers = 3
    const addedBots = [] as Promise<IREngineBot>[]
    for (let i = 0; i < numPlayers; i++) addedBots.push(addBot())
    await Promise.all(addedBots)
    const bot = bots[0]
    await delay(1000)
    const clients = (await bot.runHook(BotHooks.GetWorldNetworkPeers)) as [UserID, NetworkPeer][]
    const clientIds = clients.map(([id]) => id)
    // +1 is for the server
    assert.equal(clientIds.length, numPlayers + 1)
  })

  // test('Can disconnect players', async () => {
  //   await bot.delay(1000)
  //   await bot.quit()

  //   const bot2 = new IREngineBot({ name: 'bot-2', verbose: true })
  //   await bot2.launchBrowser()
  //   await bot2.enterLocation(`https://${domain}/location/${locationName}`)
  //   await bot2.awaitHookPromise(BotHooks.LocationReady)

  //   expect(
  //     vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).length()
  //   ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  // })
})
