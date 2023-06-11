import dynamic from 'next/dynamic'

const RecoilExp = dynamic(
  async () => (await import('../../components/recoil-exp')).RecoilExp,
  { ssr: false }
)

export default () => {
  return (
    <div>
      <p>recoil</p>
      <RecoilExp />
    </div>
  )
}
