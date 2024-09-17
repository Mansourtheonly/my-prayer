window.onload = function() {
    // Fonction pour récupérer et afficher les heures de prière
    function fetchPrayerTimes() {
        fetch('heureprier.txt?' + new Date().getTime()) // Ajouter un paramètre de requête pour éviter le cache
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            const currentDate = new Date().toLocaleDateString('fr-CA');
            const today = lines.find(line => line.startsWith(currentDate));
            
            if (today) {
                const prayerTimes = today.split(';').slice(1);
                const timesFormatted = prayerTimes.map(time => {
                    const [hours, minutes] = time.split(':');
                    return `${hours}:${minutes}`;
                });
                displayPrayerTimes(timesFormatted);
                displayCountdown(timesFormatted);
            } else {
                displayError('Les heures de prière pour aujourd\'hui ne sont pas disponibles.');
            }
        })
        .catch(error => {
            displayError('Une erreur s\'est produite lors de la récupération des données des heures de prière.');
            console.error('Error:', error);
        });
    }

    // Fonction pour afficher l'horloge
    function displayClock() {
        const now = new Date();
        const clockDiv = document.getElementById('clock');
        clockDiv.innerHTML = now.toLocaleTimeString('fr-FR', {hour12: false}) + '<br>' + now.toLocaleDateString('fr-FR');
    }

    // Fonction pour afficher les heures de prière
    function displayPrayerTimes(times) {
        const prayerTimesDiv = document.getElementById('prayer-times');
        const prayers = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
        prayers.forEach((prayer, index) => {
            const p = document.createElement('p');
            p.innerHTML = `${prayer}: ${times[index]}`;
            prayerTimesDiv.appendChild(p);
        });
    }

    // Fonction pour afficher les erreurs
    function displayError(message) {
        const prayerTimesDiv = document.getElementById('prayer-times');
        prayerTimesDiv.innerHTML = `<p>${message}</p>`;
    }

    // Fonction pour afficher le compte à rebours pour la prochaine prière
    function displayCountdown(times) {
        const updateCountdown = () => {
            const now = new Date();
            const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(); // Convertir l'heure actuelle en secondes

            // Trouver l'index de la prochaine prière
            let nextPrayerIndex = 0;
            for (let i = 0; i < times.length; i++) {
                const [hours, minutes] = times[i].split(':');
                const prayerTime = parseInt(hours) * 3600 + parseInt(minutes) * 60; // Convertir l'heure de la prière en secondes
                if (prayerTime > currentTime) {
                    nextPrayerIndex = i;
                    break;
                }
            }

            // Calculer le temps restant jusqu'à la prochaine prière
            const [nextHours, nextMinutes] = times[nextPrayerIndex].split(':');
            const nextPrayerTime = parseInt(nextHours) * 3600 + parseInt(nextMinutes) * 60; // Convertir l'heure de la prochaine prière en secondes
            const timeDiff = nextPrayerTime - currentTime;
            const hoursLeft = Math.floor(timeDiff / 3600);
            const minutesLeft = Math.floor((timeDiff % 3600) / 60);
            const secondsLeft = timeDiff % 60;

            // Afficher le compte à rebours
            const countdownDiv = document.getElementById('countdown');
            const nextPrayerName = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'] [nextPrayerIndex];
            countdownDiv.innerHTML = `<h2>الصلاة التالية   (${nextPrayerName})</h2><p>  ${secondsLeft} ,  ${minutesLeft} ,  ${hoursLeft}   </p>`;

            // Afficher une fenêtre popup en plein écran et afficher un compte à rebours
            if ((nextPrayerName === 'Maghrib' || nextPrayerName === 'Isha') && hoursLeft === 0 && minutesLeft === 5 && secondsLeft === 0) {
                const fullscreenDiv = document.createElement('div');
                fullscreenDiv.style.position = 'fixed';
                fullscreenDiv.style.top = 0;
                fullscreenDiv.style.left = 0;
                fullscreenDiv.style.width = '100%';
                fullscreenDiv.style.height = '100%';
                fullscreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                fullscreenDiv.style.color = 'white';
                fullscreenDiv.style.display = 'flex';
                fullscreenDiv.style.alignItems = 'center';
                fullscreenDiv.style.justifyContent = 'center';
                fullscreenDiv.style.fontSize = '2em';
                fullscreenDiv.innerHTML = `<p>Il reste 5 minutes avant la prière de ${nextPrayerName} !</p>`;
                document.body.appendChild(fullscreenDiv);

                // Définir le nouveau compte à rebours dans la fenêtre popup
                const countdownPopupDiv = document.createElement('div');
                countdownPopupDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                countdownPopupDiv.style.position = 'absolute';
                countdownPopupDiv.style.bottom = '10px';
                countdownPopupDiv.style.width = '100%';
                countdownPopupDiv.style.textAlign = 'center';
                countdownPopupDiv.innerHTML = 'Nouveau compte à rebours pendant 5 minutes';
                fullscreenDiv.appendChild(countdownPopupDiv);

                // Compte à rebours pour la fenêtre popup pendant 5 minutes
                let countdownTimer = 300; // 5 minutes en secondes
                const updatePopupCountdown = () => {
                    countdownTimer--;
                    if (countdownTimer >= 0) {
                        countdownPopupDiv.innerHTML = `Compte à rebours: ${Math.floor(countdownTimer / 60)}:${countdownTimer % 60}`;
                    } else {
                        document.body.removeChild(fullscreenDiv); // Fermer la fenêtre popup
                    }
                };
                setInterval(updatePopupCountdown, 1000); // Actualiser le compte à rebours toutes les secondes
            }
        };

        // Actualiser le compte à rebours toutes les secondes
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Appeler la fonction pour récupérer et afficher les heures de prière au chargement initial
    fetchPrayerTimes();

    // Appeler la fonction pour afficher l'horloge à intervalles réguliers
    setInterval(displayClock, 1000);
};
