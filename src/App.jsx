import { useState } from 'react'
import './App.css'
import { Viewer } from './components/Viewer'
import redSwab from './assets/redSwab.png'
import { useReducer } from 'react'


const makeMarker = ({ id, latitude, longitude }) => ({
  id,
  latitude,
  longitude,
  image: redSwab,
  height: 50,
  width: 50
})

export const initialMarkersData = [
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
  // makeMarker({ id: "marker-new", latitude: '10deg', longitude: '25deg' })
]

const markersReducer = (state, action) => {
  switch (action.type) {
    case 'saveMarkersInstance':
      if (state.instance) return state
      return ({ ...state, instance: action.payload })

    case 'appendMarker':
      console.log('appendMarker', action.payload.id)
      state.instance.addMarker(makeMarker({ id: Math.random(), latitude: '10deg', longitude: '25deg' }))
      return state 

    default:
      return state
  }
}

function App() {
  // const [markersData, setMarkersData] = useState(initialMarkersData)
  // const [store, dispatch] = useReducer(markersReducer, {})
  const [markersManager, setMarkersManager] = useState()
  console.log('markers manager', markersManager)
  return (
    <div className='App'>
      <div className='viewer-container'>
        <Viewer 
          markersData={initialMarkersData}
          markersManager={markersManager}
          setMarkersManager={setMarkersManager}
          // saveMarkersInstance={instance => dispatch({ type: 'saveMarkersInstance', payload: instance })} 
        />
      </div>

      <button
        onClick={() => {
          markersManager.addMarker(makeMarker({ id: Math.random().toString(), latitude: '10deg', longitude: '25deg' }))

          console.log(markersManager.markers)
          // dispatch({
          //   type: 'appendMarker',
          //   payload: makeMarker({ id: Math.random(), latitude: '10deg', longitude: '25deg' })
          // })
        }}
      >AddMarker</button>

    </div>
  )
}

export default App
