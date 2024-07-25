import React from 'react'

import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { ActiveVisualScript } from '@etherealengine/ui/src/components/editor/panels/VisualScript/container'
import { VisualScriptComponent } from '@etherealengine/engine'
import { GraphJSON } from '@etherealengine/visual-script'
import AutoSizer from 'react-virtualized-auto-sizer'
import 'reactflow/dist/style.css'
import targetJson from '../assets/graph/simpleController.json'
import { Template } from './utils/template'

const entity = createEntity()
setComponent(entity, VisualScriptComponent, { visualScript: targetJson as unknown as GraphJSON })

export default function VisualScript() {
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
