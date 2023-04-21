import assert from 'assert'
import { Vector3 } from 'three'
import { EtherealEngineBot } from 'ee-bot/src/bot/bot-class'
import { BotHooks } from 'ee-bot/src/enums/BotHooks'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { delay } from '@etherealengine/engine/src/common/functions/delay'
import { NetworkPeer } from '@etherealengine/engine/src/networking/interfaces/NetworkPeer'

const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'test'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {
  const bot = new EtherealEngineBot({ name: 'bot', verbose: true })
  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
  })

  after(async () => {
    await bot.quit()
  })

  it('Can spawn in the world', async () => {
    const pos = await bot.awaitHookPromise(BotHooks.GetPlayerPosition)
    assert(vector3.copy(pos).length() < sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })
})

describe('Multi-Bot Tests', () => {
  const bots = [] as Array<EtherealEngineBot>

  async function addBot() {
    const bot = new EtherealEngineBot({ name: `bot-${bots.length}`, verbose: true })
    bots.push(bot)
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    return bot
  }

  after(async () => {
    for (const bot of bots) {
      await bot.quit()
    }
  })

  // skip for now, as loading multiple uses seems to overload github actions and the test fails
  it('Can connect multiple players', async () => {
    const numPlayers = 3
    const addedBots = [] as Promise<EtherealEngineBot>[]
    for (let i = 0; i < numPlayers; i++) addedBots.push(addBot())
    await Promise.all(addedBots)
    const bot = bots[0]
    await delay(1000)
    const clients = (await bot.runHook(BotHooks.GetWorldNetworkPeers)) as [UserId, NetworkPeer][]
    const clientIds = clients.map(([id]) => id)
    // +1 is for the server
    assert.equal(clientIds.length, numPlayers + 1)
  })

  // test('Can disconnect players', async () => {
  //   await bot.delay(1000)
  //   await bot.quit()

  //   const bot2 = new EtherealEngineBot({ name: 'bot-2', verbose: true })
  //   await bot2.launchBrowser()
  //   await bot2.enterLocation(`https://${domain}/location/${locationName}`)
  //   await bot2.awaitHookPromise(BotHooks.LocationLoaded)

  //   expect(
  //     vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).length()
  //   ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  // })
})
