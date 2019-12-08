window.addEventListener('load', () => {


    let temperatureSummary = document.querySelector('.temperature-description')
    let locationTimezone = document.querySelector('.location-timezone');
    let temperatureValue = document.querySelector('.temperature-degree');
    let temperatureSection = document.querySelector('.degree-section');
    let temperatureSpan = document.querySelector('.degree-section span');
    let citySelector = document.querySelector('#city-selector');
    let currentUnit = 'F'
    let colombianCitiesInfo = null;
    let loader = document.querySelector('.loader');
    let currentState = ''


    start();
    temperatureSection.addEventListener('click', () => {
        changeTemperatureUnit(temperatureValue.textContent, temperatureSpan.textContent)
    })

    citySelector.addEventListener('change', (e) => {
        renderCityInfo(colombianCitiesInfo.find(city => city.name.toLowerCase() === e.target.value.toLowerCase()), temperatureSpan.textContent);
    })



    function setVideoBack(summary) {
        const states = ['rain', 'posible', 'sunny', 'cloudy', 'overcast', 'humid']
        let newState = states.find(state => summary.toLowerCase().includes(state))
        if (newState != currentState) {
            document.querySelector('#videoBackground').src = `./video/${newState}.mp4`
            currentState = newState;
        }


    }
    async function start() {
        try {
            temperatureSpan.textContent = currentUnit;
            colombianCitiesInfo = await getCitiesInfo(); // contains collection of cities with lang and long info
            insertCities(colombianCitiesInfo);
            let defaultCity = colombianCitiesInfo.find(city => city.name.toLowerCase() === citySelector.value.toLowerCase())
            renderCityInfo(defaultCity, currentUnit);
        } catch (e) {
            console.log(e)
        }
    }

    function setIcons(icon, iconID) {
        let skycons = new Skycons({ color: "white" });
        const currentIcon = icon.replace(/-/g, "_").toUpperCase();
        skycons.play()
        return skycons.set(iconID, Skycons[currentIcon]);
    }

    function changeTemperatureUnit(value, currentUnit) {
        console.log('Old temperature unit: ' + currentUnit)
        if (currentUnit === 'F') {
            temperatureValue.textContent = Math.round((value - 32) * (5 / 9));
            currentUnit = 'C'
        } else {
            temperatureValue.textContent = Math.round((value * 9 / 5) + 32);
            currentUnit = 'F'
        }
        temperatureSpan.textContent = currentUnit;
        console.log('Current temperature Unit: ' + currentUnit)
    }
    // fech all the world's countries info and returns just colombian ones
    function getCitiesInfo() {
        return new Promise((resolve, reject) => {
            fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json')
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    data = data.filter(city => { if (city.country === "CO") return city })
                    resolve(data);
                }).then(console.log('Colombian cities were loaded correctly!'));
        });
    }
    //appends option type element to the city selector element
    function insertCities(cities) {
        cities.reverse().forEach(city => {
            let option = document.createElement('option');
            option.setAttribute('value', city.name);
            option.textContent = city.name;
            document.querySelector('#city-selector').appendChild(option);
        })
    }

    function getCityWeather(city) {
        return new Promise((resolve, reject) => {
            const proxyUri = 'https://cors-anywhere.herokuapp.com/';
            const apiUri = `${proxyUri}https://api.darksky.net/forecast/126fcb5993d43e1634e129581ea91bd0/${city.lat},${city.lng}`;
            fetch(apiUri)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    const { temperature, summary, icon } = data.currently;
                    console.log(data.currently)
                    resolve({ temperature: temperature, summary: summary, icon: icon })
                });
        })
    }

    function clearHtml() {
        temperatureValue.textContent = '';
        temperatureSummary.textContent = 'Loading info...'
        locationTimezone.textContent = citySelector.value;
    }

    async function renderCityInfo(city, currentUnit) {
        console.log(`Rendering ${city.name} city:`)
        try {
            let tempIcon = document.querySelector('#temp-icon');
            tempIcon.style.display = 'none'
            temperatureSpan.style.display = 'none';
            clearHtml()
            loader.style.display = 'block'
            const cityWeatherReport = await getCityWeather(city)
            loader.style.display = 'none'
            temperatureSpan.style.display = 'block'
            tempIcon.style.display = 'block'
            const { temperature, summary, icon } = cityWeatherReport
            console.log("current unit: " + currentUnit)
            console.log("raw temperature: " + temperature)
            setVideoBack(summary);
            temperatureValue.textContent = (currentUnit === 'C') ? Math.round((temperature - 32) * (5 / 9)) : Math.round(temperature);
            temperatureSummary.textContent = summary;
            locationTimezone.textContent = city.name;
            setIcons(icon, tempIcon);
        } catch (e) {
            console.log(e);
        }
    }

});


