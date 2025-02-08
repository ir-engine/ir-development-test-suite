import { Entity, UUIDComponent, UndefinedEntity, getComponent, setComponent } from '@ir-engine/ecs'
import { RenderSettingsComponent } from '@ir-engine/engine/src/scene/components/RenderSettingsComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import {
  DirectionalLightComponent,
  PointLightComponent,
  SpotLightComponent,
  TransformComponent
} from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect } from 'react'
import { BoxGeometry, Color, Euler, Mesh, MeshLambertMaterial, Quaternion, Vector3 } from 'three'
import { useExampleEntity } from './utils/common/entityUtils'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { SkyTypeEnum } from '@ir-engine/engine/src/scene/constants/SkyTypeEnum'
import { useHookstate } from '@ir-engine/hyperflux'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import PostprocessingUI from './postprocessingUI/postprocessingUI'

export default function PostProcessingExampleEntry(props: { sceneEntity: Entity }) {
  const settingsEntity = useExampleEntity(props.sceneEntity)
  const platformEntity = useExampleEntity(props.sceneEntity)
  const skyboxEntity = useExampleEntity(props.sceneEntity)
  const boxEntity = useExampleEntity(props.sceneEntity)
  const directionalLightEntity = useExampleEntity(props.sceneEntity)
  const spotLightEntity = useExampleEntity(props.sceneEntity)
  const pointLightEntity = useExampleEntity(props.sceneEntity)
  const postProcessingUIEntity = useExampleEntity(props.sceneEntity)
  const xruiState = useHookstate({ settingsEntity: settingsEntity })


  useEffect(() => {
    setComponent(skyboxEntity, NameComponent, "Skybox")
    setComponent(skyboxEntity, SkyboxComponent, {
      backgroundType: SkyTypeEnum.color,
      backgroundColor: 0x828282
    })
    setComponent(skyboxEntity, VisibleComponent)
    setComponent(settingsEntity, RenderSettingsComponent, {
      primaryLight: getComponent(directionalLightEntity, UUIDComponent)
    }) // required for CSM
    setComponent(settingsEntity, PostProcessingComponent, {
      enabled: true,
      effects: {"SSAOEffect": {
              "isActive": false,
              "blendFunction": 21,
              "distanceScaling": true,
              "depthAwareUpsampling": true,
              "samples": 16,
              "rings": 7,
              "distanceThreshold": 0.125,
              "distanceFalloff": 0.02,
              "minRadiusScale": 1,
              "bias": 0.25,
              "radius": 0.01,
              "intensity": 2,
              "fade": 0.05
            },
            "SSREffect": {
              "isActive": false,
              "distance": 10,
              "thickness": 10,
              "autoThickness": false,
              "maxRoughness": 1,
              "blend": 0.9,
              "denoiseIterations": 1,
              "denoiseKernel": 2,
              "denoiseDiffuse": 10,
              "denoiseSpecular": 10,
              "depthPhi": 2,
              "normalPhi": 50,
              "roughnessPhi": 1,
              "envBlur": 0.5,
              "importanceSampling": true,
              "directLightMultiplier": 1,
              "steps": 20,
              "refineSteps": 5,
              "spp": 1,
              "resolutionScale": 1,
              "missedRays": false
            },
            "DepthOfFieldEffect": {
              "isActive": false,
              "blendFunction": 23,
              "focusDistance": 0.02,
              "focalLength": 0.5,
              "bokehScale": 1
            },
            "BloomEffect": {
              "isActive": true,
              "blendFunction": 28,
              "kernelSize": 2,
              "luminanceThreshold": .1,
              "luminanceSmoothing": 0.1,
              "intensity": 2
            },
            "ToneMappingEffect": {
              "isActive": false,
              "blendFunction": 23,
              "adaptive": true,
              "resolution": 512,
              "middleGrey": 0.6,
              "maxLuminance": 32,
              "averageLuminance": 1,
              "adaptationRate": 2
            },
            "BrightnessContrastEffect": {
              "isActive": false,
              "brightness": 0.05,
              "contrast": 0.1
            },
            "HueSaturationEffect": {
              "isActive": false,
              "hue": 0xff0000,
              "saturation": -0.15
            },
            "ColorDepthEffect": {
              "isActive": false,
              "bits": 16
            },
            "LinearTosRGBEffect": {
              "isActive": false
            },
            "SSGIEffect": {
              "isActive": false,
              "distance": 10,
              "thickness": 10,
              "autoThickness": false,
              "maxRoughness": 1,
              "blend": 0.9,
              "denoiseIterations": 1,
              "denoiseKernel": 2,
              "denoiseDiffuse": 10,
              "denoiseSpecular": 10,
              "depthPhi": 2,
              "normalPhi": 50,
              "roughnessPhi": 1,
              "envBlur": 0.5,
              "importanceSampling": true,
              "directLightMultiplier": 1,
              "steps": 20,
              "refineSteps": 5,
              "spp": 1,
              "resolutionScale": 1,
              "missedRays": false
            },
            "TRAAEffect": {
              "isActive": false,
              "blend": 0.8,
              "constantBlend": true,
              "dilation": true,
              "blockySampling": false,
              "logTransform": false,
              "depthDistance": 10,
              "worldDistance": 5,
              "neighborhoodClamping": true
            },
            "MotionBlurEffect": {
              "isActive": false,
              "intensity": 1,
              "jitter": 1,
              "samples": 16
            }
          }})
    setComponent(platformEntity, TransformComponent, {
      position: new Vector3(0, -0.5, 0),
      scale: new Vector3(10, 0.1, 10)
    })
    setComponent(platformEntity, VisibleComponent)
    setComponent(platformEntity, NameComponent, 'Platform')
    setComponent(platformEntity, MeshComponent, new Mesh(new BoxGeometry(), new MeshLambertMaterial()))
    setComponent(platformEntity, ShadowComponent, { cast: false })

    setComponent(boxEntity, TransformComponent, { position: new Vector3(0, 0.5, 0) })
    setComponent(boxEntity, VisibleComponent)
    setComponent(boxEntity, NameComponent, 'Box')
    setComponent(boxEntity, MeshComponent, new Mesh(new BoxGeometry(), new MeshLambertMaterial()))
    setComponent(boxEntity, ShadowComponent, { receive: false })

    setComponent(directionalLightEntity, TransformComponent, {
      position: new Vector3(1, 2, -3),
      rotation: new Quaternion().setFromEuler(
        new Euler().setFromVector3(new Vector3(Math.PI * 0.5, -Math.PI * 0.25).normalize())
      )
    })
    setComponent(directionalLightEntity, NameComponent, 'Directional Light')
    setComponent(directionalLightEntity, VisibleComponent)
    setComponent(directionalLightEntity, DirectionalLightComponent, {
      intensity: 0.5,
      castShadow: true,
      color: new Color('cyan')
    })
    setComponent(directionalLightEntity, ShadowComponent, { receive: false })

    setComponent(spotLightEntity, TransformComponent, {
      position: new Vector3(1, 2, 2),
      rotation: new Quaternion().setFromEuler(
        new Euler().setFromVector3(new Vector3(Math.PI * 0.75, -Math.PI * 0.1, 0))
      )
    })
    setComponent(spotLightEntity, NameComponent, 'Spot Light')
    setComponent(spotLightEntity, VisibleComponent)
    setComponent(spotLightEntity, SpotLightComponent, {
      castShadow: true,
      decay: 1,
      range: 10,
      intensity: 10,
      color: new Color('green')
    })

    setComponent(pointLightEntity, TransformComponent, { position: new Vector3(0, 2, -2) })
    setComponent(pointLightEntity, NameComponent, 'Point Light')
    setComponent(pointLightEntity, VisibleComponent)
    setComponent(pointLightEntity, PointLightComponent, {
      castShadow: true,
      decay: 2,
      range: 5,
      intensity: 10,
      color: new Color('red')
    })

    const postProcessingUI = createXRUI(PostprocessingUI, xruiState, { interactable: false }, postProcessingUIEntity)
    postProcessingUI.container.position.set(2.4, 2, -1)
  }, [])

  return <></>
}
