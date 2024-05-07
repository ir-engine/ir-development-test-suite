// @ts-ignore
import styles from './ComponentNamesUI.css?inline'

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
      .filter(
        (name) => !['RenderOrder', 'ObjectLayer', 'Scene', 'Network', 'Resource'].some((val) => name.includes(val))
      )
    names.set(componentNames)

    return () => {}
  }, [examplesComponent.currExample])

  return (
    <>
      <style type="text/css">{styles.toString()}</style>
      <div className="ComponentsContainer">
        <div className="ComponentsHeaderContainer">
          <h1 className="ComponentsHeader">Components</h1>
        </div>
        <div className="ComponentNamesContainer">
          {names.value.map((name) => {
            return (
              <div className="ComponentNameContainer" key={name}>
                <p className="ComponentName">{name}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
export default ComponentNamesUI
