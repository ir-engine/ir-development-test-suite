import config from '@etherealengine/common/src/config'
import { avatarPath } from '@etherealengine/common/src/schema.type.module'
import {
  Engine,
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
  useOptionalComponent
} from '@etherealengine/ecs'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'
import { Heuristic, VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { SplineHelperComponent } from '@etherealengine/engine/src/scene/components/debug/SplineHelperComponent'
import { GeometryTypeEnum } from '@etherealengine/engine/src/scene/constants/GeometryTypeEnum'
import { useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import React, { useEffect } from 'react'
import { MathUtils } from 'three'
import ComponentNamesUI from './ComponentNamesUI'
import ExampleSelectorUI from './ExampleSelectorUI'

type Example = {
  name: string
  description: string
  setup: (entity: Entity) => void
  teardown?: (entity: Entity) => void
}

const setupEntity = (parent: Entity): Entity => {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, generateEntityUUID())
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

export const examples: Example[] = [
  {
    name: 'Models',
    description: 'Add GLTF models to your scene',
    setup: (entity: Entity) => {
      setComponent(entity, NameComponent, 'Model-Example')
      setComponent(entity, ModelComponent, {
        cameraOcclusion: true,
        src:
          config.client.fileServer + '/projects/ee-development-test-suite/assets/GLTF/Flight%20Helmet/FlightHelmet.gltf'
      })
      setVisibleComponent(entity, true)
      getComponent(entity, TransformComponent).scale.set(3, 3, 3)
    },
    teardown: (entity: Entity) => {}
  },
  {
    name: 'Avatars',
    description: 'Add avatars to your scene',
    setup: (entity: Entity) => {
      const avatars = getComponent(getComponent(entity, EntityTreeComponent).parentEntity, ExamplesComponent).avatars!
      const avatarSrc = avatars[MathUtils.randInt(0, avatars.length)]
      setComponent(entity, NameComponent, 'Avatar-Example')
      setComponent(entity, ModelComponent, { src: avatarSrc, convertToVRM: true })
      setVisibleComponent(entity, true)
      setComponent(entity, LoopAnimationComponent, {
        animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb'
      })
      const validAnimations = [0, 2, 3, 4, 5, 6, 7, 14, 22, 29]
      const loopAnimationComponent = getMutableComponent(entity, LoopAnimationComponent)
      loopAnimationComponent.activeClipIndex.set(validAnimations[Math.floor(Math.random() * validAnimations.length)])
    },
    teardown: (entity: Entity) => {}
  },
  {
    name: 'Variants',
    description: 'Load multiple variants of a model',
    setup: (entity: Entity) => {
      console.log('Creating Variant Example')
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
    },
    teardown: (entity: Entity) => {}
  },
  {
    name: 'Particles',
    description: 'Add particle systems to your scene',
    setup: (entity: Entity) => {
      setComponent(entity, NameComponent, 'Particle-Example')
      setComponent(entity, ParticleSystemComponent)
      setVisibleComponent(entity, true)
      getComponent(entity, TransformComponent).position.set(0, 2, 0)
    },
    teardown: (entity: Entity) => {}
  },
  {
    name: 'Images',
    description: 'Add images to your scene',
    setup: (entity: Entity) => {
      setComponent(entity, NameComponent, 'Image-Example')
      setComponent(entity, ImageComponent, {
        source: config.client.fileServer + '/projects/ee-development-test-suite/assets/Images/testImage.jpg'
      })
      setVisibleComponent(entity, true)
      getComponent(entity, TransformComponent).position.set(0, 2, 0)
    },
    teardown: (entity: Entity) => {}
  },
  {
    name: 'Videos',
    description: 'Add videos to your scene',
    setup: (entity: Entity) => {
      setComponent(entity, NameComponent, 'Video-Example')
      setComponent(entity, VideoComponent)
      setComponent(entity, MediaComponent, {
        resources: [config.client.fileServer + '/projects/ee-development-test-suite/assets/Videos/HDVideo.mp4']
      })
      setVisibleComponent(entity, true)
      getComponent(entity, TransformComponent).position.set(0, 2, 0)
      getComponent(entity, TransformComponent).scale.set(1.777, 1, 1)
    },
    teardown: (entity: Entity) => {}
  },
  {
    name: 'Splines',
    description: 'Add splines to your scene',
    setup: (entity: Entity) => {
      setComponent(entity, NameComponent, 'Spline-Example')
      setComponent(entity, SplineComponent)
      setComponent(entity, SplineHelperComponent, { layerMask: ObjectLayerMasks.Scene })
      setVisibleComponent(entity, true)
      getComponent(entity, TransformComponent).position.set(0, 1.5, 0)

      const childEntity = setupEntity(entity)
      setComponent(childEntity, NameComponent, 'Spline-Follow-Example')
      setComponent(childEntity, PrimitiveGeometryComponent, {
        geometryType: GeometryTypeEnum.SphereGeometry,
        geometryParams: { radius: 0.2, segments: 10 }
      })
      setVisibleComponent(childEntity, true)
      setComponent(childEntity, SplineTrackComponent, { splineEntityUUID: getComponent(entity, UUIDComponent) })
    },
    teardown: (entity: Entity) => {
      console.log('Tearing down Spline Example')
    }
  },
  {
    name: 'Animations',
    description: 'Add animated models to your scene',
    setup: (entity: Entity) => {
      console.log('Creating Animation Example')
    },
    teardown: (entity: Entity) => {
      console.log('Tearing down Animation Example')
    }
  }
]

const useAvatars = (entity: Entity) => {
  const examples = useOptionalComponent(entity, ExamplesComponent)

  useEffect(() => {
    let loading = true
    Engine.instance.api
      .service(avatarPath)
      .find({})
      .then((val) => {
        const avatarSrcs = val.data.map((item) => {
          return item.modelResource!.url
        })
        if (examples && loading) examples.avatars.set(avatarSrcs)
      })

    return () => {
      loading = false
    }
  }, [])
}

export const ExamplesComponent = defineComponent({
  name: 'eepro.eetest.ExamplesComponent',
  jsonID: 'eepro.eetest.ExamplesComponent',

  onInit: (entity) => {
    return {
      currExample: UndefinedEntity,
      currExampleIndex: 0,
      avatars: null as null | string[]
    }
  },

  toJSON: (entity, component) => {},

  onSet: (entity, component, json) => {},

  onRemove: (entity, component) => {},

  reactor: () => {
    const entity = useEntityContext()
    const examplesComponent = useComponent(entity, ExamplesComponent)
    useAvatars(entity)
    const loaded = useHookstate(false)

    useEffect(() => {
      if (examplesComponent.avatars.value) {
        loaded.set(true)
      }
    }, [examplesComponent.avatars])

    useEffect(() => {
      if (!loaded.value) return

      const selectExampleUI = createXRUI(ExampleSelectorUI, null, { interactable: true }, entity)
      selectExampleUI.container.position.set(-2, 1.8, -1)

      // const componentNamesUIEntity = entity
      const componentNamesUIEntity = createEntity()
      setComponent(componentNamesUIEntity, UUIDComponent, generateEntityUUID())
      setComponent(componentNamesUIEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(componentNamesUIEntity, NameComponent, 'componentNamesUI')
      setComponent(componentNamesUIEntity, SourceComponent, getComponent(entity, SourceComponent))
      const componentNamesUI = createXRUI(ComponentNamesUI, null, { interactable: false }, componentNamesUIEntity)
      // componentNamesUI.container.options.onLayerPaint = () => {
      //   const height = (componentNamesUI.container.children[0] as WebLayer3D).element.clientHeight / 1000
      //   console.log('Painting container: ' + height)
      //   componentNamesUI.container.position.set(2, 3.8 - height, -1)
      // }
      componentNamesUI.container.position.set(2, 1.8, -1)

      return () => {
        removeEntity(componentNamesUIEntity)
      }
    }, [loaded])

    useEffect(() => {
      if (!loaded.value) return

      const example = examples[examplesComponent.currExampleIndex.value]
      const exampleEntity = setupEntity(entity)
      example.setup(exampleEntity)
      examplesComponent.currExample.set(exampleEntity)

      return () => {
        if (example.teardown) example.teardown(exampleEntity)
        removeEntity(exampleEntity)
      }
    }, [examplesComponent.currExampleIndex, loaded])

    return <></>
  }
})
