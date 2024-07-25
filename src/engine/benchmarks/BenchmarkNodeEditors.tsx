import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import NodeEditor from '@etherealengine/ui/src/components/editor/properties/nodeEditor'
import React from 'react'

export const ProfilingComponentNodeEditor: EditorComponentType = (props) => {
  return <NodeEditor {...props} name="Profiling Component" description="Tagged component to turn on system profiling" />
}

export const BenchmarkComponentNodeEditor: EditorComponentType = (props) => {
  return <NodeEditor {...props} name="Benchmark Component" description="Tagged component to turn on benchmarking" />
}
