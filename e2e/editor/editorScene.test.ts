import { IREngineBot } from '@ir-engine/ir-bot/src/bot/bot-class'
import { BotHooks } from '@ir-engine/ir-bot/src/enums/BotHooks'
import assert from 'assert'

import { delay } from '@ir-engine/spatial/src/common/functions/delay'

const domain = process.env.APP_HOST || 'localhost:3000'
const editorUrl = `https://${domain}/editor`

describe('Editor Scene Tests', () => {
  const bot = new IREngineBot({ name: 'bot', verbose: true, headless: false })
  before(async () => {
    await bot.launchBrowser()
  })

  after(async () => {
    await bot.quit()
  })

  it('should load scene', async () => {
    // open root editor page
    await bot.navigate(editorUrl)

    // click on project
    await bot.clickElementById('open-ir-development-test-suite')

    // click on scene
    await bot.page.waitForSelector(`[class^='_sceneContainer']`, { visible: true })
    await bot.page.click(`[class^='_sceneContainer']`)

    await delay(2000)

    // assert scene has loaded
    await bot.awaitHookPromise(BotHooks.SceneLoaded)

    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) // as Engine
    assert.equal(serializedEngine.isEditor, true)
    // assert.equal(engineState.sceneLoaded, true)
  })

  // it.skip('should unload scene and load second scene', async () => {
  //   await bot.page.click('#rc-tabs-0-tab-scenePanel')
  //   await bot.page.click(`[class^='_sceneContainer']:nth-child(2)`)
  //   await bot.awaitHookPromise(BotHooks.SceneLoaded)
  //   const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
  //   assert.equal(serializedEngine.isEditor, true)
  //   assert.equal((serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value']).sceneLoaded, true)
  // })
})
