import assert from 'assert'
import { Vector3 } from 'three'
import { EtherealEngineBot } from '@etherealengine/ee-bot/src/bot/bot-class'
import { BotHooks } from '@etherealengine/ee-bot/src/enums/BotHooks'

// const vector3 = new Vector3()

const domain = process.env.APP_HOST
// const domain = 'test2.etherealengine.com'
const locationName = 'default'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {
  const bot = new EtherealEngineBot({ name: 'bot', headless:false, verbose: true })
  before(async () => {
    const TOTAL_DURATION = 3600000
    const JUMP_DURATION = 1000
    const DELAY_DURATION = 200
    const FORWARD_DURATION = 800
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationReady)
    let counter = 0
    while (counter < TOTAL_DURATION / (JUMP_DURATION + DELAY_DURATION + FORWARD_DURATION)) { // Set a limit to the number of iterations (adjust as needed)
      let direction
      switch (counter % 3) {
        case 0:
          direction = 'forward'
          break
        case 1:
          direction = 'left'
          break
        case 2:
          direction = 'backward'
          break
        case 3:
          direction = 'right'
          break
        default:
          direction = 'forward'
      }
      await bot.moveBot('jump', JUMP_DURATION)
      await bot.delay(DELAY_DURATION)
      await bot.moveBot(direction, FORWARD_DURATION)
      counter++;
    }})

  after(async () => {
    await bot.quit()
  })

  it('Can spawn in the world', async () => {
    const pos = await bot.awaitHookPromise(BotHooks.GetPlayerPosition)
    // assert(vector3.copy(pos).length() < sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })
})

