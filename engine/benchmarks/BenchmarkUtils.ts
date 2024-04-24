import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { getState } from '@etherealengine/hyperflux'

export const getSceneID = (): string => {
  const scenes = getState(SceneState).scenes
  for (const key in scenes) {
    const scene = scenes[key]
    if (scene.name) return key as string
  }

  return '' as string
}

export const sleep = async (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export const waitForPropertyLoad = async <T>(component: T | undefined, property: keyof T) => {
  return new Promise<void>((resolve) => {
    const checkPropertyLoaded = () => {
      if (component && component[property]) {
        resolve()
      } else {
        setTimeout(checkPropertyLoaded, 100)
      }
    }
    checkPropertyLoaded()
  })
}
