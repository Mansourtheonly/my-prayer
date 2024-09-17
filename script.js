window.onload = function() {
    // Get user location (Geolocation API)
    navigator.geolocation.getCurrentPosition(function(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        
        // Fetch prayer times from Aladhan API
        fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`)
        .then(response => response.json())
        .then(data => {
            let prayerTimes = data.data.timings;
            
            // Display the prayer times
            document.getElementById('fajr').innerText = prayerTimes.Fajr;
            document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
            document.getElementById('asr').innerText = prayerTimes.Asr;
            document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
            document.getElementById('isha').innerText = prayerTimes.Isha;

            // Schedule notifications for each prayer
            setupNotifications(prayerTimes);
        });
    }, function(error) {
        console.error("Error fetching location: ", error);
        displayError('Unable to fetch location or prayer times.');
    });

    // Notification permission
    if (Notification.permission === "granted") {
        // Already granted
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notifications enabled.");
            }
        });
    }

    // Schedule notifications for each prayer time
    function scheduleNotification(time, prayerName) {
        let now = new Date();
        let prayerTime = new Date(now.toDateString() + ' ' + time);

        let timeDifference = prayerTime.getTime() - now.getTime();

        if (timeDifference > 0) {
            setTimeout(function() {
                new Notification(`Time for ${prayerName} prayer!`);
            }, timeDifference);
        }
    }

    // Function to setup notifications for all prayers
    function setupNotifications(prayerTimes) {
        scheduleNotification(prayerTimes.Fajr, "Fajr");
        scheduleNotification(prayerTimes.Dhuhr, "Dhuhr");
        scheduleNotification(prayerTimes.Asr, "Asr");
        scheduleNotification(prayerTimes.Maghrib, "Maghrib");
        scheduleNotification(prayerTimes.Isha, "Isha");
    }

    // Display clock function
    function displayClock() {
        const now = new Date();
        const clockDiv = document.getElementById('clock');
        clockDiv.innerHTML = now.toLocaleTimeString('fr-FR', { hour12: false }) + '<br>' + now.toLocaleDateString('fr-FR');
    }

    // Display error function
    function displayError(message) {
        const prayerTimesDiv = document.getElementById('prayer-times');
        prayerTimesDiv.innerHTML = `<p>${message}</p>`;
    }

    // Display countdown for the next prayer
    function displayCountdown(prayerTimes) {
        const updateCountdown = () => {
            const now = new Date();
            const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(); // Convert current time to seconds

            // Find the index of the next prayer
            let nextPrayerIndex = 0;
            const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const times = [prayerTimes.Fajr, prayerTimes.Dhuhr, prayerTimes.Asr, prayerTimes.Maghrib, prayerTimes.Isha];

            for (let i = 0; i < times.length; i++) {
                const [hours, minutes] = times[i].split(':');
                const prayerTime = parseInt(hours) * 3600 + parseInt(minutes) * 60; // Convert prayer time to seconds
                if (prayerTime > currentTime) {
                    nextPrayerIndex = i;
                    break;
                }
            }

            const [nextHours, nextMinutes] = times[nextPrayerIndex].split(':');
            const nextPrayerTime = parseInt(nextHours) * 3600 + parseInt(nextMinutes) * 60; // Convert next prayer time to seconds
            const timeDiff = nextPrayerTime - currentTime;
            const hoursLeft = Math.floor(timeDiff / 3600);
            const minutesLeft = Math.floor((timeDiff % 3600) / 60);
            const secondsLeft = timeDiff % 60;

            const countdownDiv = document.getElementById('countdown');
            const nextPrayerName = prayerOrder[nextPrayerIndex];
            countdownDiv.innerHTML = `<h2>Next Prayer (${nextPrayerName})</h2><p> ${hoursLeft} hours, ${minutesLeft} minutes, ${secondsLeft} seconds left </p>`;
        };

        updateCountdown();
        setInterval(updateCountdown, 1000); // Update countdown every second
    }

    // Call displayClock to show the clock at intervals
    setInterval(displayClock, 1000);
};
