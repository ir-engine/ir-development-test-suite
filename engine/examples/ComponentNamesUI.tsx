// @ts-ignore
import base from '@etherealengine/client/src/themes/base.css?inline'
// @ts-ignore
import styles from './ExampleSelectorUI.css?inline'

import ECS, { useComponent, useEntityContext } from '@etherealengine/ecs'
import { useHookstate } from '@etherealengine/hyperflux'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { ExamplesComponent } from './ExamplesComponent'

const ComponentNamesUI: React.FC = (props) => {
  const entity = useEntityContext()
  const names = useHookstate<string[]>([])
  const parent = useComponent(entity, EntityTreeComponent).parentEntity
  const examplesComponent = useComponent(parent.value, ExamplesComponent)

  useEffect(() => {
    const currExample = examplesComponent.currExample.value
    if (!currExample) return

    const components = ECS.getAllComponents(currExample)
    const componentNames = components
      .map((comp) => comp.name)
      .filter((name) => !['RenderOrder', 'ObjectLayer', 'Scene'].some((val) => name.includes(val)))
    names.set(componentNames)

    return () => {}
  }, [examplesComponent.currExample])

  return (
    <>
      <style type="text/css">{base.toString()}</style>
      <style type="text/css">{styles.toString()}</style>
      <div className="ComponentNamesContainer" style={{ height: '26em' }}>
        {names.value.map((name) => {
          return <div>{name}</div>
        })}
      </div>
    </>
  )
}
export default ComponentNamesUI
