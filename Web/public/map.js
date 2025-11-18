var map = L.map('map', {
  center: [36.864, 10.251],
  zoom: 13,
  zoomControl: true,
  inertia: true,
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true
});
const infoPanel = document.querySelector('.info-panel');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {  
  detectRetina: true,
  
  tileSize: 256, // default, can try 512 if your tile provider supports it
  zoomOffset: 0, // or -1 with 512 tileSize
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const busIcons=L.icon({
  iconUrl: './images/bus-icon.png',
  iconSize: [70, 70],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const stationIcons=L.icon({
  iconUrl: './images/bus-stop.png',
  iconSize: [70, 70],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],

});

const dataMarkers = {
  stations: {},
  buses: {},
  routes: {}
}

const layerGroups = {
  stations: L.layerGroup().addTo(map),
  buses: L.layerGroup().addTo(map),
  routes: L.layerGroup().addTo(map),
  stationRoutes: L.layerGroup().addTo(map)
};



const styles = {
  default: {
    color: 'red',
    weight: 4,
    opacity: 0.6,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: null
  },
  mainRoute: {
    color: 'royalblue',
    weight: 6,
    opacity: 0.8,
    lineCap: 'round',
    lineJoin: 'round',
    smoothFactor: 1,
    dashArray: '5, 5'
  },
  secondaryRoute: {
    color: 'dimgray',
    weight: 5,
    opacity: 0.6,
    lineCap: 'round',
    lineJoin: 'round',
    smoothFactor: 1,
    dashArray: '3, 2'
  },
  shortestRoute: {
    color: 'green',
    weight: 4,
    opacity: 0.6,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: null
  }
};


window.busdata = {}
window.specBus = window.specBus || {};

const getRoutePopupContent = (distance, duration) => {
  return `<p>Distance: ${(distance / 1000).toFixed(1)} Km</p><p>ETA: ${duration} Min</p>`;
};

const CreateRoutelayer = (routeData) => {
  route_mk = L.polyline(routeData.coordonnes, styles.default).addTo(map)
  route_mk.bindTooltip(`<p>Distance : ${routeData.distance / 1000} Km</p><p> ETA : ${routeData.ETA} Min</p>`, { sticky: true, opacity: 1 });
  return route_mk;
}

const UpdateRoutelayer = ((route_mk, routeData) => {
  route_mk.setLatLngs(routeData.coordonnes);
  route_mk.setTooltipContent(getRoutePopupContent(routeData.distance, routeData.duration));
  return route_mk;
})



const ResetRoutelayer = () => {
  layerGroups.stationRoutes.eachLayer(routes => {
    routes.setStyle(styles.default)
  })
  layerGroups.stationRoutes.clearLayers();
}

const ResetBusRoutes = () => {
  for (let key in dataMarkers.routes) {
    dataMarkers.routes[key].setStyle(styles.default);
    layerGroups.routes.addLayer(dataMarkers.routes[key]);
  }
}



const CreateBusLayer = (id, coordinates) => {
  bus_mk = L.marker(coordinates,{icon:busIcons});
  bus_mk.bindPopup(`<p>BusNum${id}</p>`);
  bus_mk.on('click', (mk) => {
    // Switch to Transport tab
    /*document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item:first-child').classList.add('active');*/
    
    // Load and display bus data
    fetchBusData(id);
    
    // Your existing map code
    ResetRoutelayer();
    ResetBusRoutes();
    map.setView(mk.latlng, 14.5);
    if (dataMarkers.routes[id]) {
      dataMarkers.routes[id].openTooltip();
      dataMarkers.routes[id].setStyle(styles.mainRoute);
    }
  });
  bus_mk.on(`popupclose`, () => {
    ResetBusRoutes();
  })
  return bus_mk;
}



async function fetchBusData(busId) {
  try {
    const found = Object.values(window.busdata).find(bus => bus.bus_id === busId);
    if (found) {
      window.specBus = found; // make it globally accessible
      displayBusData(window.specBus);
      console.log('Bus data set',window.specBus);
    }
  } catch (error) {
    console.error('Error fetching bus data:', error);
  }
}



/*<div class="route-info">
<h4>Route Information</h4>
<p>${busData.route?.summary || 'No route information available'}</p>
</div>
</div>*/

const UpdateBusLayer = (bus_mk, coordinates) => {
  bus_mk.setLatLng(coordinates);
  return bus_mk
}

const CreateStationlayer = (station) => {
  const marker = L.marker([station.GPS_LAT, station.GPS_LONG],{icon:stationIcons}).addTo(layerGroups.stations);
  marker.bindPopup(`<p>STATION ${station.DEST}</p>`);
  dataMarkers.stations[station.DEST] = marker;
  marker.on(`popupclose`, () => {
    ResetRoutelayer();
    ResetBusRoutes();
  }
  )
  try {
    marker.on("click", async (mk) => {
      map.setView(mk.latlng,14.5)
      let response = await fetch("/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "DEST": station.DEST })
      })
      let bus_std = await response.json() //the response is an array with already sorted busid according to ETA
      ResetRoutelayer();
      bus_std.forEach((bus, index) => {
        const route = dataMarkers.routes[bus.BUS_ID]

        if (route) {
          if (index == 0)
            route.openTooltip();
          const style = (index === 0 ? styles.shortestRoute : styles.secondaryRoute)
          route.setStyle(style);
          layerGroups.stationRoutes.addLayer(route);
        }
      });
    });
  }
  catch (err) {
    console.log("Error fecthing station data with POST request : ", err)
  };
}


const RenderStations = (async () => {
  let response = await fetch("/rendb");
  let stations_tb = await response.json();  //queries stations table GPS data
  stations_tb.forEach(station => {
    CreateStationlayer(station)
  })
})();


const UpdateMap = async () => {
  let response = await fetch("/GPS");
  let GPS_data = await response.json();
  Object.values(GPS_data).forEach(busData => {
    console.log("FIrst one", busData)
    window.busdata[busData.bus_id]=busData;
    let latlngs = L.latLng(busData.latitude, busData.longitude);
    if (!dataMarkers.buses[busData.bus_id]) {
      dataMarkers.buses[busData.bus_id] = CreateBusLayer(busData.bus_id, latlngs)
      layerGroups.buses.addLayer(dataMarkers.buses[busData.bus_id]);
    }
    else {
      UpdateBusLayer(dataMarkers.buses[busData.bus_id], latlngs)
    }

    if (!dataMarkers.routes[busData.bus_id]) {
      dataMarkers.routes[busData.bus_id] = CreateRoutelayer(busData.route);
      //layerGroups.routes.addLayer(dataMarkers.routes[busData.bus_id]);
    }
    else {
      UpdateRoutelayer(dataMarkers.routes[busData.bus_id], busData.route)
    }
  })
}





map.on("contextmenu", Mousev => {
  //L.marker(Mousev.latlng).removeFrom(map);
  console.log("GEO : ", Mousev.latlng.toString());
  })
  
const main = (async () => {
  await RenderStations;
  setInterval(UpdateMap, 2000);

})();