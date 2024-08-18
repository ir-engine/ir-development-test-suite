import { EtherealEngineBot } from '@etherealengine/ee-bot/src/bot/bot-class'
import { BotHooks } from '@etherealengine/ee-bot/src/enums/BotHooks'

import { setupXR, testWebXR } from '../utils/testWebXR'

const domain = process.env.APP_HOST
const locationName = 'test'

describe('WebXR Bot Tests', () => {
  const bot = new EtherealEngineBot({ name: 'bot-' + Date.now(), verbose: true })

  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationReady)
    await setupXR(bot)
  })

  after(async () => {
    await bot.quit()
  })

  testWebXR(bot)
})
