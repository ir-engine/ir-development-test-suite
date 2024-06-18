import { PresentationSystemGroup, defineComponent, defineSystem, useQuery } from '@etherealengine/ecs'
import { ComponentEditorsState } from '@etherealengine/editor/src/services/ComponentEditors'
import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/services/ComponentShelfCategoriesState'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { BenchmarkComponentNodeEditor, ProfilingComponentNodeEditor } from './benchmarks/BenchmarkNodeEditors'

export const ProfilingComponent = defineComponent({
  name: 'eepro.eetest.ProfilingComponent',
  jsonID: 'eepro.eetest.ProfilingComponent'
})

export const BenchmarkComponent = defineComponent({
  name: 'eepro.eetest.BenchmarkComponent',
  jsonID: 'eepro.eetest.BenchmarkComponent'
})

getMutableState(ComponentShelfCategoriesState).merge({
  Debug: [ProfilingComponent, BenchmarkComponent]
})

getMutableState(ComponentEditorsState).merge({
  [ProfilingComponent.name]: ProfilingComponentNodeEditor,
  [BenchmarkComponent.name]: BenchmarkComponentNodeEditor
})

const reactor = () => {
  const profilingComponentQuery = useQuery([ProfilingComponent])
  const benchmarkComponentQuery = useQuery([BenchmarkComponent])
  const importedProfiling = useHookstate(false)
  const importedBenchmark = useHookstate(false)

  useEffect(() => {
    if (!importedProfiling.value) {
      const length = profilingComponentQuery.length

      if (length > 0) {
        import('./benchmarks/Profiling')
        importedProfiling.set(true)
      }
    }

    if (!importedBenchmark.value) {
      const length = benchmarkComponentQuery.length

      if (length > 0) {
        import('./benchmarks/Benchmark')
        importedBenchmark.set(true)
      }
    }
  }, [profilingComponentQuery, benchmarkComponentQuery])

  return null
}

export default defineSystem({
  uuid: 'eepro.eetest.RegisterSystem',
  reactor,
  insert: { after: PresentationSystemGroup }
})
