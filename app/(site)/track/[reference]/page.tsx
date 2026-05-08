import { TrackClient } from './TrackClient'

export default function TrackPage({ params }: { params: { reference: string } }) {
  return <TrackClient reference={params.reference} />
}
