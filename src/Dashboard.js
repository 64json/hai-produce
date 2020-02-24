import React, { useContext, useState } from 'react';
import './Dashboard.scss';
import {
  classes,
  darkColor,
  FarmContext,
  fontDarkColor,
  fontLightColor,
  format,
  primaryColor,
  secondaryColor,
} from './common';
import logo from './images/logo.svg';
import Card from './Card';
import CardContainer from './CardContainer';
import iconProfile from './images/profile.png';
import iconMoney from './images/money-btn.png';
import iconReport from './images/report.png';
import iconSearch from './images/search.png';
import iconSettings from './images/setting.png';
import iconFullscreen from './images/fullscreen.png';
import MapContainer from './MapContainer';
import Row from './Row';
import {
  ContourSeries,
  DiscreteColorLegend,
  HorizontalGridLines,
  PolygonSeries,
  RadialChart,
  VerticalBarSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis';

function Dashboard() {
  const [farm, setFarm] = useContext(FarmContext);
  const { area, polygon = [], place, weeds, crops, climates, legal } = farm || {};
  const [cropVisSize, setCropVisSize] = useState({ width: 0, height: 0 });
  const [weedVisSize, setWeedVisSize] = useState({ width: 0, height: 0 });
  const [mapVisSize, setMapVisSize] = useState({ width: 100, height: 100 });

  // console.log(farm);
  // console.log(JSON.stringify(farm));

  const center = polygon.reduce((acc, pos) => ({
    lat: acc.lat + pos.lat / polygon.length,
    lng: acc.lng + pos.lng / polygon.length,
  }), { lat: 0, lng: 0 });

  return (
    <div className="Dashboard">
      <div className="sidebar">
        <img className="logo" src={logo}/>
        <img src={iconProfile}/>
        <img src={iconSearch} onClick={() => setFarm(undefined)}/>
        <div className="indicator">
          <img src={iconMoney}/>
        </div>
        <img src={iconFullscreen} onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        }}/>
        <img src={iconReport}/>
        <img className="settings" src={iconSettings}/>
      </div>
      <div className="content">
        {
          farm &&
          <div className="header">
            <span>HAI - {place.name}</span>
          </div>
        }
        <div className={classes('body', !farm && 'notFound')}>
          {
            farm &&
            <CardContainer row>
              <CardContainer column>
                <CardContainer row ratio={2}>
                  <Card title="Geographic Info" ratio={3}>
                    <Row label="Address">
                      {place.formatted_address}
                    </Row>
                    <Row label="Area">
                      {area.toFixed(1)} m<sup>2</sup>
                    </Row>
                    <Row label="Temp.">
                      {(climates.reduce((acc, { temp }) => acc + temp, 0) / 4).toFixed(1)} °F
                    </Row>
                    <Row label="Precip.">
                      {(climates.reduce((acc, { precip }) => acc + precip, 0) / 4).toFixed(1)} inch/month
                    </Row>
                  </Card>
                  <Card title="Legal Info" ratio={2}>
                    {legal}
                  </Card>
                </CardContainer>
                <Card className="mapCard" ratio={3} onResize={setMapVisSize} defaultTab={1}
                      visualization={(
                        <XYPlot
                          {...mapVisSize}
                          style={{
                            opacity: .75,
                          }}>
                          <PolygonSeries
                            className="polygon-series-example"
                            style={{
                              opacity: 0.5,
                              fill: fontLightColor,
                            }}
                            data={polygon.map(({ lat, lng }) => ({
                              y: lat,
                              x: lng,
                            }))}/>
                          <ContourSeries
                            animation
                            className="contour-series-example"
                            style={{
                              stroke: darkColor,
                              strokeLinejoin: 'round',
                              opacity: .5,
                            }}
                            colorRange={[secondaryColor, primaryColor]}
                            data={polygon.map(({ lat, lng }) => ({
                              y: (lat + center.lat) / 2,
                              x: (lng + center.lng) / 2,
                            }))}
                          />
                        </XYPlot>
                      )}>
                  <MapContainer preview={polygon}/>
                </Card>
              </CardContainer>
              <CardContainer column>
                <Card title="Suggested Crops" onResize={setCropVisSize}
                      visualization={(
                        <XYPlot
                          margin={{
                            left: 80,
                            right: 80,
                            top: 0,
                            bottom: 40,
                          }}
                          style={{
                            opacity: .75,
                          }}
                          xType="ordinal"
                          {...cropVisSize}>
                          <DiscreteColorLegend
                            style={{ position: 'absolute', right: '0', top: '0px' }}
                            orientation="horizontal"
                            items={[
                              {
                                title: 'Revenue',
                                color: secondaryColor,
                              },
                              {
                                title: 'Cost',
                                color: primaryColor,
                              },
                            ]}
                          />
                          <VerticalGridLines/>
                          <HorizontalGridLines/>
                          <XAxis style={{
                            text: {
                              fill: fontDarkColor,
                            },
                          }}/>
                          <YAxis style={{
                            text: {
                              fill: fontDarkColor,
                            },
                          }}
                                 width={80}
                                 tickFormat={v => `$${format(v / 1e6, 0)}M`}/>
                          <VerticalBarSeries
                            cluster="_"
                            animation
                            color={secondaryColor}
                            data={crops.map((crop, quarter) => ({
                              x: `Q${quarter + 1}`,
                              y: crop.revenue,
                            }))}/>
                          <VerticalBarSeries
                            cluster="_"
                            animation
                            color={primaryColor}
                            data={crops.map((crop, quarter) => ({
                              x: `Q${quarter + 1}`,
                              y: crop.cost,
                            }))}/>
                        </XYPlot>
                      )}>
                  <table>
                    <thead>
                    <tr>
                      <th>Quarter</th>
                      <th>Crop</th>
                      <th>Yield (lbs)</th>
                      <th>Cost</th>
                      <th>Revenue</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      crops.map((crop, quarter) => (
                        <tr key={quarter}>
                          <td>Q{quarter + 1}</td>
                          <td>{crop.name}</td>
                          <td className="number">{format(crop.yield)}</td>
                          <td className="number">$ {format(crop.cost)}</td>
                          <td className="number">$ {format(crop.revenue)}</td>
                        </tr>
                      ))
                    }
                    </tbody>
                  </table>
                </Card>
                <Card title="Suggested Herbicides" onResize={setWeedVisSize}
                      visualization={(
                        <RadialChart
                          {...weedVisSize}
                          showLabels
                          labelsStyle={{
                            fill: fontDarkColor,
                          }}
                          style={{
                            opacity: .75,
                          }}
                          data={weeds.map(weed => ({
                            label: weed.name,
                            subLabel: `${format(weed.gallons)} gal`,
                            angle: weed.cost,
                            radius: weed.cost,
                          }))}/>
                      )}>
                  <table>
                    <thead>
                    <tr>
                      <th>Weed</th>
                      <th>Herbicide</th>
                      <th>Amount (gal)</th>
                      <th>Cost</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      weeds.map(weed => (
                        <tr key={weed.name}>
                          <td>{weed.name}</td>
                          <td>{weed.herbicide}</td>
                          <td className="number">{format(weed.gallons)}</td>
                          <td className="number">$ {format(weed.cost)}</td>
                        </tr>
                      ))
                    }
                    </tbody>
                  </table>
                </Card>
              </CardContainer>
            </CardContainer>
          }
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
