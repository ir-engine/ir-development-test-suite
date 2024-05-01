import ECS, {
  Entity,
  UndefinedEntity,
  createEntity,
  defineComponent,
  removeEntity,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import React, { useEffect } from 'react'
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
    },
    teardown: (entity: Entity) => {
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
    }, [])

    useEffect(() => {
      const example = examples[examplesComponent.currExampleIndex.value]
      const exampleEntity = createEntity()
      example.setup(exampleEntity)
      examplesComponent.currExample.set(exampleEntity)

      return () => {
        if (example.teardown) example.teardown(exampleEntity)
        removeEntity(exampleEntity)
      }
    }, [examplesComponent.currExampleIndex])

    useEffect(() => {
      const currExample = examplesComponent.currExample.value
      if (!currExample) return

      const components = ECS.getAllComponents(currExample)

      return () => {}
    }, [examplesComponent.currExample])

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
