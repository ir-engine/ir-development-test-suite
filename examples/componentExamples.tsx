import { Entity, setComponent } from '@etherealengine/ecs'
import React, { useEffect } from 'react'
import { ExamplesComponent } from '../engine/examples/ExamplesComponent'
import { useRouteScene } from '../sceneRoute'

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

export default function () {
  const sceneEntity = useRouteScene()
  return sceneEntity.value ? <ComponentExamples sceneEntity={sceneEntity.value} /> : null
}
