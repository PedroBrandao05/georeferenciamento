import * as S from './styled'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import { fromLonLat } from 'ol/proj';
import { useEffect, useRef, useState } from 'react'
import { IClient } from '../../interfaces/client'
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { createPointWithColor } from './createCircle'
import { getColorByCondition } from '../../gateways/getColorByCondition'
import { MapBrowserEvent } from 'ol'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { clientOnModal, modalIsActive } from '../../state/modal'

interface IMapWithPins {
  filteredClients: IClient[]
} 

export default function MapTest(props: IMapWithPins) {
  
  const mapRef = useRef<HTMLDivElement>(null);
  const setClientOn = useSetRecoilState(clientOnModal)
  const setModal = useSetRecoilState(modalIsActive)


  useEffect(() => {

    const features : Feature[] = []

    for (let i = 0; i < props.filteredClients.length; i ++){
      let center : [number, number] = [props.filteredClients[i].geolocation.lon, props.filteredClients[i].geolocation.lat]
      props.filteredClients[i].condition.forEach(condition => { 
        features.push(
        createPointWithColor(
        center,
        12,
        getColorByCondition(condition.name),
        props.filteredClients[i]
      ))
      })
    } 

    const vectorSource = new VectorSource({
      features: [...features],
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,   
    });



    const map = new Map({
      target: mapRef.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 4,
      }),
    });

    map.addEventListener('click', (evt: MapBrowserEvent<any>) => {

     if (evt.map.hasFeatureAtPixel(evt.pixel)){
      const [feature] = evt.map.getFeaturesAtPixel(evt.pixel)
      const client = feature.get('client')
      setClientOn(client)
      setModal(true)      
     } else {
      setModal(false)
     }
    })

    return () => { 
      
      map.setTarget(null)
    }
  }, props.filteredClients);
  

  return <S.MapContainer ref={mapRef} />
 
}