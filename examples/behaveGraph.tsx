import React from 'react'

import { getState } from '@etherealengine/hyperflux'
import { Template } from './utils/template'
import targetJson from '../assets/graph/3dpersoncontroller.json'
import { setComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { GraphJSON } from '@behave-graph/core'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { Flow } from '@etherealengine/editor/src/components/graph/ee-flow'
import '@etherealengine/editor/src/components/graph/ee-flow/styles.css'
import { BehaveGraphState } from '@etherealengine/engine/src/behave-graph/state/BehaveGraphState'
import AutoSizer from 'react-virtualized-auto-sizer'
import 'reactflow/dist/style.css'

import '@etherealengine/editor/src/components/graph/ee-flow/styles.css'

const entity = createEntity()
setComponent(entity, BehaveGraphComponent, { graph: targetJson as unknown as GraphJSON })

export default function behaveGraphTest() {
  const graphState = useComponent(entity, BehaveGraphComponent)

  return <>
    <Template />
    <div style={{ pointerEvents: 'all', position: 'absolute', marginRight: '0px', maxWidth: '500px', width: '500px', height: '100%' }}>
      <AutoSizer>
        {({ height }) => (
          <div style={{ maxWidth: '500px', width: '500px', height }}>
            <Flow
              initialGraph={graphState?.value?.graph ?? {}}
              examples={{}}
              registry={getState(BehaveGraphState).registry}
              onChangeGraph={(newGraph) => {
                if (!graphState?.graph) return
                graphState.graph.set(JSON.parse(JSON.stringify(newGraph)))
              }}
            />
          </div>
        )}
      </AutoSizer>
    </div>
  </>
}
