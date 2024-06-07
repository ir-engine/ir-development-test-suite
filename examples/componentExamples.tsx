import { Entity, setComponent } from '@etherealengine/ecs'
import React, { useEffect } from 'react'
import { ExamplesComponent } from '../engine/examples/ExamplesComponent'

export const metadata = {
  title: 'Components Examples',
  description: 'Components examples'
}

const ComponentExamples = (props: { sceneEntity: Entity }) => {
  useEffect(() => {
    setComponent(props.sceneEntity, ExamplesComponent)
  }, [])

  return null
}

export default function (props: { sceneEntity: Entity }) {
  return <ComponentExamples sceneEntity={props.sceneEntity} />
}
