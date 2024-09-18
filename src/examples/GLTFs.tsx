import React, { useEffect } from 'react'

import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { getMutableState, useImmediateEffect } from '@ir-engine/hyperflux'

import { Entity, EntityUUID, UUIDComponent, createEntity, removeEntity } from '@ir-engine/ecs'

import config from '@ir-engine/common/src/config'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { AmbientLightComponent, DirectionalLightComponent, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Color, Euler, Quaternion } from 'three'
import { RouteData, useRouteScene } from '../sceneRoute'
import { useExampleEntity } from './utils/common/entityUtils'

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
    name: 'Multiple Primitives Morph Targets',
    description: 'Morph Targets For Multiple Primitives ',
    entry: () => (
      <GLTFViewer
        src={
          fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/MultiplePrimitivesMorphTargets.glb'
        }
        light
        animationClip={'Sphere'}
      />
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
    entry: () => (
      <GLTFViewer src={fileServer + '/projects/ee-development-test-suite/assets/GLTF/lightmaptest.glb'} light />
    )
  },
  {
    name: 'EE_material',
    description: 'Ethereal Engine Material Extension',
    /** @todo currently relies on eepro advanced materials project - replace asset with one that has base custom material */
    entry: () => (
      <GLTFViewer src={fileServer + '/projects/ee-development-test-suite/assets/GLTF/double-mat-test.glb'} light />
    )
  }
] as RouteData[]

const GLTF = (props: { root: Entity; src: string; scale?: number; offset?: number; animationClip?: string }) => {
  const { root, src, scale, offset, animationClip } = props
  const gltfEntity = useExampleEntity(root)
  const modelEntity = useExampleEntity(root)

  useImmediateEffect(() => {
    setComponent(gltfEntity, NameComponent, 'GLTF-Loader')
    setComponent(gltfEntity, GLTFComponent, {
      cameraOcclusion: true,
      src: src
    })
    setComponent(gltfEntity, ShadowComponent, { receive: false })
    setVisibleComponent(gltfEntity, true)
    const gltfTransform = getComponent(gltfEntity, TransformComponent)
    if (offset) gltfTransform.position.set(-offset, 0, 0)
    else gltfTransform.position.set(-2, 0, 0)
    if (scale) gltfTransform.scale.set(scale, scale, scale)

    setComponent(modelEntity, NameComponent, 'Three-Loader')
    setComponent(modelEntity, ModelComponent, {
      cameraOcclusion: true,
      src: src
    })
    setComponent(modelEntity, ShadowComponent, { receive: false })
    setVisibleComponent(modelEntity, true)
    const modelTransform = getComponent(modelEntity, TransformComponent)
    if (offset) modelTransform.position.set(offset, 0, 0)
    else modelTransform.position.set(2, 0, 0)
    if (scale) modelTransform.scale.set(scale, scale, scale)
  }, [])

  return null
}

export default function GLTFViewer(props: {
  src: string
  scale?: number
  offset?: number
  light?: boolean
  animationClip?: string
}) {
  const sceneEntity = useRouteScene()

  useEffect(() => {
    const bgColor = document.body.style.backgroundColor
    document.body.style.backgroundColor = 'gray'
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)

    return () => {
      document.body.style.backgroundColor = bgColor
    }
  }, [])

  useEffect(() => {
    if (!props.light || !sceneEntity) return

    const entity = createEntity()
    setComponent(entity, UUIDComponent, 'directional light' as EntityUUID)
    setComponent(entity, NameComponent, 'Directional Light')
    setComponent(entity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, DirectionalLightComponent, { color: new Color('white'), intensity: 0.5 })
    setComponent(entity, AmbientLightComponent, { color: new Color('white'), intensity: 0.5 })

    return () => {
      removeEntity(entity)
    }
  }, [props.light, sceneEntity])

  // useEffect(() => {
  //   return GLTFAssetState.loadScene(props.src, props.src)
  // }, [props.src])

  // const assetEntity = useMutableState(GLTFAssetState)[props.src].value
  // const animationComponent = useOptionalComponent(assetEntity, AnimationComponent)

  // useEffect(() => {
  //   if (!assetEntity || !props.scale) return

  //   setComponent(assetEntity, TransformComponent, { scale: new Vector3().setScalar(props.scale) })
  // }, [assetEntity, props.scale])

  // useEffect(() => {
  //   if (!animationComponent?.value?.animations || !props.animationClip) return

  //   const clips = animationComponent?.value?.animations as AnimationClip[]

  //   const clip = AnimationClip.findByName(clips, props.animationClip)
  //   if (!clip) return console.warn('Clip not found:', props.animationClip)

  //   console.log(clip)

  //   const action = animationComponent.value.mixer.clipAction(clip)
  //   action.play()
  // }, [animationComponent?.value?.animations, props.animationClip])

  return sceneEntity ? (
    <GLTF root={sceneEntity} src={props.src} scale={props.scale} animationClip={props.animationClip} />
  ) : null
}
