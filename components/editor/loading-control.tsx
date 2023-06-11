import { Skeleton } from '@mui/material'

type Props = {
  loading: boolean
  control: JSX.Element | null
  width?: string | number
  height?: string | number
  variant?: 'circular' | 'rectangular' | 'text'
}

/**
 * 読み込みコンポーネント
 * MEMO: autocomplete1行→57, textfield1行→52
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const LoadingControl = ({
  loading,
  control,
  width = '100%',
  height = 52,
  variant = 'rectangular',
}: Props) => {
  if (loading)
    return (
      <Skeleton
        animation="wave"
        width={width}
        height={height}
        variant={variant}
      />
    )
  return control
}
