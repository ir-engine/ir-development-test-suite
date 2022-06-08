import type { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import assert from 'assert'
import { XREngineBot } from 'XREngine-bot/bot'

import { BotHooks } from 'XREngine-bot/src/enums/BotHooks'

import { clickAnotherScene, enterEditor } from '../utils/editor'

const domain = process.env.APP_HOST || 'localhost:3000'
const editorUrl = `https://${domain}/editor`

describe('Editor Scene Tests', () => {
  const bot = new XREngineBot({ name: 'bot', verbose: true })
  before(async () => {
    await bot.launchBrowser()
  })

  after(async () => {
    await bot.quit()
  })

  it('should load scene', async () => {
    await enterEditor(editorUrl, bot)
    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const engineState = (serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value'])
    assert.equal(serializedEngine.isEditor, true)
    assert.equal(engineState.sceneLoaded, true)
  })

  // it.skip('should unload scene and load second scene', async () => {
  //   await clickAnotherScene(bot)
  //   const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
  //   assert.equal(serializedEngine.isEditor, true)
  //   assert.equal((serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value']).sceneLoaded, true)
  // })
})
