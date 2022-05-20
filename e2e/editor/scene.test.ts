import assert from 'assert'
import { XREngineBot } from 'XREngine-bot/src/bot'

import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const domain = process.env.APP_HOST || 'https://localhost:3000'
const editorUrl = `${domain}/editor`

describe('Editor Scene Tests', () => {
  const bot = new XREngineBot({ name: 'bot', verbose: true, headless: false })
  before(async () => {
    await bot.launchBrowser()
  })

  after(async () => {
    await bot.quit()
  })

  it('should load scene', async () => {
    await bot.enterEditor(editorUrl)
    assert(await bot.runHook(BotHooks.SceneLoaded))
  })

  it('should unload scene and load second scene', async () => {
    await bot.clickAnotherScene()
    assert(await bot.runHook(BotHooks.SceneLoaded))
  })
})
