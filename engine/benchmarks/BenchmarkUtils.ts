import { SceneID } from '@etherealengine/common/src/schema.type.module'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { getState } from '@etherealengine/hyperflux'

export const getSceneID = (): SceneID => {
  const scenes = getState(SceneState).scenes
  for (const key in scenes) {
    const scene = scenes[key]
    if (scene.name) return key as SceneID
  }

  return '' as SceneID
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
