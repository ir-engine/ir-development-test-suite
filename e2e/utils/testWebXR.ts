import assert from 'assert'
import type { IREngineBot } from '@ir-engine/ir-bot/src/bot/bot-class'
import { XRBotHooks } from '@ir-engine/ir-bot/src/enums/BotHooks'

export const setupXR = async (bot: IREngineBot) => {
  await bot.runHook(XRBotHooks.OverrideXR)
  await bot.runHook(XRBotHooks.StartXR)
}

const testPoses = [
  [
    [0, 1.6, 0, 0, 1, 0, 0], // head
    [-0.5, 1.5, -1, 0, 0, 0, 1], // left
    [0.5, 1.5, -1, 0, 0, 0, 1] // right
  ],
  [
    [0.1, 1.7, -0.2, -0.5, -0.4, -0.3, 0.2], // head
    [-0.4, 1.45, -0.9, 0.6, 0.5, -0.4, 0.3], // left
    [0.4, 1.3, -0.8, -0.4, -0.3, 0.2, 0.1] // right
  ]
]

export const testWebXR = (bot: IREngineBot) => {
  it('Web XR works', async () => {
    assert(await bot.runHook(XRBotHooks.XRSupported))
    assert(await bot.runHook(XRBotHooks.XRInitialized))
  })

  // TODO: we need a new strategy to figure out the pose here, as it isn't as simple as comparing with the input values
  // it('Can detect and move input sources', async () => {
  //   for (const posesToTest of testPoses) {
  //     await bot.runHook(XRBotHooks.SetXRInputPosition, {
  //       head: posesToTest[0],
  //       left: posesToTest[1],
  //       right: posesToTest[2]
  //     })
  //     await bot.delay(2000)
  //     const { headInputValue, leftControllerInputValue, rightControllerInputValue } = await bot.runHook(
  //       XRBotHooks.GetXRInputPosition
  //     )
  //     const pos = await bot.runHook(BotHooks.GetPlayerPosition)
  //     console.log(pos, headInputValue, posesToTest[0])
  //     compareArrays(headInputValue, posesToTest[0], 0.01)
  //     compareArrays(leftControllerInputValue, posesToTest[1], 0.01)
  //     compareArrays(rightControllerInputValue, posesToTest[2], 0.01)
  //   }
  // })
}
