  /*if(!routes[bus]){

        routes[bus]=L.polyline(GPS_data[key].route.coordonnes, { color: "blue" })
      //routes[key].bindTooltip("my tooltip text").openTooltip()
      console.log("ROUTES",routes)
      //console.log(GPS_data[key].route.coordonnes,"it HERRRE PLS works");
      }
      else {
        routes[bus].setLatLngs(GPS_data[key].route.coordonnes)
      }*/


//const LayerInit =(latlngs coordonnes,)




/*let latlngs = [36.864456,  10.251456]
let poly;
map.on("contextmenu", async (Mousev)=> {
  let res=await fetch("/mouse",{
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      lat: Mousev.latlng.lat,
      lng: Mousev.latlng.lng
    })
  });
  let data=await res.json();
  console.log("RESPONSE IS ",data)
  console.log("Coordinates: " + Mousev.latlng.toString());
  if(!poly){
  poly=L.polyline(data, { color: "red" }).addTo(map);
}
else{
poly.setLatLngs(data);
}
});*/





/*for (let key of stations_tb) {
  const marker = L.marker([key.GPS_LAT, key.GPS_LONG]).addTo(map);
  marker.bindPopup(`<p>STATION ${key.DEST}</p>`);
  dataStores.stations[key.DEST] = marker;

  marker.on(`popupclose`, () => 
    {//reset layers
    })
  marker.on("click", async () => {
    let response = await fetch("/stations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "DEST": station.DEST })
    })


    //console.log("Clicked:", station.DEST);
    let row = await response.json()
    //console.log("BUSES GOING TO THAT STA", row)
    stationRoutesLayer.clearLayers();
    //console.log("ROUTE OBJECT:", routes[row[0].BUS_ID]);
    routes[row[0].BUS_ID].setStyle(options_main);
    stationRoutesLayer.addLayer(routes[row[0].BUS_ID]);

    for (let i = 1; i < row.length; i++) {
      routes[row[i].BUS_ID].setStyle(options_sec)
      stationRoutesLayer.addLayer(routes[row[i].BUS_ID]);
    }
  });
}
})();



let stationRoutesLayer = L.layerGroup().addTo(map);
let buslayer=L.layerGroup().addTo(map);
let mk = {}
let routes = {}
setInterval(async () => {                                           //this function sends a request to /GPS to get GPS data sent from                                                                   
try {                                                             //server which was sent from the mqtt server
  let response = await fetch("/GPS");
  let GPS_data = await response.json();
  //console.log(GPS_data)
  for (let key in GPS_data) {                            //since the response the server sends is an object that has the mqtt topic as key
    let topic_data = GPS_data[key]
    let bus = topic_data.bus_id;                         // and the value is another object that contains the actual data `{GPS/BUS1: {…}, GPS/BUS2: {…}}` 
    let topics = Object.keys(GPS_data)                            //so first we loop through the bigger object and get the value of the topic `eg:GPS_DATA.GPS/BUS1` which is topic_data here
    let latlngs = L.latLng(topic_data.latitude, topic_data.longitude) //and since `GPS_DATA.GPS/BUS1` is the actual object we need that contains the data we just access what we need 
    // console.log("newwwNNNDD", topic, latlngs)

    

    routes[bus] = routelayer(routes[bus], topic_data.route.coordonnes
      , topic_data.route.duration, topic_data.route.distance);
    console.log("ROUTES", routes)





    if (!mk[bus]) {                                                   //here we add markers if the topic ergo the bus wasn't already added 
      mk[bus] = L.marker(latlngs).addTo(map)                          //that means if GPS_data doesn't already include that key
      mk[bus].bindPopup(`<p>BUS NUMBER ${topic_data.bus_id}</p>`)
      marker.on(`popupclose`, () => 
        {
        stationRoutesLayer.eachLayer(routes => {
          routes.setStyle(defaultStyle)
        })
        stationRoutesLayer.clearLayers();
        })
        
    }
    else {
      mk[bus].setLatLng(latlngs);                                     //if it was then we just update the marker position
    }

  
  }
}
catch (error) {
  console.log("THERE WAS AN ERROR", error)
}
}, 2000)



const resetlayer = (layer) => {
layer.setStyle(defaultStyle)

}

map.on("contextmenu", Mousev => {
//L.marker(Mousev.latlng).removeFrom(map);
console.log("GEO : ", Mousev.latlng.toString());
})



//mk.on('move')
/*var popup = L.popup()
.setLatLng([36.864,  10.251])
.setContent('<p>Hello world!<br />This is a nice popup.</p>')
.openOn(map);*/

//mk.bindPopup("<p>YO BRROO</p>").openPopup()










/*const published = [
    [36.857765, 10.263588], [36.857678, 10.263437], [36.857428, 10.263584],
    [36.857231, 10.263033], [36.857085, 10.26256], [36.857001, 10.262602],
    [36.855864, 10.263266], [36.855639, 10.262845], [36.855578, 10.262712],
    [36.85538, 10.262284], [36.855253, 10.262008], [36.8552, 10.261869],
    [36.854697, 10.26086], [36.854511, 10.260465], [36.853974, 10.260792],
    [36.853076, 10.26135], [36.852323, 10.261784], [36.851891, 10.262025],
    [36.851444, 10.262313], [36.851163, 10.262488], [36.851016, 10.26258],
    [36.850953, 10.262617], [36.850741, 10.262739], [36.850653, 10.262792],
    [36.850627, 10.262806], [36.85022, 10.26303], [36.84974, 10.263316],
    [36.84968, 10.26335], [36.849485, 10.263461], [36.84937, 10.263496],
    [36.849268, 10.263432], [36.849232, 10.263404], [36.84919, 10.263409],
    [36.84915, 10.263469], [36.849148, 10.263495], [36.849074, 10.263482],
    [36.848921, 10.263412], [36.848804, 10.263326], [36.848349, 10.262275],
    [36.847925, 10.2612], [36.847391, 10.259829], [36.846906, 10.258484],
    [36.84679, 10.258216], [36.846333, 10.257159], [36.846131, 10.25659],
    [36.845792, 10.255732], [36.845513, 10.254965], [36.844793, 10.252926],
    [36.844426, 10.251982], [36.844072, 10.250915], [36.842714, 10.247219],
    [36.841374, 10.243469], [36.840889, 10.242031], [36.839666, 10.238045],
    [36.839393, 10.237077], [36.839306, 10.236767], [36.83889, 10.235283],
    [36.83848, 10.233781], [36.837785, 10.231501], [36.837635, 10.23097],
    [36.837433, 10.230253], [36.836868, 10.228315], [36.836715, 10.227781],
    [36.836557, 10.227238], [36.833555, 10.217063], [36.833305, 10.216307],
    [36.833113, 10.215835], [36.832861, 10.215269], [36.83216, 10.213704],
    [36.8318, 10.21272], [36.831244, 10.211612], [36.830019, 10.208864],
    [36.82908, 10.206747], [36.828294, 10.204977], [36.827589, 10.203595],
    [36.82743, 10.203276], [36.827329, 10.20303], [36.827235, 10.202765],
    [36.827128, 10.202299], [36.827084, 10.201919], [36.827039, 10.200945],
    [36.82696, 10.20039], [36.826854, 10.199954], [36.826807, 10.199767],
    [36.826705, 10.199501], [36.8266, 10.199296], [36.82643, 10.199032],
    [36.825892, 10.198414], [36.825476, 10.197985], [36.825229, 10.197677],
    [36.824803, 10.196886], [36.824756, 10.196711], [36.824755, 10.196466],
    [36.824804, 10.196307], [36.824957, 10.196062], [36.825698, 10.195176],
    [36.825834, 10.194979], [36.826388, 10.194399], [36.826784, 10.193912],
    [36.827332, 10.19316], [36.828107, 10.192036], [36.828656, 10.19109],
    [36.829322, 10.189776], [36.829713, 10.188937], [36.830038, 10.188159],
    [36.830188, 10.187855], [36.830634, 10.187141], [36.831754, 10.185631],
    [36.83213, 10.184971], [36.832355, 10.184513], [36.832512, 10.184006],
    [36.832648, 10.183477], [36.832732, 10.183057], [36.832779, 10.182743],
    [36.832879, 10.181747], [36.832991, 10.18111], [36.833108, 10.180552],
    [36.833129, 10.180542], [36.833316, 10.18054], [36.833516, 10.180613],
    [36.834013, 10.180809], [36.834279, 10.180916], [36.834551, 10.180988],
    [36.834742, 10.181041], [36.83524, 10.181175], [36.835378, 10.181164],
    [36.836374, 10.181465], [36.836998, 10.181635], [36.83771, 10.181715],
    [36.838001, 10.181747], [36.839404, 10.181886], [36.840038, 10.181948],
    [36.840718, 10.182045], [36.841243, 10.182185], [36.841868, 10.182353],
    [36.842852, 10.182622], [36.843271, 10.182754], [36.84342, 10.182819],
    [36.844054, 10.182981], [36.844268, 10.183147], [36.844455, 10.183383],
    [36.844535, 10.183619], [36.844484, 10.183829], [36.844623, 10.184387],
  ];
setInterval(() => {
  if (i < published.length) {
    const payload = JSON.stringify({
      bus_id: 2,
      latitude: published[i][0],
      longitude: published[i][1]
    });

    client.publish("GPS/BUS2", payload);
    i++;
  } else {
    console.log("Finished sending all coordinates.");
  }
}, 2000);*/










const client = mqtt.connect(Config.MQTT.connectUrl,Config.MQTT.Options)

client.on('connect', () => {
    console.log('Connected')
    client.subscribe("GPS/+", (err, granted) => {              //subcribe on event NEED TO BE ADDED
        if (!err) {
            console.log("CBOOOONN", granted)
        }
    })
})

client.on('error', (err) => {
    console.error('MQTT Error:', err);
});
client.on('offline', () => {
    console.warn('MQTT client is offline');
});
client.on('reconnect', () => {
    console.warn('Reconnecting to MQTT broker...');
});
