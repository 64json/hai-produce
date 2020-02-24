import React, { useEffect, useState } from 'react';
import MapContainer from './MapContainer';
import './Main.scss';
import { classes } from './common';
import logo from './images/logo.svg';

let timeout;
let sessionToken;
let autocompleteService;
let placesService;

function Main() {
  const [keyword, setKeyword] = useState('');
  const [autocomplete, setAutocomplete] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [placeId, setPlaceId] = useState(undefined);
  const [place, setPlace] = useState(undefined);

  useEffect(() => {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    if (!keyword || !autocomplete) {
      setPredictions([]);
      return;
    }
    timeout = window.setTimeout(() => {
      if (autocompleteService) {
        autocompleteService.getPlacePredictions({
          input: keyword,
          sessionToken,
        }, setPredictions);
      }
      timeout = undefined;
    }, 500);
  }, [keyword, autocomplete]);

  useEffect(() => {
    if (!placeId) {
      setPlace(undefined);
      return;
    }
    if (placesService) {
      placesService.getDetails({
        placeId,
        sessionToken,
      }, place => {
        setPlace(place);
        setAutocomplete(false);
        setKeyword(place.name);
        setPredictions([]);
      });
    }
  }, [placeId]);

  return (
    <div className={classes('Main', place && 'searching')}>
      <img className="logo" src={logo}/>
      <div className="searchContainer">
        <div className="search">
          <input type="text" className="keyword"
                 value={keyword} onChange={({ target: { value } }) => {
            setAutocomplete(true);
            setKeyword(value);
          }}/>
        </div>
        <div className="autocomplete">
          {
            predictions && predictions.map((prediction, i) => (
              <div className="place" key={i} onClick={() => {
                setPlaceId(prediction.place_id);
              }}>
                {prediction.description}
              </div>
            ))
          }
        </div>
      </div>
      <MapContainer className={classes('mapContainer')}
                    place={place}
                    onLoad={(google, map) => {
                      sessionToken = new google.maps.places.AutocompleteSessionToken();
                      autocompleteService = new google.maps.places.AutocompleteService();
                      placesService = new google.maps.places.PlacesService(map);
                    }}/>
    </div>
  );
}

export default Main;