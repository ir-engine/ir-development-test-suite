import assert from 'assert'
import { XREngineBot } from 'XREngine-Bot/bot'
import { BotHooks } from 'XREngine-Bot/src/enums/BotHooks'

import { delay } from '@xrengine/engine/src/common/functions/delay'
import type { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'

const domain = process.env.APP_HOST || 'localhost:3000'
const editorUrl = `https://${domain}/editor`

describe('Editor Scene Tests', () => {
  const bot = new XREngineBot({ name: 'bot', verbose: true, headless: false })
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
    await bot.clickElementById('open-XREngine-development-test-suite')

    // click on scene
    await bot.page.waitForSelector(`[class^='_sceneContainer']`, { visible: true })
    await bot.page.click(`[class^='_sceneContainer']`)

    await delay(2000)

    // assert scene has loaded
    await bot.awaitHookPromise(BotHooks.SceneLoaded)

    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const engineState = serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value']
    assert.equal(serializedEngine.isEditor, true)
    assert.equal(engineState.sceneLoaded, true)
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
