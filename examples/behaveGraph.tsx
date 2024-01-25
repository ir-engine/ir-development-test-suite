import React from 'react'

import { GraphJSON } from '@behave-graph/core'
import { ActiveBehaveGraph } from '@etherealengine/editor/src/components/graph/BehaveFlow'
import '@etherealengine/editor/src/components/graph/ee-flow/styles.css'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import AutoSizer from 'react-virtualized-auto-sizer'
import 'reactflow/dist/style.css'
import targetJson from '../assets/graph/simpleController.json'
import { Template } from './utils/template'

const entity = createEntity()
setComponent(entity, BehaveGraphComponent, { graph: targetJson as unknown as GraphJSON })

export default function behaveGraphTest() {

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
              <ActiveBehaveGraph entity={entity} />
            </div>
          )}
        </AutoSizer>
      </div>
    </>
  )
}
