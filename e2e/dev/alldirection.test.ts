import { IREngineBot } from '@ir-engine/ir-bot/src/bot/bot-class'
import { BotHooks } from '@ir-engine/ir-bot/src/enums/BotHooks'

//const vector3 = new Vector3()

//const domain = process.env.APP_HOST
const domain = 'localhost:3000'
const locationName = 'apartment'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {
  const bot = new IREngineBot({ name: 'bot', headless: false, verbose: true })
  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationReady)
    await bot.moveBot('forward', 2000)
    await bot.moveBot('backward', 2000)
    await bot.moveBot('left', 2000)
    await bot.moveBot('right', 2000)
    await bot.moveBot('jump', 2000)
    await bot.moveBot('up', 2000)
    await bot.moveBot('down', 2000)
    await bot.moveBot('arrowleft', 1000)
    await bot.moveBot('arrowright', 1000)
  })

  after(async () => {
    await bot.quit()
  })

  it('Can spawn in the world', async () => {
    const pos = await bot.awaitHookPromise(BotHooks.GetPlayerPosition)
    //assert(vector3.copy(pos).length() < sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })
})
