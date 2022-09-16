import './PsvApp.css'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import 'photo-sphere-viewer/dist/plugins/markers.css'
import { Viewer } from 'photo-sphere-viewer'
import { MarkersPlugin } from 'photo-sphere-viewer/dist/plugins/markers'
import { useEffect, useState } from 'react'
import { useRef } from 'react'
import redSwab from './assets/redSwab.png'

let called = false
const callOnce = fn => {
  if (!called) {
    fn()
    called = true
  }
}

const initialMarkersData = [
  {
    id: 'marker-1',
    latitude: '40deg',
    longitude: '40deg',
    image: redSwab,
    height: 50,
    width: 50
  },
  {
    id: 'marker-2',
    latitude: '20deg',
    longitude: '35deg',
    image: redSwab,
    height: 50,
    width: 50
  },
  {
    id: 'marker-3',
    latitude: '0deg',
    longitude: '35deg',
    image: redSwab,
    height: 50,
    width: 50
  },
]

export const PsvApp = () => {
  const viewerContainerRef = useRef()
  const [psv, setPsv] = useState()
  const [markersInstance, setMarkersInstance] = useState()
  const markersPanelRef = useRef()

  useEffect(() => {
    if (viewerContainerRef.current && !psv) {
      callOnce(() => {
        const instance = new Viewer({
          container: viewerContainerRef.current,
          panorama: './r1p4.jpg',
          plugins: [
            [MarkersPlugin, {
              markers: initialMarkersData
            }]
          ]
        })
        
        setPsv(instance)
      })
    }
  }, [psv, viewerContainerRef])

  useEffect(() => {
    if (!!psv && !markersInstance) {
      setMarkersInstance(psv.getPlugin(MarkersPlugin))
    }
  }, [!!psv, !markersInstance])
  
  useEffect(() => {
    if (!!psv && !!markersInstance) {
      psv.panel.show({
        id: 'markers-panel',
        width: '40%',
        content: markersPanelRef.current.innerHTML
      })
    }
  }, [!!psv, !!markersInstance])
  console.log('markers instance', markersInstance)
  return (
    <div className='psv-app'>
      <div
        className='viewer-container'
        ref={viewerContainerRef}
      />

      <button
        onClick={() => {
          markersInstance.addMarker(makeMarker({ id: Math.random(), latitude: '20deg', longitude: '20deg' }))
        }}
      >add marker</button>

      <div style={{ visibility: 'hidden' }} ref={markersPanelRef}>
        {markersInstance && <MarkerPanel psv={psv} markersInstance={markersInstance} />}
      </div>
    </div>
  )
}

const makeMarker = ({ id, latitude, longitude }) => ({
  id,
  latitude,
  longitude,
  image: redSwab,
  height: 50,
  width: 50
})

const proxyHandler = {
  get(target, prop, receiver) {
    return "world"
  },
  addMarker: () => {
    console.log('PROXYING!')
  }
}

const MarkerPanel = ({ psv, markersInstance }) => {
  const [proxy, setProxy] = useState(() => new Proxy(markersInstance, proxyHandler))
  useEffect(() => {
    if (proxy) {
      console.log('psv', psv.plugins)
      console.log('proxy', proxy)
      psv.plugins.markers = proxy
      console.log(psv.plugins.markers.markers)
    }
  }, [psv])
  return (
    <div>Testing</div>
  )
}