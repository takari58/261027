const map =
    L.map("map")
    .setView(
        [37.94413,139.33510],
        17
    );

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
        "© OpenStreetMap contributors"
    }
).addTo(map);

let currentMarker = null;
let headingCone = null;

let currentHeading = 0;

function updateCurrentMarker(
    lat,
    lng
){

    const icon =
        L.divIcon({
            className:
                "current-marker",

            html:
                '<div class="current-dot"></div>',

            iconSize:[24,24],

            iconAnchor:[12,12]
        });

    if(!currentMarker){

        currentMarker =
            L.marker(
                [lat,lng],
                {
                    icon
                }
            )
            .addTo(map);

    }else{

        currentMarker.setLatLng(
            [lat,lng]
        );
    }

    updateDirectionCone();
}

function updateDirectionCone(){

    if(
        !currentMarker
    ){
        return;
    }

    const pos =
        currentMarker.getLatLng();

    const centerLat =
        pos.lat;

    const centerLng =
        pos.lng;

    const radius =
        0.0004;

    const points = [];

    points.push([
        centerLat,
        centerLng
    ]);

    for(
        let i = -25;
        i <= 25;
        i += 2
    ){

        const angle =
            (
                currentHeading + i
            )
            *
            Math.PI
            /180;

        const lat =
            centerLat
            +
            radius
            *
            Math.cos(angle);

        const lng =
            centerLng
            +
            radius
            *
            Math.sin(angle);

        points.push([
            lat,
            lng
        ]);
    }

    points.push([
        centerLat,
        centerLng
    ]);

    if(
        headingCone
    ){
        map.removeLayer(
            headingCone
        );
    }

    headingCone =
        L.polygon(
            points,
            {
                color:"#2196f3",

                fillColor:"#2196f3",

                fillOpacity:0.20,

                weight:1
            }
        )
        .addTo(map);
}

navigator.geolocation.watchPosition(

    pos => {

        const lat =
            pos.coords.latitude;

        const lng =
            pos.coords.longitude;

        updateCurrentMarker(
            lat,
            lng
        );

        map.setView(
            [lat,lng]
        );
    },

    err => {

        console.error(err);
    },

    {
        enableHighAccuracy:true
    }
);

async function startCompass(){

    if(
        typeof DeviceOrientationEvent
        !== "undefined"
        &&
        typeof DeviceOrientationEvent
        .requestPermission
        === "function"
    ){

        try{

            const permission =
                await DeviceOrientationEvent
                .requestPermission();

            if(
                permission
                !==
                "granted"
            ){
                return;
            }

        }catch(error){

            console.error(
                error
            );

            return;
        }
    }

    window.addEventListener(

        "deviceorientation",

        event => {

            currentHeading =
                event
                .webkitCompassHeading
                ??
                event.alpha
                ??
                0;

            document
            .getElementById(
                "alpha"
            )
            .textContent =
                currentHeading
                .toFixed(1);

            document
            .getElementById(
                "beta"
            )
            .textContent =
                (
                    event.beta
                    ?? 0
                )
                .toFixed(1);

            document
            .getElementById(
                "gamma"
            )
            .textContent =
                (
                    event.gamma
                    ?? 0
                )
                .toFixed(1);

            updateDirectionCone();
        }
    );
}

document
.getElementById(
    "startCompass"
)
.addEventListener(
    "click",
    startCompass
);
