import { defineSystem } from "@etherealengine/engine/src/ecs/functions/SystemFunctions"

let count = 0

const execute = () => {
  if (count++ % 300 === 0) {
    console.log('Test System')
  }
}

export default defineSystem({
  uuid: 'ee.engine.TempSystem',
  execute
})
