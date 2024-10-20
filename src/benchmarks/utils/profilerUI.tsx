import { ECSState, filterAndSortSystemsByAvgDuration, System, SystemUUID } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import React, { useEffect, useState } from 'react'
import { ProfileState, SystemProfileData, SystemProfilerSystem } from '../../engine/benchmarks/Profiling'

import('../../engine/benchmarks/Profiling')

export default function ProfilerUI(props: { systemUUIDs: SystemUUID[] }) {
  const { systemUUIDs } = props
  const [frameTime, SetFrameTime] = useState(0)
  const [systemProfileData, SetSystemProfileData] = useState([] as ({ uuid: SystemUUID } & SystemProfileData)[])
  const [sortedSystemProfileData, SetSortedSystemProfileData] = useState([] as System[])

  useEffect(() => {
    const id = setInterval(() => {
      const ecsState = getState(ECSState)
      SetFrameTime(Math.trunc(ecsState.deltaSeconds * 1000))

      SetSortedSystemProfileData(
        filterAndSortSystemsByAvgDuration(0.2)
          .filter((system) => system.uuid !== SystemProfilerSystem)
          .slice(0, 6)
      )
      SetSystemProfileData(
        systemUUIDs.map((uuid) => {
          return {
            uuid: uuid,
            ...ProfileState.GetProfileData(uuid)
          }
        })
      )
    }, 500)

    return () => {
      clearInterval(id)
    }
  }, [])

  return (
    <div className="ProfilerUI" style={{ position: 'absolute', right: 12, top: 12, textAlign: 'right' }}>
      <div>{`Frame Time: ${frameTime}ms`}</div>
      <div style={{ paddingTop: '18px' }}>
        {'Benchmarked Systems: '}
        {systemProfileData.map((profileData) => {
          return (
            <React.Fragment key={profileData.uuid}>
              <div>{`System: ${profileData.uuid}`}</div>
              <div>{`avg: ${Math.trunc(profileData.avgDuration * 1000) / 1000}ms \n max: ${
                Math.trunc(profileData.maxDuration * 1000) / 1000
              }ms`}</div>
            </React.Fragment>
          )
        })}
      </div>
      <div style={{ paddingTop: '18px' }}>
        {'Longest Running Systems: '}
        {sortedSystemProfileData.map((system) => {
          return (
            <React.Fragment key={system.uuid}>
              <div>{`System: ${system.uuid}`}</div>
              <div>{`avg: ${Math.trunc(system.avgSystemDuration * 1000) / 1000}ms`}</div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
