import {
  Entity,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  defineComponent,
  generateEntityUUID,
  getComponent,
  removeComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import React, { useEffect } from 'react'
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
      console.log('Creating Model Example')
      setComponent(entity, NameComponent, 'Flight-Helmet')
      setComponent(entity, ModelComponent, {
        cameraOcclusion: true,
        src: 'https://localhost:8642/projects/ee-development-test-suite/assets/GLTF/Flight%20Helmet/FlightHelmet.gltf'
      })
      setVisibleComponent(entity, true)
      getComponent(entity, TransformComponent).scale.set(3, 3, 3)
    },
    teardown: (entity: Entity) => {
      removeComponent(entity, ModelComponent)
      console.log('Tearing down Model Example')
    }
  },
  {
    name: 'Avatars',
    description: 'Add avatars to your scene',
    setup: (entity: Entity) => {
      console.log('Creating Avatar Example')
    },
    teardown: (entity: Entity) => {
      console.log('Tearing down Avatar Example')
    }
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
      console.log('Creating Particle Example')
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

export const ExamplesComponent = defineComponent({
  name: 'eepro.eetest.ExamplesComponent',
  jsonID: 'eepro.eetest.ExamplesComponent',

  onInit: (entity) => {
    return {
      currExample: UndefinedEntity,
      currExampleIndex: 0
    }
  },

  toJSON: (entity, component) => {},

  onSet: (entity, component, json) => {},

  onRemove: (entity, component) => {},

  reactor: function () {
    const entity = useEntityContext()
    const examplesComponent = useComponent(entity, ExamplesComponent)

    useEffect(() => {
      const selectExampleUI = createXRUI(ExampleSelectorUI, null, { interactable: true }, entity)
      selectExampleUI.container.position.set(-2, 1.5, -1)

      // const componentNamesUIEntity = entity
      const componentNamesUIEntity = createEntity()
      setComponent(componentNamesUIEntity, UUIDComponent, generateEntityUUID())
      setComponent(componentNamesUIEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(componentNamesUIEntity, NameComponent, 'componentNamesUI')
      setComponent(componentNamesUIEntity, SourceComponent, getComponent(entity, SourceComponent))
      const componentNamesUI = createXRUI(ComponentNamesUI, null, { interactable: true }, componentNamesUIEntity)
      componentNamesUI.container.position.set(2, 1.5, -1)

      return () => {
        removeEntity(componentNamesUIEntity)
      }
    }, [])

    useEffect(() => {
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
    }, [examplesComponent.currExampleIndex])

    return <></>
  }
})

export const ExampleComponent = defineComponent({
  name: 'eepro.eetest.ExampleComponent',
  jsonID: 'eepro.eetest.ExampleComponent',

  onInit: (entity) => {
    return {
      name: ''
    }
  },

  toJSON: (entity, component) => {
    return {
      name: component.name.value
    }
  },

  onSet: (entity, component, json) => {},

  onRemove: (entity, component) => {},

  reactor: function () {
    return null
  },

  errors: []
})
