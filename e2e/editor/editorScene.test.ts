import assert from 'assert'
import { Vector3 } from 'three'
import { XREngineBot } from 'XREngine-bot/bot'
import type { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { accessEditorState } from '@xrengine/editor/src/services/EditorServices'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { BotHooks } from 'XREngine-bot/src/enums/BotHooks'
import { delay } from '@xrengine/engine/src/common/functions/delay'
import { NetworkClient } from '@xrengine/engine/src/networking/interfaces/NetworkClient'

const vector3 = new Vector3()

const domain = process.env.APP_HOST
const projectName = 'default-project'
const SceneName = 'default'

describe('Editor Scene Tests', () => {
  const bot = new XREngineBot({ name: 'bot', verbose: true })
  before(async () => {
    await bot.launchBrowser()
    await bot.enterEditor(`https://${domain}/editor/${projectName}/`, `https://${domain}/`)
  })

  after(async () => {
    await bot.quit()
  })

  it('should load scene', async () => {
    await bot.navigate(`https://${domain}/editor/${projectName}/${SceneName}`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)
    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const engineState = (serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value'])
    assert.equal(serializedEngine.isEditor, true)
    assert.equal(engineState.sceneLoaded, true)
  })

  it('should unload scene and load second scene', async () => {
    // load scene
    await bot.navigate(`https://${domain}/editor/${projectName}/${SceneName}`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)

    // go to project
    await bot.navigate(`https://${domain}/editor/${projectName}/`)
    // click on scene
    await bot.page.waitForSelector(`[class^='_sceneContainer']`, { visible: true })
    await bot.page.click(`[class^='_sceneContainer']:nth-child(2)`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)

    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const engineState = (serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value'])
    assert.equal(engineState.sceneLoaded, true)
    assert.equal(serializedEngine.isEditor, true)
    assert.equal((serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value']).sceneLoaded, true)
  })

  it('should new scene', async () => {
    // navigate to project page
    await bot.clickElementById(`menu`)
    await bot.page.click(`[class^='react-contextmenu-item']:nth-child(1)`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)

    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const engineState = (serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value'])
    assert.equal(engineState.sceneLoaded, true)
    assert.equal(serializedEngine.isEditor, true)
    assert.equal((serializedEngine.store.state['engine'] as any as ReturnType<typeof getEngineState>['value']).sceneLoaded, true)
  })

  it('should save scene', async () => {
    // load scene
    await bot.navigate(`https://${domain}/editor/${projectName}/${SceneName}`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)
    // Modify scene
    await bot.page.click(`[aria-label^='Model']`)
    // Click save button
    await bot.clickElementById(`menu`)
    await bot.page.click(`[class="react-contextmenu-item"]:nth-child(2)`)

    await bot.awaitHookPromise(BotHooks.SceneSaved)
    
    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const editorState = (serializedEngine.store.state['EditorState'] as any)
    assert.equal(editorState.sceneModified, false)
    //TODO: need logic for check from json file
  })


  it('should save as scene', async () => {
    // load scene
    await bot.navigate(`https://${domain}/editor/${projectName}/${SceneName}`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)
    // Modify scene
    await bot.page.click(`[aria-label^='Model']`)
    // Click save button
    await bot.clickElementById(`menu`)
    await bot.page.click(`[class="react-contextmenu-item"]:nth-child(3)`)

    await bot.page.waitForSelector(`[id^='name']`, { visible: true })
    await bot.page.focus(`[id^='name']`)
    await bot.page.keyboard.type('saveas_scene')
    // await bot.page.type(String.fromCharCode(13));
    await bot.page.click(`button[type="submit"]`)

    await bot.awaitHookPromise(BotHooks.SceneSaved)
    
    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const editorState = (serializedEngine.store.state['EditorState'] as any)
    assert.equal(editorState.sceneModified, false)
    //TODO: need logic for check from json file
  })

  it.skip('should drag and drop', async () => {
    // load scene
    await bot.navigate(`https://${domain}/editor/${projectName}/${SceneName}`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)

    const buttonElement = await bot.page.waitForSelector(`[aria-label^='Directional Light']`, { visible: true }) as any
    const rect = await bot.page.evaluate((el) => {
      const {x, y, width, height} = el.getBoundingClientRect();
      return {x, y, width, height}
    }, buttonElement);
    const pos = {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2}
    await bot.page.mouse.move(pos.x,  pos.y, {steps: 20});
    await bot.page.waitForTimeout(100);
    await bot.page.mouse.down();
    await bot.page.waitForTimeout(100);
    await bot.page.mouse.move(window.innerWidth / 2,  window.innerHeight / 2, {steps: 20});
    await bot.page.waitForTimeout(100);
    await bot.page.mouse.up();
    await bot.page.waitForTimeout(100);
    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const editorState = (serializedEngine.store.state['EditorState'] as any)
    // TODO: it seems like puppeteer does not support drag & drop
    // https://github.com/puppeteer/puppeteer/issues/1376
    assert.equal(editorState.sceneModified, true)
  })

  it.skip('should add and remove object ', async () => {
    // load scene
    await bot.navigate(`https://${domain}/editor/${projectName}/${SceneName}`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)

    const buttonElement = await bot.page.waitForSelector(`[aria-label^='Directional Light']`, { visible: true }) as any
    const rect = await bot.page.evaluate((el) => {
      const {x, y, width, height} = el.getBoundingClientRect();
      return {x, y, width, height}
    }, buttonElement);
    const pos = {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2}
    await bot.page.mouse.move(pos.x,  pos.y, {steps: 20});
    await bot.page.waitForTimeout(100);
    await bot.page.mouse.down();
    await bot.page.waitForTimeout(100);
    await bot.page.mouse.up();
    await bot.page.waitForTimeout(100);
    const serializedEngine = JSON.parse(await bot.runHook(BotHooks.SerializeEngine)) as Engine
    const editorState = (serializedEngine.store.state['EditorState'] as any)
    // TODO: it seems like puppeteer does not support drag & drop
    // https://github.com/puppeteer/puppeteer/issues/1376
    assert.equal(editorState.sceneModified, true)
  })
})