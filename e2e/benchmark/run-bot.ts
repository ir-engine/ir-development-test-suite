import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { IREngineBot } from '@ir-engine/ir-bot/src/bot/bot-class'
import { BotHooks } from '@ir-engine/ir-bot/src/enums/BotHooks'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

const JUMP_DURATION = 1000
const DELAY_DURATION = 200
const FORWARD_DURATION = 800

const options = cli.parse({
  domain: [false, 'Domain for the bot to connect to', 'string'],
  location: [false, 'Name of location to connect to', 'string'],
  movement: [false, 'Whether to move during the test', 'string'],
  audio: [false, 'Whether to turn on audio during the test', 'string'],
  video: [false, 'Whether to turn on video during the test', 'string'],
  endMinute: [false, 'The minute to end the bot', 'string'],
  enableGPU: [false, 'Enable GPU', 'string']
})

cli.main(async () => {
  try {
    const endMinute = parseInt(options.endMinute)
    let endTime = new Date()
    endTime.setMinutes(endMinute)
    const bot = new IREngineBot({ name: 'bot', headless: true, verbose: true })

    await bot.launchBrowser()
    await bot.enterLocation(`https://${options.domain}/location/${options.location}`)
    await bot.awaitHookPromise(BotHooks.LocationReady)
    if (options.audio === 'true') await bot.startAudio()
    if (options.video === 'true') await bot.startVideo()
    await bot.clickCanvas()
    if (options.movement === 'true') {
      let counter = 0
      while (new Date() < endTime) {
        console.log('counter', counter)
        let direction
        switch (counter % 4) {
          case 0:
            console.log('moving forward')
            direction = 'forward'
            break
          case 1:
            console.log('moving left')
            direction = 'left'
            break
          case 2:
            console.log('moving backward')
            direction = 'backward'
            break
          case 3:
            console.log('moving right')
            direction = 'right'
            break
          default:
            direction = 'forward'
        }
        await bot.moveBot('jump', JUMP_DURATION)
        await bot.delay(DELAY_DURATION)
        await bot.moveBot(direction, FORWARD_DURATION)
        counter++
      }
    } else {
      await bot.delay((endMinute - new Date().getMinutes()) * 60 * 1000)
    }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
