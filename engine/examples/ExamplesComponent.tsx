import {
  Entity,
  UndefinedEntity,
  createEntity,
  defineComponent,
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
      console.log('Creating Model Component Example')
    },
    teardown: (entity: Entity) => {
      console.log('Tearing down Model Component Example')
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
      const ui = createXRUI(ExampleSelectorUI, null, { interactable: true }, entity)
    }, [])

    useEffect(() => {
      const example = examples[examplesComponent.currExampleIndex.value]
      const entity = createEntity()
      example.setup(entity)

      return () => {
        if (example.teardown) example.teardown(entity)
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
