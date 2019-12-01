window.addEventListener('load', () => {


    let temperatureSummary = document.querySelector('.temperature-description')
    let locationTimezone = document.querySelector('.location-timezone');
    let temperatureValue = document.querySelector('.temperature-degree');
    let temperatureSection = document.querySelector('.degree-section');
    let temperatureSpan = document.querySelector('.degree-section span');
    let citySelector = document.querySelector('#city-selector');
    let selectedCity = {
        name: "",
        lat: 0,
        lng: 0,
        temperature: '',
        summary: '',
        icon: ''
    }

    insertCities();

    citySelector.addEventListener('change', async (e) => {
        console.log(e.target.value);
        let cities = await getCitiesInfo();
        const { name, lat, lng } = cities.filter(city => city.name.toLowerCase() === e.target.value.toLowerCase() && city)[0];
        selectedCity.name = name;
        selectedCity.lat = lat;
        selectedCity.lng = lng;
        console.log(selectedCity);
        renderCityInfo(selectedCity);
    })

    function setIcons(icon, iconID) {
        let skycons = new Skycons({ color: "white" });
        const currentIcon = icon.replace(/-/g, "_").toUpperCase();
        skycons.play()
        return skycons.set(iconID, Skycons[currentIcon]);
    }

    function changeTemperatureUnit(farenheit) {
        temperatureSection.addEventListener('click', () => {
            if (temperatureSpan.textContent === 'F') {
                temperatureValue.textContent = Math.floor((farenheit - 32) * (5 / 9));      //
                temperatureSpan.textContent = 'C'
            } else {
                temperatureValue.textContent = farenheit;
                temperatureSpan.textContent = 'F'
            }
        });
    }

    function getCitiesInfo() {
        return new Promise((resolve, reject) => {
            fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json')
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    data = data.filter(city => { if (city.country === "CO") return city })
                    resolve(data);
                })
        });
    }

    async function insertCities() {
        try {
            let cities = await getCitiesInfo();
            cities.forEach(city => {
                let option = document.createElement('option');
                option.setAttribute('value', city.name);
                option.textContent = city.name;
                document.querySelector('#city-selector').appendChild(option);
            })
        } catch (e) {
            console.log(e);
        }
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

    async function renderCityInfo(city) {
        try {
            const cityWeatherReport = await getCityWeather(city)
            const { temperature, summary, icon } = cityWeatherReport
            temperatureValue.textContent = temperature;
            temperatureSummary.textContent = summary;
            locationTimezone.textContent = city.name;
            setIcons(icon, document.querySelector('#temp-icon'));
            changeTemperatureUnit(temperature);
        } catch (e) {
            console.log(e);
        }
    }

});


