import { SceneID, avatarPath } from '@etherealengine/common/src/schema.type.module'
import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { AnimationComponent } from '@etherealengine/engine/src/avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { getState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Group, MathUtils } from 'three'
import { IBenchmark } from './BenchmarkOrchestration'

const avatarsToCreate = 10
const teardownWaitTime = 500
const benchmarkWaitTime = 2000

const sleep = async (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

const waitForPropertyLoad = async <T>(component: T | undefined, property: keyof T) => {
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

const waitForModelLoad = async (entity: Entity) => {
  const modelComponent = getComponent(entity, ModelComponent)
  return waitForPropertyLoad(modelComponent, 'scene')
}

const waitForAnimationLoad = async (entity: Entity) => {
  const animationComponent = getOptionalComponent(entity, AnimationComponent)
  return waitForPropertyLoad(animationComponent, 'animations')
}

const getSceneID = (): SceneID => {
  const scenes = getState(SceneState).scenes
  for (const key in scenes) {
    const scene = scenes[key]
    if (scene.name) return key as SceneID
  }

  return '' as SceneID
}

export const AvatarBenchmark: IBenchmark = {
  start: async () => {
    return new Promise(async (resolve) => {
      const entities = [] as Entity[]
      const validAnimations = [0, 2, 3, 4, 5, 6, 7, 14, 22, 29]
      const avatars = await Engine.instance.api.service(avatarPath).find({})
      const sceneID = getSceneID()
      const rootEntity = SceneState.getRootEntity(sceneID)

      for (let i = avatarsToCreate; i > 0; i--) {
        const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
        position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
        position.setY(0)
        position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
        const avatarSrc = avatars.data[i % avatars.data.length].modelResource?.url
        const entity = createEntity()
        entities.push(entity)

        const obj3d = new Group()
        obj3d.entity = entity
        setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
        setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(entity, Object3DComponent, obj3d)
        setComponent(entity, TransformComponent, { position })
        setComponent(entity, VisibleComponent, true)
        setComponent(entity, ModelComponent, { src: avatarSrc, convertToVRM: true })
        setComponent(entity, LoopAnimationComponent, {
          animationPack: 'https://localhost:8642/projects/default-project/assets/animations/emotes.glb'
        })
        await waitForModelLoad(entity)
        await waitForAnimationLoad(entity)

        const loopAnimationComponent = getMutableComponent(entity, LoopAnimationComponent)
        loopAnimationComponent.activeClipIndex.set(validAnimations[Math.floor(Math.random() * validAnimations.length)])
      }

      await sleep(benchmarkWaitTime)
      for (const entity of entities) {
        removeEntity(entity)
      }
      await sleep(teardownWaitTime)
      resolve()
    })
  }
}

export const AvatarIKBenchmark: IBenchmark = {
  start: async () => {
    return new Promise(async (resolve) => {
      const entities = [] as Entity[]
      const avatars = await Engine.instance.api.service(avatarPath).find({})
      const sceneID = getSceneID()
      const rootEntity = SceneState.getRootEntity(sceneID)

      for (let i = avatarsToCreate; i > 0; i--) {
        const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
        position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
        position.setY(0)
        position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
        const avatarSrc = avatars.data[i % avatars.data.length].modelResource?.url
        const entity = createEntity()
        entities.push(entity)

        const obj3d = new Group()
        obj3d.entity = entity
        setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
        setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(entity, Object3DComponent, obj3d)
        setComponent(entity, TransformComponent, { position })
        setComponent(entity, VisibleComponent, true)
        setComponent(entity, ModelComponent, { src: avatarSrc, convertToVRM: true })

        await waitForModelLoad(entity)
      }

      await sleep(benchmarkWaitTime)
      for (const entity of entities) {
        removeEntity(entity)
      }
      await sleep(teardownWaitTime)
      resolve()
    })
  }
}
