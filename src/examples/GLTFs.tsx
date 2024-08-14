import React, { useEffect } from 'react'

import { getComponent, setComponent, useOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'

import { Engine, EntityUUID, UUIDComponent, createEntity, removeEntity } from '@etherealengine/ecs'

import { AnimationComponent } from '@etherealengine/engine/src/avatar/components/AnimationComponent'
import { GLTFAssetState } from '@etherealengine/engine/src/gltf/GLTFState'
import { AmbientLightComponent, DirectionalLightComponent, TransformComponent } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { AnimationClip, Color, Euler, Quaternion, Vector3 } from 'three'
import { RouteData } from '../sceneRoute'
import config from '@etherealengine/common/src/config'

export const metadata = {
  title: 'GLTF',
  description: ''
}

const fileServer = config.client.fileServer
const CDN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0'

export const gltfRoutes = [
  {
    name: 'Basic',
    description: 'Basic Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF/Duck.gltf'} light />
  },
  {
    name: 'Binary',
    description: 'Binary Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Binary/Duck.glb'} light />
  },
  {
    name: 'Draco',
    description: 'Draco Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Draco/Duck.gltf'} light />
  },
  {
    name: 'Embedded',
    description: 'Embedded Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Embedded/Duck.gltf'} light />
  },
  {
    name: 'Quantized',
    description: 'Quantized Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Quantized/Duck.gltf'} light />
  },
  {
    name: 'Skinning',
    description: 'Animated Fox',
    entry: () => <GLTFViewer src={CDN_URL + '/Fox/glTF/Fox.gltf'} light animationClip={'Run'} scale={0.01} />
  },
  {
    name: 'Morph Targets',
    description: 'Morph Primitives Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf'} light animationClip={'Square'} />
    )
  },
  {
    name: 'KHR_materials_unlit',
    description: 'Khronos Unlit Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/UnlitTest/glTF/UnlitTest.gltf'} />
  },
  {
    name: 'KHR_materials_emissive_strength',
    description: 'Khronos Emissive Strength Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/EmissiveStrengthTest/glTF/EmissiveStrengthTest.gltf'} light />
  },
  {
    name: 'KHR_materials_clearcoat',
    description: 'Khronos Clearcoat Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/ClearCoatTest/glTF/ClearCoatTest.gltf'} light />
  },
  {
    name: 'KHR_materials_iridescence',
    description: 'Khronos Iridescence Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/IridescenceMetallicSpheres/glTF/IridescenceMetallicSpheres.gltf'} light />
  },
  {
    name: 'KHR_materials_sheen',
    description: 'Khronos Sheen Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/SheenChair/glTF/SheenChair.gltf'} light />
  },
  {
    name: 'KHR_materials_transmission',
    description: 'Khronos Transmission Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/TransmissionTest/glTF/TransmissionTest.gltf'} light />
  },
  {
    name: 'KHR_materials_volume',
    description: 'Khronos Volume Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/AttenuationTest/glTF/AttenuationTest.gltf'} light />
  },
  // {
  //   name: 'KHR_materials_ior',
  //   description: 'Khronos Index of Refraction Material Extension',
  //   entry: () => <GLTFViewer src={CDN_URL + '/IORTest/glTF/IORTest.gltf'} light />
  // },
  {
    name: 'KHR_materials_specular',
    description: 'Khronos Specular Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/SpecularTest/glTF/SpecularTest.gltf'} light />
  },
  // {
  //   name: 'EXT_materials_bump',
  //   description: 'Khronos Bump Material Extension',
  //   entry: () => <GLTFViewer src={CDN_URL + '/BumpTest/glTF/BumpTest.gltf'} light />
  // },
  {
    name: 'KHR_materials_anisotropy',
    description: 'Khronos Anisotropy Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/CarbonFibre/glTF/CarbonFibre.gltf'} light />
  },
  {
    name: 'KHR_lights_punctual',
    description: 'Khronos Punctual Lights Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/LightsPunctualLamp/glTF/LightsPunctualLamp.gltf'} />
  },
  {
    name: 'KHR_texture_basisu',
    description: 'Khronos Basis Universal Texture Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/FlightHelmet/glTF-KTX-BasisU/FlightHelmet.gltf'} light />
  },
  {
    name: 'EXT_meshopt_compression',
    description: 'Mesh Optimization Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/DragonAttenuation/glTF-Meshopt/DragonAttenuation.gltf'} light />
  },
  {
    name: 'EXT_mesh_gpu_instancing',
    description: 'GPU Instancing Extension',
    // entry: () => <GLTFViewer src={'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF-instancing/DamagedHelmetGpuInstancing.gltf'} light />
    entry: () => <GLTFViewer src={CDN_URL + '/SimpleInstancing/glTF/SimpleInstancing.gltf'} light />
  },
  {
    name: 'KHR_materials_pbrSpecularGlossiness',
    description: 'DEPRECATED Khronos PBR Specular Glossiness Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/SpecGlossVsMetalRough/glTF/SpecGlossVsMetalRough.gltf'} light />
  },
  {
    name: 'MOZ_lightmap',
    description: 'Mozilla Lightmap Extension',
    entry: () => <GLTFViewer src={fileServer + '/projects/ee-development-test-suite/assets/GLTF/lightmaptest.glb'} light />
  },
  {
    name: 'EE_material',
    description: 'Ethereal Engine Material Extension',
    /** @todo currently relies on eepro advanced materials project - replace asset with one that has base custom material */
    entry: () => <GLTFViewer src={fileServer + '/projects/ee-development-test-suite/assets/GLTF/double-mat-test.glb'} light />
  },
  {
    name: 'VRM',
    description: 'VRM Avatar',
    entry: () => <GLTFViewer src={fileServer + '/projects/ee-development-test-suite/assets/GLTF/VRM/VRMTest.vrm'} light />
  }
] as RouteData[]

export default function GLTFViewer(props: { src: string; scale?: number; light?: boolean; animationClip?: string }) {
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
    return GLTFAssetState.loadScene(props.src, props.src)
  }, [props.src])

  const assetEntity = useMutableState(GLTFAssetState)[props.src].value
  const animationComponent = useOptionalComponent(assetEntity, AnimationComponent)

  useEffect(() => {
    if (!assetEntity || !props.scale) return

    setComponent(assetEntity, TransformComponent, { scale: new Vector3().setScalar(props.scale) })
  }, [assetEntity, props.scale])

  useEffect(() => {
    if (!animationComponent?.value?.animations || !props.animationClip) return

    const clips = animationComponent?.value?.animations as AnimationClip[]

    const clip = AnimationClip.findByName(clips, props.animationClip)
    if (!clip) return console.warn('Clip not found:', props.animationClip)

    const action = animationComponent.value.mixer.clipAction(clip)
    action.play()
  }, [animationComponent?.value?.animations, props.animationClip])

  useEffect(() => {
    if (!props.light) return

    const entity = createEntity()
    setComponent(entity, UUIDComponent, 'directional light' as EntityUUID)
    setComponent(entity, NameComponent, 'Directional Light')
    setComponent(entity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, DirectionalLightComponent, { color: new Color('white'), intensity: 0.5 })
    setComponent(entity, AmbientLightComponent, { color: new Color('white'), intensity: 0.5 })

    return () => {
      removeEntity(entity)
    }
  }, [props.light])

  return null
}
