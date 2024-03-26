import { PresentationSystemGroup, defineComponent, defineQuery, defineSystem } from '@etherealengine/ecs'
import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/components/element/ElementList'
import { ComponentEditorsState } from '@etherealengine/editor/src/functions/ComponentEditors'
import { GrabbableComponent } from '@etherealengine/engine/src/interaction/components/GrabbableComponent'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
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

getMutableState(ComponentShelfCategoriesState).Interaction.merge([GrabbableComponent])
getMutableState(ComponentShelfCategoriesState).merge({
  Debug: [ProfilingComponent, BenchmarkComponent]
})

getMutableState(ComponentEditorsState).merge({
  [ProfilingComponent.name]: ProfilingComponentNodeEditor,
  [BenchmarkComponent.name]: BenchmarkComponentNodeEditor
})

const ProfilingComponentQuery = defineQuery([ProfilingComponent])
const BenchmarkComponentQuery = defineQuery([BenchmarkComponent])

const reactor = () => {
  const importedProfiling = useHookstate(false)
  const importedBenchmark = useHookstate(false)
  const sceneState = useMutableState(SceneState)

  useEffect(() => {
    if (!sceneState.sceneLoaded.value) return

    if (!importedProfiling.value) {
      const length = ProfilingComponentQuery().length

      if (length > 0) {
        import('./benchmarks/Profiling')
        importedProfiling.set(true)
      }
    }

    if (!importedBenchmark.value) {
      const length = BenchmarkComponentQuery().length

      if (length > 0) {
        import('./benchmarks/BenchmarkOrchestration')
        importedBenchmark.set(true)
      }
    }
  }, [sceneState.sceneLoaded])

  return null
}

export default defineSystem({
  uuid: 'eepro.eetest.RegisterSystem',
  reactor,
  insert: { after: PresentationSystemGroup }
})
