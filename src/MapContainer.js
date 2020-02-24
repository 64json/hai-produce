import React, { useContext, useEffect, useState } from 'react';
import { GoogleApiWrapper, Map, Polygon, Polyline } from 'google-maps-react';
import { classes, dist, FarmContext, googleApiKey, primaryColor } from './common';
import './MapContainer.scss';
import { BounceLoader } from 'react-spinners';

const polygonProps = {
  strokeColor: primaryColor,
  strokeOpacity: 1,
  strokeWeight: 5,
  fillColor: primaryColor,
  fillOpacity: 0.25,
};

function MapContainer({ className, google, place, onLoad, preview }) {
  let [polygon, setPolygon] = useState([]);
  let [pos, setPos] = useState(null);
  let [closed, setClosed] = useState(false);
  const [zoom, setZoom] = useState(16);
  const [center, setCenter] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [farm, setFarm] = useContext(FarmContext);

  if (preview) {
    place = undefined;
    polygon = preview;
    pos = null;
    closed = true;
    // zoom = ?
    // center = ?
  }

  useEffect(() => {
    if (!place) {
      return;
    }
    const { location } = place.geometry;
    const lat = location.lat();
    const lng = location.lng();
    setCenter({ lat, lng });
  }, [place]);

  useEffect(() => {
    if (!preview && closed) {
      const area = google.maps.geometry.spherical.computeArea(polygon.map(({ lat, lng }) => ({
        lat: () => lat,
        lng: () => lng,
      }))); // in m^2
      const state_component = place.address_components.find(c => c.types.includes('administrative_area_level_1'));
      const state = state_component && state_component.short_name;

      setLoading(true);
      fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          polygon,
          area,
          state,
        }),
      }).then(res => res.json())
        .then(({ weeds, crops, climates, legal }) => {
          setFarm({
            area,
            polygon,
            place,
            weeds,
            crops,
            climates,
            legal,
          });
        })
        .catch(() => {
          setFarm(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [preview, google, setFarm, closed, polygon, place]);

  const closing = dist(pos, polygon[0]) < 10 / Math.pow(2, zoom);

  return (
    <div className={classes('MapContainer', className)} onKeyDown={e => {
      if (e.keyCode === 27) {
        setPolygon([]);
        setClosed(false);
      }
    }}>
      <Map google={google} zoom={zoom} mapType="satellite"
           zoomControl={false} streetViewControl={false} fullscreenControl={false} mapTypeControl={false}
           onReady={((mapProps, map) => {
             const { google } = mapProps;
             if (preview) {
               const bounds = new google.maps.LatLngBounds();
               polygon.forEach(path => bounds.extend(path));
               map.fitBounds(bounds);
             } else {
               onLoad(google, map);
             }
           })}
           onZoom_changed={(_, { zoom }) => setZoom(zoom)}
           center={center}
           onMousemove={closed ? undefined : ((_, __, { latLng }) => {
             const lat = latLng.lat();
             const lng = latLng.lng();
             setPos({ lat, lng });
           })}
           onClick={closed ? undefined : (() => {
             if (pos === null) return;
             if (closing) {
               setClosed(true);
             } else {
               setPolygon([...polygon, pos]);
             }
           })}>
        {
          closed || closing ?
            <Polygon
              paths={polygon}
              {...polygonProps}
              clickable={closed}/> :
            <Polyline
              path={[...polygon, pos].filter(v => v)}
              {...polygonProps}
              clickable={false}/>
        }
      </Map>
      {
        loading &&
        <BounceLoader
          size={60}
          css={{
            position: 'absolute',
            top: `calc(50vh - 30px)`,
            left: `calc(50vw - 30px)`,
          }}
          color={primaryColor}/>
      }
    </div>
  );
}

export default GoogleApiWrapper(props => ({
  ...props,
  apiKey: googleApiKey,
}))(MapContainer);