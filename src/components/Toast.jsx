import { useStore } from '../context/StoreContext.jsx'
import { SparkIcon } from './Icons.jsx'

export default function Toast() {
  const { toastMsg } = useStore()
  return (
    <div className={`toast ${toastMsg ? 'show' : ''}`}>
      <SparkIcon />
      <span>{toastMsg}</span>
    </div>
  )
}
