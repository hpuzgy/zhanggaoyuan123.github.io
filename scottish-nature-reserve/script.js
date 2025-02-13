// 初始化 Mapbox 地图
mapboxgl.accessToken = "pk.eyJ1IjoiMjk2NDY0OXQiLCJhIjoiY201d2poODIzMDlxcDJqcXVmcmxoMmxpYyJ9.jSyrcFE5VHf1NZ_FO7tQ3g";

// 初始化地图对象
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/2964649t/cm72qaf1p002501r8dogs1u2p"  // 初始样式
});

map.on('load', () => {
  map.addSource("hover", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });

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
    const dzone = map.queryRenderedFeatures(event.point, {
      layers: ["local-nature-reserves-scotland"]
    });

    document.getElementById("pd").innerHTML = dzone.length
      ? `<h3>${dzone[0].properties.NAME}</h3>
        <p>Geographic properties: <strong>${dzone[0].properties.GEOGRAPHIC}</strong></p>
        <p>Site Area in Hectares: <strong>${dzone[0].properties.SITE_HA}</strong></p>
        <p>The type of habitat: <strong>${dzone[0].properties.HABITAT}</strong></p>`
      : "<p>Hover over a data zone!</p>";

    map.getSource("hover").setData({
      type: "FeatureCollection",
      features: dzone.length
        ? dzone.map((f) => ({
            type: "Feature",
            geometry: f.geometry
          }))
        : []
    });
  });

  // 添加天气信息显示函数
  function updateWeatherInfo() {
    const weatherApiKey = '89edfa3244ea6044492af9a4161aaa0a';
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=Glasgow,gb&appid=${weatherApiKey}&units=metric`;

    fetch(weatherApiUrl)
      .then(response => response.json())
      .then(data => {
        const weatherInfo = data.weather[0].description;
        const temperature = data.main.temp;

        // 更新天气信息显示在左下角
        const weatherContainer = document.getElementById("weather-details");
        weatherContainer.innerHTML = `
          <p><strong>Description:</strong> ${weatherInfo}</p>
          <p><strong>Temperature:</strong> ${temperature} °C</p>
        `;
      })
      .catch(error => console.error('Error fetching weather data:', error));
  }

  // 初始化天气信息更新
  updateWeatherInfo();

  const layers = ["Scottish Nature Reserve"];
  const colors = ["#3a7f47"];
  const legend = document.getElementById("legend");
  layers.forEach((layer, i) => {
    const color = colors[i];
    const key = document.createElement("div");
    key.className = "legend-key";
    key.style.backgroundColor = color;
    key.innerHTML = layer;
    legend.appendChild(key);
  });

  // 添加 Geocoder 搜索控件
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    placeholder: "Search for places in Scotland",
    proximity: {
      longitude: -4.2518,
      latitude: 55.8642
    }
  });

  map.addControl(geocoder, "top-left");
  map.addControl(new mapboxgl.NavigationControl(), "top-left");
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }), "top-left");

  // 启用 Mapbox Draw 插件
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,  // 启用多边形绘制
      line_string: true, // 启用线段绘制
      trash: true, // 启用删除功能
      combine_features: true,
      uncombine_features: true
    }
  });
  map.addControl(draw, 'top-left');

  // 在每个线段的末尾添加箭头样式
  function addArrowToLine(feature) {
    const lineString = feature.geometry.coordinates;
    const start = lineString[0];
    const end = lineString[lineString.length - 1];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    const arrow = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: end
      },
      properties: {
        icon: 'arrow', // 使用自定义箭头图标
        angle: angle
      }
    };

    return arrow;
  }

  // 监听绘制事件，捕获创建的线段（箭头）
  map.on('draw.create', (event) => {
    const arrow = addArrowToLine(event.features[0]);
    draw.add(arrow);
  });
});