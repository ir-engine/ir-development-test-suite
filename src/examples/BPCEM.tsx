import React from 'react'

import { Template } from './utils/template'

export default function BPCEM() {
  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <Template projectName={'ir-engine/ir-development-test-suite'} sceneName={'bpcem-envmap-bake-test'} />
    </div>
  )
}
