// The value for 'accessToken' begins with 'pk...'
    mapboxgl.accessToken =
      "pk.eyJ1IjoiMjk2NDY0OXQiLCJhIjoiY201d2poODIzMDlxcDJqcXVmcmxoMmxpYyJ9.jSyrcFE5VHf1NZ_FO7tQ3g";
    // Define a map object by initializing a Map from Mapbox
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/2964649t/cm66mjks2004k01s74b47a36e"
    });
    // Ensure the map is loaded before interacting with it
    map.on('load', () => {
      // Define hover source
      map.addSource("hover", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      // Add hover layer
      map.addLayer({
        id: "dz-hover",
        type: "line",
        source: "hover",
        layout: {},
        paint: {
            "line-color": "Cyan",
            "line-width": 4
        }
      });

      map.on("mousemove", (event) => {
        // Query features at the mouse point in the "glasgow-simd" layer
        const dzone = map.queryRenderedFeatures(event.point, {
          layers: ["glasgow-simd"]
        });
        // Update the content based on the queried feature
        document.getElementById("pd").innerHTML = dzone.length ?
          `<h3>${dzone[0].properties.DZName}</h3><p>Rank: <strong>${dzone[0].properties.Percentv2}</strong> %</p>` :
          `<p>Hover over a data zone!</p>`;

        // Update hover source with the geometry of the hovered area
        map.getSource("hover").setData({
          type: "FeatureCollection",
          features: dzone.length
            ? dzone.map((f) => ({
                type: "Feature",
                geometry: f.geometry
            }))
            : [] // If no data, clear the hover layer
        });
      });
      // Create legend
      const layers = ["<10", "20", "30", "40", "50", "60", "70", "80", "90", "100"];
      const colors = ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];
      const legend = document.getElementById("legend");
      layers.forEach((layer, i) => {
        const color = colors[i];
        const key = document.createElement("div");
        key.className = "legend-key";
        key.style.backgroundColor = color;
        // Change the text color to white for dark colors (dark red and dark blue)
        if (i <= 1 || i >= 8) {
          key.style.color = "white";
        }
        key.innerHTML = `${layer}`;
        legend.appendChild(key);
      });
    });
    // Add Geocoder search control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken, // Set the access token
      mapboxgl: mapboxgl, // Set the mapbox-gl instance
      marker: false, // Do not use the default marker style
      placeholder: "Search for places in Glasgow", // Placeholder text for the search bar
      proximity: {
        longitude: -4.2518, // Corrected Longitude for Glasgow
        latitude: 55.8642 // Corrected Latitude for Glasgow
      } // Coordinates of Glasgow center
    });
    // Add the geocoder control to the top-left of the map
    map.addControl(geocoder, "top-left");
    // Add Navigation control (zoom and rotation)
    map.addControl(new mapboxgl.NavigationControl(), "top-left");
    // Add Geolocate control (find my current location)
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      "top-left"
    );