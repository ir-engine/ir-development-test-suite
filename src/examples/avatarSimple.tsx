import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { GLTF } from '@gltf-transform/core'
import { useEffect } from 'react'
import { Cache, Color, Euler, Quaternion } from 'three'

import { AvatarID, avatarPath } from '@etherealengine/common/src/schema.type.module'
import {
  Engine,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  getMutableComponent,
  setComponent,
  useOptionalComponent
} from '@etherealengine/ecs'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkActions'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { GLTFAssetState, GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { AmbientLightComponent, DirectionalLightComponent, TransformComponent } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'

// create scene with a rigidbody loaded offset from the origin
const createSceneGLTF = (id: string): GLTF.IGLTF => ({
  asset: {
    version: '2.0',
    generator: 'iR Engine'
  },
  scenes: [{ nodes: [0] }],
  scene: 0,
  nodes: [
    {
      name: 'Ground Plane',
      extensions: {
        EE_uuid: 'ground-plane',
        EE_visible: true,
        EE_ground_plane: {}
      }
    }
  ],
  extensionsUsed: ['EE_uuid', 'EE_visible', 'EE_ground_plane']
})

export default function AvatarSimpleEntry() {
  const entity = useHookstate(UndefinedEntity)
  const gltfComponent = useOptionalComponent(entity.value, GLTFComponent)
  const avatars =  useFind(avatarPath)

  useEffect(() => {
    const lightEntity = createEntity()
    setComponent(lightEntity, UUIDComponent, 'directional light' as EntityUUID)
    setComponent(lightEntity, NameComponent, 'Directional Light')
    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
    setComponent(lightEntity, VisibleComponent, true)
    setComponent(lightEntity, DirectionalLightComponent, { color: new Color('white'), intensity: 0.5 })
    setComponent(lightEntity, AmbientLightComponent, { color: new Color('white'), intensity: 0.5 })

    const sceneID = `scene`
    const gltf = createSceneGLTF(sceneID)

    const sceneURL = `/${sceneID}.gltf`

    Cache.add(sceneURL, gltf)

    const gltfEntity = GLTFSourceState.load(sceneURL, sceneURL as EntityUUID)
    getMutableComponent(Engine.instance.viewerEntity, RendererComponent).scenes.merge([gltfEntity])
    setComponent(gltfEntity, SceneComponent)
    getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)

    entity.set(gltfEntity)

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    }
  }, [])

  useEffect(() => {
    if (!avatars.data.length || gltfComponent?.progress?.value !== 100) return

    const parentUUID = getComponent(entity.value, UUIDComponent)
    const entityUUID = Engine.instance.userID
    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID,
        avatarID: avatars.data.find(avatar => avatar.modelResource?.key.endsWith('.vrm'))!.id as AvatarID,
        entityUUID: (entityUUID + '_avatar') as EntityUUID,
        name: 'avatar'
      })
    )
  }, [gltfComponent?.progress?.value, avatars.data.length])

  return null
}
