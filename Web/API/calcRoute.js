
async function getRoute(start, end) {
    const url = `http://localhost:5000/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

    return new Promise(async (resolve, reject) => {
        try {
            let response = await fetch(url);
            if (!response.ok) {
                throw new Error(`OSRM error: ${response.status}`);
            }

            let data = await response.json();
            const routeData = data.routes[0];

            const route = {
                coordonnes: routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]), // [lat, lon]
                duration: Math.round(routeData.duration / 60), // minutes
                distance: routeData.distance // meters
            };

            resolve(route);
        } catch (err) {
            console.error("There was an error calculating the route:");
            reject(err);
        }
    });
}




module.exports={getRoute}