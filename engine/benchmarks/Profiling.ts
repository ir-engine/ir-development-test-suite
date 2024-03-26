import { ECSState, PresentationSystemGroup, SystemDefinitions, SystemUUID, defineSystem } from '@etherealengine/ecs'
import {
  defineState,
  getMutableState,
  getState,
  syncStateWithLocalStorage,
  useMutableState
} from '@etherealengine/hyperflux'
import { PerformanceState } from '@etherealengine/spatial/src/renderer/PerformanceState'
import { useEffect } from 'react'

export type SystemProfileData = {
  avgDuration: number
  maxDuration: number
}
type GPUName = string
type EngineVersion = string
type ProfileData = Record<EngineVersion, Record<GPUName, Record<SystemUUID, SystemProfileData>>>

export const ProfileState = defineState({
  name: 'ProfileState',
  initial: () => ({
    systemProfilingData: { [global.__IR_ENGINE_VERSION__ as string]: {} } as ProfileData
  }),
  onCreate: (store, state) => {
    syncStateWithLocalStorage(ProfileState, ['systemProfilingData'])
  },
  GetProfileData: (systemUUID: SystemUUID): SystemProfileData => {
    const { gpu } = getState(PerformanceState)
    const systemProfilingData = getState(ProfileState).systemProfilingData
    return systemProfilingData[global.__IR_ENGINE_VERSION__][gpu][systemUUID]
  }
})

// TODO Figure out where to store this data
// const ProfilingService = {
//   fetchClientSettings: async (version: string, gpu: string, device: string) => {
//     try {
//       await waitForClientAuthenticated()
//       const profilingData = (await Engine.instance.api.service(profilingPath).find()) as Paginated<ProfilingType>
//     } catch (err) {
//       logger.error(err)
//     }
//   },
//   patchClientSetting: async (data: ProfilingPatch, version: string, gpu: string, device: string) => {
//     try {
//       await Engine.instance.api.service(profilingPath).patch(version, data)
//     } catch (err) {
//       logger.error(err)
//     }
//   }
// }

const updateFrequency = 2
let lastUpdate = 0

const execute = () => {
  const ecsState = getState(ECSState)

  if (ecsState.elapsedSeconds - lastUpdate < updateFrequency) return
  lastUpdate = ecsState.elapsedSeconds

  const engineVersion = global.__IR_ENGINE_VERSION__
  const profileData = getMutableState(ProfileState)
  const { gpu, device } = getState(PerformanceState)
  const systems = [...SystemDefinitions.values()]

  const engineVersionData = profileData.systemProfilingData[engineVersion]

  if (!engineVersionData[gpu].value) engineVersionData.merge({ [gpu]: {} })
  const systemDataMap = engineVersionData[gpu]

  for (const system of systems) {
    if (system.uuid == 'eepro.eetest.SystemProfilerSystem') continue
    const max = systemDataMap[system.uuid].value ? systemDataMap[system.uuid].maxDuration.value : 0
    systemDataMap.merge({
      [system.uuid]: {
        avgDuration: system.avgSystemDuration,
        maxDuration: Math.max(max, system.systemDuration)
      }
    })
  }
}

const reactor = () => {
  const performanceState = useMutableState(PerformanceState)

  useEffect(() => {
    const { gpu, device } = performanceState.value
    // if (gpu && device) {
    //   ProfilingService.fetchClientSettings(global.__IR_ENGINE_VERSION__, gpu, device)
    // }
  }, [performanceState.gpu, performanceState.device])

  return null
}

export default defineSystem({
  uuid: 'eepro.eetest.SystemProfilerSystem',
  execute,
  reactor,
  insert: { after: PresentationSystemGroup }
})
