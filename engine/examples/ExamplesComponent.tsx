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
import { NO_PROXY } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { MathUtils } from 'three'
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

const useAvatars = () => {
  const avatars = useHookstate([] as string[])
  useEffect(() => {
    let loading = true
    Engine.instance.api
      .service(avatarPath)
      .find({})
      .then((val) => {
        const avatarSrcs = val.data.map((item) => {
          return item.modelResource!.url
        })
        if (loading) avatars.set(avatarSrcs)
      })

    return () => {
      loading = false
    }
  }, [])

  return avatars
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

        const avatarSrc = avatars.value[MathUtils.randInt(0, avatars.length)]
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
    name: 'Splines',
    description: 'Add splines to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
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
        console.log('Creating Animation Example')
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

    useEffect(() => {
      const selectExampleUI = createXRUI(ExampleSelectorUI, null, { interactable: true }, entity)
      selectExampleUI.container.position.set(-2, 1.8, -1)

      const componentNamesUIEntity = createEntity()
      setComponent(componentNamesUIEntity, UUIDComponent, generateEntityUUID())
      setComponent(componentNamesUIEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(componentNamesUIEntity, NameComponent, 'componentNamesUI')
      setComponent(componentNamesUIEntity, SourceComponent, getComponent(entity, SourceComponent))
      const componentNamesUI = createXRUI(ComponentNamesUI, null, { interactable: false }, componentNamesUIEntity)
      componentNamesUI.container.position.set(2, 1.8, -1)

      return () => {
        removeEntity(componentNamesUIEntity)
      }
    }, [])

    useEffect(() => {
      currentExample.set(examples[examplesComponent.currExampleIndex.value])
    }, [examplesComponent.currExampleIndex])

    const onLoaded = (entity: Entity) => {
      examplesComponent.currExampleEntity.set(entity)
    }

    return <Reactor parent={entity} onLoad={onLoaded} />
  }
})
