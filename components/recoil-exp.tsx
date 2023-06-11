import { useEffect } from 'react'
import {
  atom,
  selector,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil'

const atom1 = atom({
  key: 'atom1',
  default: 0,
})

const selector1 = selector({
  key: 'selector1',
  get: ({ get }) => {
    return get(atom1) + 1
  },
})

export const RecoilExp = () => {
  const [state1, setState1] = useRecoilState(atom1)
  const state2 = useRecoilValue(selector1)
  console.log({ state1, state2 })
  useEffect(() => {
    console.log('useEffect')
    setState1(0)
  }, [])

  const handleClick = useRecoilCallback(({ snapshot, set }) => async () => {
    console.log({
      loadable: snapshot.getLoadable(atom1),
    })
    const value = await snapshot.getPromise(atom1)
    console.log({ value })
    set(atom1, value + 1)
    console.log({
      loadable: snapshot.getLoadable(atom1),
    })
    console.log({
      value: await snapshot.getPromise(atom1),
    })
  })

  return (
    <div>
      <p>{state1}</p>
      <button onClick={handleClick}>button</button>
    </div>
  )
}
