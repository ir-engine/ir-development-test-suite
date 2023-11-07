import assert from 'assert'
import { Vector3 } from 'three'
import { EtherealEngineBot } from 'ee-bot/src/bot/bot-class'
import { BotHooks } from 'ee-bot/src/enums/BotHooks'
import { makeAdmin } from 'ee-bot/src/bot/utils/make-user-admin'

const vector3 = new Vector3()

//const domain = process.env.APP_HOST
const domain = 'localhost:3000'
const locationName = 'default'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {
  const bot = new EtherealEngineBot({ name: 'bot', headless:false, verbose: true })
  before(async () => {
    await bot.launchBrowser()
    //await bot.enterLocation(`https://${domain}`)
    //await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.enterEditor(`https://${domain}/studio/default-project/apartment`,`https://${domain}` )
    await bot.physics_triggers()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.moveBot('forward',2000)
  })

  after(async () => {
    await bot.quit()
  })

  it('Can spawn in the world', async () => {
  })
})

