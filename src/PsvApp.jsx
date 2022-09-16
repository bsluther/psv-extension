import './PsvApp.css'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import 'photo-sphere-viewer/dist/plugins/markers.css'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { Viewer } from 'photo-sphere-viewer'
import { MarkersPlugin } from 'photo-sphere-viewer/dist/plugins/markers'
import { useEffect, useState } from 'react'
import { useRef } from 'react'
import redSwab from './assets/redSwab.png'
import { lensPath, map, over, prop, values } from 'ramda'
import { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { pencilAlt } from './svg/pencilAlt'

let called = false
const callOnce = fn => {
  if (!called) {
    fn()
    called = true
  }
}



const initialMarkersData = [
  {
    id: 'ae64ecba-51fc-4ee1-8305-7ff426b84a46',
    latitude: '40deg',
    longitude: '40deg',
    image: redSwab,
    height: 50,
    width: 50,
    data: {
      dataEntryComplete: true,
      label: 'Test Site 1',
      description: 'This is the first test site.'
    }
  },
  {
    id: '95570ac9-fd46-4173-b4b7-e682a4428d6a',
    latitude: '20deg',
    longitude: '35deg',
    image: redSwab,
    height: 50,
    width: 50,
    data: {
      dataEntryComplete: true,
      label: 'Smallpox finding',
      description: 'This is the first test site where we found smallpox'
    }
  },
  {
    id: '699914d4-fdd4-4e26-be4a-a8357f3f06c0',
    latitude: '0deg',
    longitude: '35deg',
    image: redSwab,
    height: 50,
    width: 50,
    data: {
      dataEntryComplete: false,
      label: 'Gross',
      description: 'Really not sure what that is...'
    }
  },
]

const makeMarker = ({ latitude, longitude }) => ({ 
  id: uuid(),
  latitude,
  longitude,
  image: redSwab,
  height: 50,
  width: 50,
  data: {
    dataEntryComplete: false
  }
})



export const PsvApp = () => {
  const viewerContainerRef = useRef()
  const [psv, setPsv] = useState()
  const [markersInstance, setMarkersInstance] = useState()
  const [markersState, setMarkersState] = useState({})
  const [panelOpen, setPanelOpen] = useState(false)
  const [markerFocus, setMarkerFocus] = useState()
  console.log('markersState', markersState)
  useEffect(() => {
    if (viewerContainerRef.current && !psv) {
      callOnce(() => {
        const psvInstance = new Viewer({
          container: viewerContainerRef.current,
          panorama: './r1p4.jpg',
          plugins: [
            [MarkersPlugin, {
              markers: initialMarkersData
            }]
          ],
          navbar: [
            'autorotate',
            'zoom',
            'move',
            {
              id: 'custom-markers-panel',
              content: pencilAlt,
              title: 'Custom Markers Panels',
              className: 'w-5 h-5',
              onClick: viewer => {
                setPanelOpen(prev => !prev)
              }
            },
            'fullscreen'
          ]
        })

        const markersPlugin = psvInstance.getPlugin(MarkersPlugin)
        setMarkersInstance(markersPlugin)
        const markersProxy = new Proxy(markersPlugin.markers, {
          set: (prev, key, value ) => {
            setMarkersState(Object.assign({}, prev, { [key]: value }))
            return Object.assign(prev, { [key]: value })
          }
        })
        markersPlugin.markers = markersProxy

        markersPlugin.on('select-marker', (event, data, click) => {
          setMarkerFocus(data.id)
        })

        markersPlugin.on('unselect-marker', (event, data, click) => {
          console.log('unselected')
        })

        psvInstance.on('click', (event, data) => {
          markersPlugin.addMarker(makeMarker({ latitude: data.latitude, longitude: data.longitude }))
        })

        setPsv(psvInstance)
      })
    }
  }, [psv, viewerContainerRef])


  
  useEffect(() => {
    if (!!psv && !!markersInstance) {
      if (panelOpen) {
        psv.panel.show({ 
          id: 'markers-panel',
          width: '40%',
          content: "<div id='panel-content-root'>content</div>"
        })
        const panelContentRoot = document.getElementById('panel-content-root')
        createRoot(panelContentRoot).render(
          <MarkerPanel psv={psv} markersState={markersState} markersInstance={markersInstance} />
        )
      } else {
        psv.panel.hide('markers-panel')
      }
    }
  }, [!!psv, !!markersInstance, markersState, panelOpen]) 


  const handleUpdateData = useCallback(key => updater => markerId => {
    const newMarkersState = over(lensPath([markerId, 'config', 'data', key]))
                                (updater)
                                (markersState)

    const newMarkersConfigs = map(prop('config'))
                                 (values(newMarkersState))

    markersInstance.setMarkers(newMarkersConfigs)
  }, [markersInstance, markersState])

  const handleDeleteMarker = useCallback(markerId => {
    markersInstance.removeMarker(markerId)
  }, [markersInstance])
 
  return (
    <div className='w-screen h-screen'>
      <div
        className='w-full h-full'
        ref={viewerContainerRef}
      />
 

      {markerFocus &&
        <MarkerFocus 
          id={markerFocus} 
          markersState={markersState} 
          handleUpdateData={handleUpdateData} 
          setMarkerFocus={setMarkerFocus} 
          handleDeleteMarker={handleDeleteMarker}
        />
      }
    </div>
  )
}
 

const MarkerPanel = ({ psv, markersInstance, markersState = {} }) => {
  
  const markers = Object.values(markersState)


  const handleToggleEntryComplete = useCallback(marker => {
    const newMarkersState = over(lensPath([marker.id, 'config', 'data', 'dataEntryComplete']))
                                (prev => !prev)
                                (markersState)

    const newMarkersConfigs = map(prop('config'))
                                 (values(newMarkersState))

    markersInstance.setMarkers(newMarkersConfigs)
  }
  , [markersInstance, markersState])

  const gotoMarker = (id, speed) => markersInstance.gotoMarker(id, speed)

  return ( 
    <div className='w-full space-y-4'>
      {map(mrkr => 
            <MarkerItem 
              key={mrkr.id} 
              marker={mrkr} 
              handleToggleEntryComplete={handleToggleEntryComplete} 
              markersState={markersState}
              gotoMarker={gotoMarker}
            />)
          (values(markers))}
    </div>
  )
}

const MarkerItem = ({ marker, handleToggleEntryComplete, gotoMarker }) => {
  if (!marker) return null
  return (
    <div className='w-full flex flex-col space-x-2 even:bg-blend-darken'>
      <span 
        onClick={() => gotoMarker(marker.id, 500)}
      >
        {marker.data.label?.length > 0 ? marker.data.label : `ID: ${marker.id.slice(0,6)}...`}
      </span>
      <div className='space-x-2'>
        <input type='checkbox' checked={marker.data.dataEntryComplete} onChange={() => handleToggleEntryComplete(marker)} />
        <span>Data Entry Complete</span>
      </div>
      {/* <div className='space-x-2'>
        <span>Description:</span>
        <span>{marker.description}</span>
      </div> */}
    </div>
  )
}




const MarkerFocus = ({ id, markersState, handleUpdateData, setMarkerFocus, handleDeleteMarker }) => {
  const markerEl = document.getElementById(`psv-marker-${id}`)

  const label = markersState[id]?.data.label ?? ""
  // const description = markersState[id].data.description ?? ""

  if (!markerEl) {
    return null
  }
  return createPortal((
    <div
      className='absolute top-1/2 right-full -translate-x-2 -translate-y-1/2 bg-blue-800 rounded-md flex flex-col p-2 space-y-2 z-50'
    >
      <div className='flex w-max items-center space-x-2'>
        <span className='text-white font-bold'>
          Label
        </span>
        <input 
          autoFocus 
          value={label} 
          className='bg-blue-300 rounded-md outline-none w-max p-1'
          onChange={e => handleUpdateData('label')(() => e.target.value)(id)} 
        />
      </div>

      {/* <div className='flex items-center space-x-2'>
        <span className='text-white font-bold'>
          Description
        </span>
        <textarea 
          value={description} 
          className='bg-blue-300 rounded-md outline-none h-20 p-1'
          onChange={e => handleUpdateData('description')(() => e.target.value)(id)} 
        />
      </div> */}

      <div className='w-full justify-center space-x-2 flex'>

        <button
          className='bg-white text-red-600 font-bold uppercase w-max py-1 px-2 rounded-md'
          onClick={() => handleDeleteMarker(id)}
        >delete</button>
        <span className='grow' />
        <button
          className='bg-white font-bold uppercase w-max py-1 px-2 rounded-md'
          onClick={() => setMarkerFocus(null)}
        >done</button>

      </div>

      
    </div>
  )
  , markerEl)
}