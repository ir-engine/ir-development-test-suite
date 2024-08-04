import React, { useEffect } from 'react'

import { getComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { Engine, EntityUUID, UUIDComponent, createEntity, removeEntity } from '@etherealengine/ecs'

import config from '@etherealengine/common/src/config'
import { GLTFAssetState } from '@etherealengine/engine/src/gltf/GLTFState'
import { DirectionalLightComponent, TransformComponent } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Color, Euler, Quaternion } from 'three'
import { RouteData } from '../sceneRoute'

export const metadata = {
  title: 'GLTF',
  description: ''
}

const CDN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/'

export const gltfRoutes = [
  { 
    name: 'Basic',
    description: 'Basic Duck',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/Duck/glTF/Duck.gltf'}
      />
    )
  },
  {
    name: 'Binary',
    description: 'Binary Duck',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/Duck/glTF-Binary/Duck.glb'}
      />
    )
  },
  {
    name: 'Draco',
    description: 'Draco Duck',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/Duck/glTF-Draco/Duck.gltf'}
      />
    )
  },
  {
    name: 'Embedded',
    description: 'Embedded Duck',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/Duck/glTF-Embedded/Duck.gltf'}
      />
    )
  },
  {
    name: 'Quantized',
    description: 'Quantized Duck',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/Duck/glTF-Quantized/Duck.gltf'}
      />
    )
  },
  {
    name: 'KHR_materials_unlit',
    description: 'Khronos Unlit Material Extension',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/UnlitTest/glTF/UnlitTest.gltf'}
      />
    )
  }
] as RouteData[]

// EXTENSIONS.KHR_MATERIALS_UNLIT
// EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH
// EXTENSIONS.KHR_MATERIALS_CLEARCOAT
// EXTENSIONS.KHR_MATERIALS_IRIDESCENCE
// EXTENSIONS.KHR_MATERIALS_SHEEN
// EXTENSIONS.KHR_MATERIALS_TRANSMISSION
// EXTENSIONS.KHR_MATERIALS_VOLUME
// EXTENSIONS.KHR_MATERIALS_IOR
// EXTENSIONS.KHR_MATERIALS_SPECULAR
// EXTENSIONS.EXT_MATERIALS_BUMP
// EXTENSIONS.KHR_MATERIALS_ANISOTROPY

export default function GLTFViewer(props: { src: string }) {
  useEffect(() => {
    const bgColor = document.body.style.backgroundColor
    document.body.style.backgroundColor = 'gray'
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
    const entity = Engine.instance.viewerEntity
    setComponent(entity, CameraOrbitComponent)
    setComponent(entity, InputComponent)
    getComponent(entity, CameraComponent).position.set(0, 3, 4)

    return () => {
      document.body.style.backgroundColor = bgColor
    }
  }, [])

  useEffect(() => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, 'directional light' as EntityUUID)
    setComponent(entity, NameComponent, 'Directional Light')
    setComponent(entity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, DirectionalLightComponent, { color: new Color('white'), intensity: 1 })

    const ret = GLTFAssetState.loadScene(props.src, props.src)
    return () => {
      removeEntity(entity)
      ret()
    }
  }, [props.src])

  return null
}
