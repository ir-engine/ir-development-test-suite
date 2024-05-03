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
  useEntityContext
} from '@etherealengine/ecs'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import React, { useEffect } from 'react'
import { Group, MathUtils } from 'three'
import ComponentNamesUI from './ComponentNamesUI'
import ExampleSelectorUI from './ExampleSelectorUI'

type Example = {
  name: string
  description: string
  setup: (entity: Entity) => void
  teardown?: (entity: Entity) => void
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
      const avatars = getComponent(getComponent(entity, EntityTreeComponent).parentEntity, ExamplesComponent).avatars
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
    },
    teardown: (entity: Entity) => {
      console.log('Tearing down Variant Example')
    }
  },
  {
    name: 'Particles',
    description: 'Add particle systems to your scene',
    setup: (entity: Entity) => {
      const obj3d = new Group()
      obj3d.entity = entity
      setComponent(entity, NameComponent, 'Particle-Example')
      setComponent(entity, ParticleSystemComponent)
      setComponent(entity, Object3DComponent, obj3d)
      setVisibleComponent(entity, true)
    },
    teardown: (entity: Entity) => {
      console.log('Tearing down Particle Example')
    }
  },
  {
    name: 'Links',
    description: 'Add links to your scene',
    setup: (entity: Entity) => {
      console.log('Creating Link Example')
    },
    teardown: (entity: Entity) => {
      console.log('Tearing down Link Example')
    }
  },
  {
    name: 'Splines',
    description: 'Add splines to your scene',
    setup: (entity: Entity) => {
      console.log('Creating Spline Example')
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

const useAvatars = () => {
  const avatars = useHookstate<string[] | null>(null)

  useEffect(() => {
    Engine.instance.api
      .service(avatarPath)
      .find({})
      .then((val) => {
        const avatarSrcs = val.data.map((item) => {
          return item.modelResource!.url
        })
        avatars.set(avatarSrcs)
      })
  }, [])

  return avatars
}

export const ExamplesComponent = defineComponent({
  name: 'eepro.eetest.ExamplesComponent',
  jsonID: 'eepro.eetest.ExamplesComponent',

  onInit: (entity) => {
    return {
      currExample: UndefinedEntity,
      currExampleIndex: 0,
      avatars: [] as string[]
    }
  },

  toJSON: (entity, component) => {},

  onSet: (entity, component, json) => {},

  onRemove: (entity, component) => {},

  reactor: function () {
    const entity = useEntityContext()
    const examplesComponent = useComponent(entity, ExamplesComponent)
    const avatars = useAvatars()
    const loaded = useHookstate(false)

    useEffect(() => {
      const avatarSrcs = avatars.get(NO_PROXY)
      if (avatarSrcs) {
        examplesComponent.avatars.set(avatarSrcs)
        loaded.set(true)
      }
    }, [avatars])

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
      const exampleEntity = createEntity()
      setComponent(exampleEntity, UUIDComponent, generateEntityUUID())
      setComponent(exampleEntity, TransformComponent)
      setComponent(exampleEntity, EntityTreeComponent, { parentEntity: entity })
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
