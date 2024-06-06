import config from '@etherealengine/common/src/config'
import {
  Entity,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  defineComponent,
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent,
  useQuery
} from '@etherealengine/ecs'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import {
  InteractableComponent,
  XRUIVisibilityOverride
} from '@etherealengine/engine/src/interaction/components/InteractableComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { LinkComponent } from '@etherealengine/engine/src/scene/components/LinkComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { SDFComponent } from '@etherealengine/engine/src/scene/components/SDFComponent'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'
import { Heuristic, VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { SplineHelperComponent } from '@etherealengine/engine/src/scene/components/debug/SplineHelperComponent'
import { GeometryTypeEnum } from '@etherealengine/engine/src/scene/constants/GeometryTypeEnum'
import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import React, { useEffect } from 'react'
import { MathUtils } from 'three'
import { useAvatars } from '../TestUtils'
import ComponentNamesUI from './ComponentNamesUI'
import ExampleSelectorUI from './ExampleSelectorUI'

type Example = {
  name: string
  description: string
  Reactor: React.FC<{ parent: Entity; onLoad: (entity: Entity) => void }>
}

const setupEntity = (parent: Entity): Entity => {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, generateEntityUUID())
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

const useExampleEntity = (parent: Entity): Entity => {
  const exampleEntity = useHookstate(() => setupEntity(parent))

  useEffect(() => {
    return () => {
      removeEntity(exampleEntity.value)
    }
  }, [])

  return exampleEntity.value
}

export const examples: Example[] = [
  {
    name: 'Models',
    description: 'Add GLTF models to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const model = useOptionalComponent(entity, ModelComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Model-Example')
        setComponent(entity, ModelComponent, {
          cameraOcclusion: true,
          src:
            config.client.fileServer +
            '/projects/ee-development-test-suite/assets/GLTF/Flight%20Helmet/FlightHelmet.gltf'
        })
        setComponent(entity, ShadowComponent, { receive: false })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).scale.set(3, 3, 3)
      }, [])

      useEffect(() => {
        if (model?.scene.value) onLoad(entity)
      }, [model?.scene])

      return null
    }
  },
  {
    name: 'Avatars',
    description: 'Add avatars to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const avatars = useAvatars()
      const model = useOptionalComponent(entity, ModelComponent)

      useEffect(() => {
        const avatarArr = avatars.value
        if (!avatarArr.length) return

        const avatarSrc = avatarArr[MathUtils.randInt(0, avatarArr.length)]
        setComponent(entity, NameComponent, 'Avatar-Example')
        setComponent(entity, ModelComponent, { src: avatarSrc, convertToVRM: true })
        setVisibleComponent(entity, true)
        setComponent(entity, LoopAnimationComponent, {
          animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb'
        })
        const validAnimations = [0, 2, 3, 4, 5, 6, 7, 14, 22, 29]
        const loopAnimationComponent = getMutableComponent(entity, LoopAnimationComponent)
        loopAnimationComponent.activeClipIndex.set(validAnimations[Math.floor(Math.random() * validAnimations.length)])
      }, [avatars])

      useEffect(() => {
        if (model?.scene.value) onLoad(entity)
      }, [model?.scene])

      return null
    }
  },
  {
    name: 'Variants',
    description: 'Load multiple variants of a model',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const model = useOptionalComponent(entity, ModelComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Variant-Example')
        setComponent(entity, ModelComponent, {
          cameraOcclusion: true,
          src: config.client.fileServer + '/projects/ee-development-test-suite/assets/LOD/Test_LOD0.glb'
        })
        setComponent(entity, VariantComponent, {
          heuristic: Heuristic.DISTANCE,
          levels: [
            {
              src: config.client.fileServer + '/projects/ee-development-test-suite/assets/LOD/Test_LOD0.glb',
              metadata: {
                minDistance: 0,
                maxDistance: 5
              }
            },
            {
              src: config.client.fileServer + '/projects/ee-development-test-suite/assets/LOD/Test_LOD1.glb',
              metadata: {
                minDistance: 5,
                maxDistance: 10
              }
            },
            {
              src: config.client.fileServer + '/projects/ee-development-test-suite/assets/LOD/Test_LOD2.glb',
              metadata: {
                minDistance: 10,
                maxDistance: 15
              }
            }
          ]
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1, 0)
      }, [])

      useEffect(() => {
        if (model?.scene.value) onLoad(entity)
      }, [model?.scene])

      return null
    }
  },
  {
    name: 'Particles',
    description: 'Add particle systems to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const particles = useOptionalComponent(entity, ParticleSystemComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Particle-Example')
        setComponent(entity, ParticleSystemComponent)
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 2, 0)
      }, [])

      useEffect(() => {
        if (particles?.system.value) onLoad(entity)
      }, [particles?.system])

      return null
    }
  },
  {
    name: 'Images',
    description: 'Add images to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Image-Example')
        setComponent(entity, ImageComponent, {
          source: config.client.fileServer + '/projects/ee-development-test-suite/assets/Images/testImage.jpg'
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 2, 0)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Videos',
    description: 'Add videos to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Video-Example')
        setComponent(entity, VideoComponent)
        setComponent(entity, MediaComponent, {
          resources: [config.client.fileServer + '/projects/ee-development-test-suite/assets/Videos/HDVideo.mp4']
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 2, 0)
        getComponent(entity, TransformComponent).scale.set(1.777, 1, 1)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Geometry',
    description: 'Add geometry to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        const geoTypes = Object.values(GeometryTypeEnum).filter(
          (value) => typeof value === 'number'
        ) as GeometryTypeEnum[]
        const geoType = geoTypes[MathUtils.randInt(0, geoTypes.length)]
        setComponent(entity, NameComponent, 'Geometry-Example')
        setComponent(entity, PrimitiveGeometryComponent, {
          geometryType: geoType
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'SDF',
    description: 'Add signed distance fields to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'SDF-Example')
        setComponent(entity, SDFComponent)
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Splines',
    description: 'Add splines to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const childEntity = useExampleEntity(entity)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Spline-Example')
        setComponent(entity, SplineComponent)
        setComponent(entity, SplineHelperComponent, { layerMask: ObjectLayerMasks.Scene })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)

        setComponent(childEntity, NameComponent, 'Spline-Follow-Example')
        setComponent(childEntity, PrimitiveGeometryComponent, {
          geometryType: GeometryTypeEnum.SphereGeometry,
          geometryParams: { radius: 0.2, segments: 10 }
        })
        setVisibleComponent(childEntity, true)
        setComponent(childEntity, SplineTrackComponent, { splineEntityUUID: getComponent(entity, UUIDComponent) })
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Animations',
    description: 'Add animated models to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const model = useOptionalComponent(entity, ModelComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Animation-Example')
        setComponent(entity, ModelComponent, {
          src: config.client.fileServer + '/projects/ee-development-test-suite/assets/animations/rings.glb',
          convertToVRM: true
        })
        setVisibleComponent(entity, true)
        setComponent(entity, LoopAnimationComponent, { activeClipIndex: 0 })
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)
      }, [])

      useEffect(() => {
        if (model?.scene.value) onLoad(entity)
      }, [model?.scene])

      return null
    }
  },
  {
    name: 'Links',
    description: 'Add interactable links to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const callback = useOptionalComponent(entity, CallbackComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Link-Example')
        setComponent(entity, LinkComponent)
      }, [])

      useEffect(() => {
        if (!callback?.value) return
        setComponent(entity, InteractableComponent, {
          label: 'Click me',
          // clickInteract: true,
          uiInteractable: true,
          uiVisibilityOverride: XRUIVisibilityOverride.on,
          activationDistance: 10000
        })
        setVisibleComponent(entity, true)
        onLoad(entity)
      }, [callback])

      return null
    }
  },
  {
    name: 'UVOL',
    description: 'Add volumetric models to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const modelEntity = useExampleEntity(entity)
      const outfitEntity = useExampleEntity(entity)
      const model = useOptionalComponent(modelEntity, VolumetricComponent)
      const outfit = useOptionalComponent(outfitEntity, VolumetricComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'UVOL-Example')
        setVisibleComponent(entity, true)

        setComponent(modelEntity, NameComponent, 'Model-Example')
        setComponent(modelEntity, VolumetricComponent, {
          paths: ['https://resources-volumetric.etherealengine.com/alex_walk_performer.json']
        })
        setVisibleComponent(modelEntity, true)

        setComponent(outfitEntity, NameComponent, 'Outfit-Example')
        setComponent(outfitEntity, VolumetricComponent, {
          paths: ['https://resources-volumetric.etherealengine.com/alex_walk_sundress_businessCasual.json']
        })
        setVisibleComponent(outfitEntity, true)

        onLoad(entity)
      }, [])

      return null
    }
  }
]

export const ExamplesComponent = defineComponent({
  name: 'eepro.eetest.ExamplesComponent',
  jsonID: 'eepro.eetest.ExamplesComponent',

  onInit: (entity) => {
    return {
      currExampleIndex: 0,
      currExampleEntity: UndefinedEntity
    }
  },

  toJSON: (entity, component) => {},

  onSet: (entity, component, json) => {},

  onRemove: (entity, component) => {},

  reactor: () => {
    const entity = useEntityContext()
    const examplesComponent = useComponent(entity, ExamplesComponent)
    const currentExample = useHookstate(examples[examplesComponent.currExampleIndex.value])
    const Reactor = currentExample.get(NO_PROXY).Reactor
    const followCameraQuery = useQuery([FollowCameraComponent])

    useEffect(() => {
      const y = (examples.length * 0.25) / 2
      const selectExampleUI = createXRUI(ExampleSelectorUI, null, { interactable: true }, entity)
      selectExampleUI.container.position.set(-2.4, y, -1)

      const componentNamesUIEntity = createEntity()
      setComponent(componentNamesUIEntity, UUIDComponent, generateEntityUUID())
      setComponent(componentNamesUIEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(componentNamesUIEntity, NameComponent, 'componentNamesUI')
      setComponent(componentNamesUIEntity, SourceComponent, getComponent(entity, SourceComponent))
      const componentNamesUI = createXRUI(ComponentNamesUI, null, { interactable: false }, componentNamesUIEntity)
      componentNamesUI.container.position.set(2.4, y, -1)

      return () => {
        removeEntity(componentNamesUIEntity)
      }
    }, [])

    useEffect(() => {
      for (const followEntity of followCameraQuery) {
        const followCameraComponent = getMutableComponent(followEntity, FollowCameraComponent)
        followCameraComponent.zoomLevel.set(0.001)
      }
    }, [followCameraQuery])

    useEffect(() => {
      currentExample.set(examples[examplesComponent.currExampleIndex.value])
    }, [examplesComponent.currExampleIndex])

    const onLoaded = (entity: Entity) => {
      examplesComponent.currExampleEntity.set(entity)
    }

    return <Reactor parent={entity} onLoad={onLoaded} />
  }
})
