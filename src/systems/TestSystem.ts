import { World } from '@xrengine/engine/src/ecs/classes/World'

export default async function TempSystem(world: World) {
  let count = 0

  const execute = () => {
    if (count++ % 300 === 0) {
      console.log('Test System')
    }
  }

  const cleanup = async () => {
    console.log('Test System Cleanup')
  }

  return { execute, cleanup }
}
