import { useComponent, useEntityContext } from '@etherealengine/ecs'
import React from 'react'
import { ExamplesComponent } from './ExamplesComponent'

const ExampleSelectorUI: React.FC = () => {
  const entity = useEntityContext()
  const examples = useComponent(entity, ExamplesComponent)
  const selectedIndex = examples.currExampleIndex.value

  return (
    <>
      <div>
        <div>
          <h2 style={{ color: 'white' }}>Test Header</h2>
          <p>Test Body</p>
        </div>
      </div>
    </>
  )
}
export default ExampleSelectorUI
