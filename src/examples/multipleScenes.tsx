import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { Engine, EntityUUID, createEntity, getComponent, getMutableComponent, setComponent } from '@etherealengine/ecs'
import { GLTFAssetState, GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { getMutableState, useHookstate, useImmediateEffect } from '@etherealengine/hyperflux'
import { DirectionalLightComponent, TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { GLTF } from '@gltf-transform/core'
import React, { useEffect } from 'react'
import { Cache, Color, Euler, Quaternion, Vector3 } from 'three'

export const metadata = {
  title: 'Avatar Test',
  description: ''
}

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
      matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
      name: 'Rigidbody',
      extensions: {
        EE_uuid: 'rigidbody-' + id,
        EE_visible: true,
        EE_rigidbody: {
          type: 'fixed'
        },
        EE_collider: {
          shape: 'box'
        },
        EE_primitive_geometry: {
          geometryType: 0,
          geometryParams: {
            width: 1,
            height: 1,
            depth: 1
          }
        }
      }
    }
  ],
  extensionsUsed: ['EE_uuid', 'EE_visible', 'EE_rigidbody', 'EE_collider', 'EE_primitive_geometry']
})

const SceneReactor = (props: { coord: Vector3 }) => {
  const { coord } = props
  useEffect(() => {
    const sceneID = `scene-${coord.x}-${coord.z}`
    const gltf = createSceneGLTF(sceneID)

    const sceneURL = `/${sceneID}.gltf`

    Cache.add(sceneURL, gltf)

    const gltfEntity = GLTFSourceState.load(sceneURL, sceneURL as EntityUUID)
    setComponent(gltfEntity, TransformComponent, {
      position: coord
        .clone()
        .sub(new Vector3(0.5, 0, 0.5))
        .multiplyScalar(gridSpacing)
    })
    getMutableComponent(Engine.instance.viewerEntity, SceneComponent).scenes.merge([gltfEntity])
    getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    }
  }, [])

  return null
}

const gridCount = 10
const gridSpacing = 10

export default function MultipleScenesEntry() {
  useNetwork({ online: false })
  useLoadEngineWithScene()

  useImmediateEffect(() => {
    const lightEntity = createEntity()
    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(-4, -0.5, 0)) })
    setComponent(lightEntity, NameComponent, 'directional light')
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, DirectionalLightComponent, { intensity: 1, color: new Color(0xffffff) })
    getMutableComponent(Engine.instance.viewerEntity, SceneComponent).scenes.merge([lightEntity])

    getMutableState(RendererState).gridVisibility.set(true)
    const entity = Engine.instance.viewerEntity
    setComponent(entity, CameraOrbitComponent)
    setComponent(entity, InputComponent)
    getComponent(entity, CameraComponent).position.set(0, 3, 4)
  }, [])

  const coordsState = useHookstate<Vector3[]>([])

  useEffect(() => {
    const coords = [] as Vector3[]
    for (let i = -gridCount * 0.5; i < gridCount * 0.5; i++) {
      for (let j = -gridCount * 0.5; j < gridCount * 0.5; j++) {
        coords.push(new Vector3(i, 0, j))
      }
    }
    coordsState.set(coords)
  }, [])

  return (
    <>
      {coordsState.value.map((coord) => (
        <SceneReactor key={`${coord.x}-${coord.z}`} coord={coord} />
      ))}
    </>
  )
}
