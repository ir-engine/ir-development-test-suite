import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/components/element/ElementList'
import { GrabbableComponent } from '@etherealengine/engine/src/interaction/components/GrabbableComponent'
import { getMutableState } from '@etherealengine/hyperflux'
import './benchmarks/BenchmarkOrchestration'
import './benchmarks/Profiling'

getMutableState(ComponentShelfCategoriesState).Interaction.merge([GrabbableComponent])
