import { IREngineBot } from '@ir-engine/ir-bot/src/bot/bot-class'
import { BotHooks } from '@ir-engine/ir-bot/src/enums/BotHooks'
import { afterAll, beforeAll, describe } from 'vitest'

import { setupXR, testWebXR } from '../utils/testWebXR'

const domain = process.env.APP_HOST
const locationName = 'test'

describe('WebXR Bot Tests', () => {
  const bot = new IREngineBot({ name: 'bot-' + Date.now(), verbose: true })

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationReady)
    await setupXR(bot)
  })

  afterAll(async () => {
    await bot.quit()
  })

  testWebXR(bot)
})
