import { Entity, setComponent } from '@etherealengine/ecs'
import React, { useEffect } from 'react'
import { ExamplesComponent } from '../engine/examples/ExamplesComponent'
import { useSceneSetup } from './utils/common/useSceneSetup'

export const metadata = {
  title: 'Components Examples',
  description: 'Components examples'
}

const ComponentExamples = (props: { scene: Entity }) => {
  useSceneSetup(props.scene)

  useEffect(() => {
    setComponent(props.scene, ExamplesComponent)
  }, [])

  return null
}

export default function (props: { scene: Entity }) {
  return <ComponentExamples scene={props.scene} />
}
