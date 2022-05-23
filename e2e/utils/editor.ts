import { XREngineBot } from 'XREngine-bot/src/bot'

import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

/** Enters the editor
 * @param {string} editorUrl The url to load editor page
 */

export const enterEditor = async (editorUrl: String, bot: XREngineBot) => {
  await bot.navigate(editorUrl)
  await bot.page.waitForSelector(`[class^='_itemContainer']`, { visible: true })
  await Promise.all([
    bot.page.click(`[class^='_itemContainer']`),
    bot.page.waitForSelector(`[class^='_sceneContainer']`, { visible: true })
  ])
  await bot.page.click(`[class^='_sceneContainer']`)
  await bot.awaitHookPromise(BotHooks.SceneLoaded)
}

export const clickAnotherScene = async (bot: XREngineBot) => {
  await bot.page.click('#rc-tabs-0-tab-scenePanel')
  await bot.page.click(`[class^='_sceneContainer']:nth-child(2)`)
  await bot.awaitHookPromise(BotHooks.SceneLoaded)
}
