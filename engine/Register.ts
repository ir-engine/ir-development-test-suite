import { PresentationSystemGroup, SystemUUID, defineSystem, sortSystemsByAvgDuration } from '@etherealengine/ecs'
import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/components/element/ElementList'
import { GrabbableComponent } from '@etherealengine/engine/src/interaction/components/GrabbableComponent'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { PerformanceState } from '@etherealengine/spatial/src/renderer/PerformanceState'

type SystemProfileData = {
  avgDuration: number
  maxDuration: number
}
type GPUName = string
type EngineVersion = string
type ProfileData = Record<EngineVersion, Record<GPUName, Record<SystemUUID, SystemProfileData>>>

getMutableState(ComponentShelfCategoriesState).Interaction.merge([GrabbableComponent])

const profileData: ProfileData = { [global.__IR_ENGINE_VERSION__ as string]: {} }

const execute = () => {
  const engineVersion = global.__IR_ENGINE_VERSION__
  const { gpu } = getState(PerformanceState)
  const systems = sortSystemsByAvgDuration()

  const engineVersionData = profileData[engineVersion]

  if (!engineVersionData[gpu]) engineVersionData[gpu] = {}
  const systemDataMap = engineVersionData[gpu]

  for (const system of systems) {
    if (system.uuid == 'eepro.eetest.SystemProfilerSystem') continue
    systemDataMap[system.uuid] = {
      avgDuration: system.avgSystemDuration,
      maxDuration: Math.max(systemDataMap[system.uuid]?.maxDuration || 0, system.systemDuration)
    }
  }
}

export default defineSystem({
  uuid: 'eepro.eetest.SystemProfilerSystem',
  execute,
  insert: { after: PresentationSystemGroup }
})
