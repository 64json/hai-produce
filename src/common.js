import * as React from 'react';

export {
  primaryColor, secondaryColor, darkestColor, darkerColor, darkColor, fontLightColor, fontDarkColor,
} from './variables.scss';

export const sq = x => x * x;
export const dist = (a, b) => {
  if (!a || !b) return NaN;
  return Math.sqrt(sq(a.lat - b.lat) + sq(a.lng - b.lng));
};
export const classes = (...vs) => vs.filter(v => v).join(' ');
export const googleApiKey = 'AIzaSyC2ywZb4hjv8wshgWl3Fv9F3K5_xAbfxvs';
export const FarmContext = React.createContext(null);

export function format(x, fixed=1) {
  return x.toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}