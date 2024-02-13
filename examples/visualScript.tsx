import React from 'react'

import { GraphJSON } from '@behave-graph/core'
import { ActiveVisualScript } from '@etherealengine/editor/src/components/visualScript/VisualFlow'
import '@etherealengine/editor/src/components/graph/ee-flow/styles.css'
import { VisualScriptComponent } from '@etherealengine/engine/src/visual-script/components/VisualScriptComponent'
import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import AutoSizer from 'react-virtualized-auto-sizer'
import 'reactflow/dist/style.css'
import targetJson from '../assets/graph/simpleController.json'
import { Template } from './utils/template'

const entity = createEntity()
setComponent(entity, VisualScriptComponent, { visualScript: targetJson as unknown as GraphJSON })

export default function VisualScriptTest() {

  return (
    <>
      <Template />
      <div
        style={{
          pointerEvents: 'all',
          position: 'absolute',
          marginRight: '0px',
          maxWidth: '500px',
          width: '500px',
          height: '100%'
        }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <div style={{ width, height }}>
              <ActiveVisualScript entity={entity} />
            </div>
          )}
        </AutoSizer>
      </div>
    </>
  )
}
