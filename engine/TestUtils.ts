import { avatarPath } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs'
import { useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'

export const useAvatars = () => {
  const avatars = useHookstate([] as string[])
  useEffect(() => {
    let loading = true
    Engine.instance.api
      .service(avatarPath)
      .find({})
      .then((val) => {
        const avatarSrcs = val.data.map((item) => {
          return item.modelResource!.url
        })
        if (loading) avatars.set(avatarSrcs)
      })

    return () => {
      loading = false
    }
  }, [])

  return avatars
}
