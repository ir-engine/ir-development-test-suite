import { createEntity, removeEntity, setComponent } from '@etherealengine/ecs'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import React, { useEffect } from 'react'
import { ExamplesComponent } from '../engine/examples/ExamplesComponent'
import { Template } from './utils/template'

export const metadata = {
  title: 'Components Examples',
  description: 'Components examples'
}

const ComponentExamples = () => {
  useEffect(() => {
    const entity = createEntity()
    setComponent(entity, ExamplesComponent)

    return () => {
      removeEntity(entity)
    }
  }, [])

  return null
}

export default function () {
  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <DndWrapper id="dnd-container">
        <Template sceneName="Component Examples" />
        <ComponentExamples />
      </DndWrapper>
    </div>
  )
}
