import { ECSState, PresentationSystemGroup, SystemDefinitions, SystemUUID, defineSystem } from '@etherealengine/ecs'
import { defineState, getMutableState, getState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'
import { PerformanceState } from '@etherealengine/spatial/src/renderer/PerformanceState'

export type SystemProfileData = {
  avgDuration: number
  maxDuration: number
}
type GPUName = string
type EngineVersion = string
type ProfileData = Record<EngineVersion, Record<GPUName, Record<SystemUUID, SystemProfileData>>>

// TODO Figure out where to store this data
export const ProfileState = defineState({
  name: 'ProfileState',
  initial: () => ({
    systemProfilingData: { [global.__IR_ENGINE_VERSION__ as string]: {} } as ProfileData
  }),
  extension: syncStateWithLocalStorage(['systemProfilingData']),
  GetProfileData: (systemUUID: SystemUUID): SystemProfileData => {
    const { gpu } = getState(PerformanceState)
    const systemProfilingData = getState(ProfileState).systemProfilingData
    return systemProfilingData[global.__IR_ENGINE_VERSION__][gpu][systemUUID]
  },
  GetProfileIdentifier: (): string => {
    const { gpu } = getState(PerformanceState)
    return `EngineVersion-${global.__IR_ENGINE_VERSION__}-GPU-${gpu}`
  }
})

const updateFrequency = 2
let lastUpdate = 0

const execute = () => {
  const ecsState = getState(ECSState)

  if (ecsState.elapsedSeconds - lastUpdate < updateFrequency) return
  lastUpdate = ecsState.elapsedSeconds

  const engineVersion = global.__IR_ENGINE_VERSION__
  const profileData = getMutableState(ProfileState)
  const { gpu, device } = getState(PerformanceState)
  const systems = SystemDefinitions.values()

  const engineVersionData = profileData.systemProfilingData[engineVersion]

  if (!engineVersionData[gpu].value) engineVersionData.merge({ [gpu]: {} })
  const systemDataMap = engineVersionData[gpu]

  const data = {}
  for (const system of systems) {
    if (system.uuid === SystemProfilerSystem) continue
    const max = systemDataMap[system.uuid].value ? systemDataMap[system.uuid].maxDuration.value : 0
    data[system.uuid] = {
      avgDuration: system.avgSystemDuration,
      maxDuration: Math.max(max, system.systemDuration)
    }
  }
  systemDataMap.merge(data)
}

export const SystemProfilerSystem = defineSystem({
  uuid: 'eepro.eetest.SystemProfilerSystem',
  execute,
  insert: { after: PresentationSystemGroup }
})
