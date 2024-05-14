import { avatarPath } from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { useEffect } from 'react'

export const useAvatars = () => {
  const avatars = useHookstate<string[]>([])
  const avatarQuery = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  useEffect(() => {
    if (!avatarQuery.data.length || avatarQuery.status != 'success') return

    avatars.set(
      avatarQuery.data.map((item) => {
        return item.modelResource!.url
      })
    )
  }, [avatarQuery.status])

  return avatars
}
