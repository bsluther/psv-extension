import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import { useRef } from 'react'
import { ReactPhotoSphereViewer, MarkersPlugin } from 'react-photo-sphere-viewer'
import redSwab from '../assets/redSwab.png'



// const markersPlugin = [
//   MarkersPlugin,
//   {
//     markers: markersData
//   }
// ]

export const Viewer = ({ markersData, saveMarkersInstance, markersManager, setMarkersManager }) => {
  // const viewerRef = useRef()
  const pSRef = useCallback(node => {
    const markersPlugin = node?.getPlugin(MarkersPlugin)
    setMarkersManager(markersPlugin)
  }, [])
  // const [markersManager, setMarkersManager] = useState()

  // console.log(viewerRef.current)
  // console.log(markersManager)

  useEffect(() => {
    if (markersManager) {
      console.log(markersManager)
      // console.log("IFING", viewerRef.current.getPlugin(MarkersPlugin))
      // setMarkersManager(viewerRef.current.getPlugin(MarkersPlugin))
      // saveMarkersInstance(viewerRef.current.getPlugin(MarkersPlugin))
    }
  }, [markersManager])

  return (
    <ReactPhotoSphereViewer 
      ref={pSRef} 
      src='./r1p4.jpg' 
      height='100%' 
      width='100%' 
      plugins={[
        [MarkersPlugin, { markers: markersData }]
      ]} 
    />
  )
}