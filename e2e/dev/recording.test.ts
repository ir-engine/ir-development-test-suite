import assert from 'assert'
import { Vector3 } from 'three'
import { EtherealEngineBot } from 'ee-bot/src/bot/bot-class'
import { BotHooks } from 'ee-bot/src/enums/BotHooks'

const vector3 = new Vector3()

//const domain = process.env.APP_HOST
const domain = 'localhost:3000'
const locationName = 'apartment'
const sqrt2 = Math.sqrt(2)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('My Recording Tests', () => {
  const bot = new EtherealEngineBot({ name: 'bot', headless:false, verbose: true })
  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.delay(5000)
    await bot.sendAudio(5000)
    await bot.sendVideo(5000)

    await bot.stopAudio(bot)
    await bot.stopVideo(bot)
    
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
  })

  after(async () => {
    await bot.quit()
  })

  it('Can spawn in the world', async () => {
    const pos = await bot.awaitHookPromise(BotHooks.GetPlayerPosition)
    //await sleep(5000)
    //assert(vector3.copy(pos).length() < sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })
  
})

