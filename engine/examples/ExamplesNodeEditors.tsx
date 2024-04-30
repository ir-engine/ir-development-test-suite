import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import React from 'react'

export const ExamplesComponentNodeEditor: EditorComponentType = (props) => {
  return <NodeEditor {...props} name="Examples" description="Examples to switch between" />
}
