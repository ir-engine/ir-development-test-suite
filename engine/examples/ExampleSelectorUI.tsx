// @ts-ignore
import base from '@etherealengine/client/src/themes/base.css?inline'
// @ts-ignore
import styles from './ExampleSelectorUI.css?inline'

import { useComponent, useEntityContext } from '@etherealengine/ecs'
import React from 'react'
import { ExamplesComponent, examples } from './ExamplesComponent'

const ExampleSelectorUI: React.FC = () => {
  const entity = useEntityContext()
  const examplesComponent = useComponent(entity, ExamplesComponent)
  const selectedIndex = examplesComponent.currExampleIndex.value

  return (
    <>
      <style type="text/css">{base.toString()}</style>
      <style type="text/css">{styles.toString()}</style>
      <div className="ExamplesContainer" style={{ height: `${examples.length * 26.4}em` }}>
        {examples.map((example, index) => {
          return (
            <div
              className={index === selectedIndex ? 'SelectedExampleContainer' : 'ExampleContainer'}
              key={example.name}
              onPointerDown={() => {
                examplesComponent.currExampleIndex.set(index)
              }}
            >
              <div className="ExampleTextContainer">
                <h2 className="ExampleName">{example.name}</h2>
                <p className="ExampleDescription">{example.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
export default ExampleSelectorUI
