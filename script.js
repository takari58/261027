const map = L.map("map");

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "© OpenStreetMap contributors"
    }
).addTo(map);

let currentMarker = null;
let headingMarker = null;

let currentAlpha = 0;

navigator.geolocation.getCurrentPosition(
    pos => {

        const lat =
            pos.coords.latitude;

        const lng =
            pos.coords.longitude;

        map.setView(
            [lat,lng],
            18
        );

        updateCurrentMarker(
            lat,
            lng
        );
    }
);

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

    }
);

function updateCurrentMarker(
    lat,
    lng
){

    const currentIcon =
        L.divIcon({

            className:"",

            html:
            '<div class="current-dot"></div>',

            iconSize:[20,20]
        });

    if(!currentMarker){

        currentMarker =
            L.marker(
                [lat,lng],
                {
                    icon:currentIcon
                }
            ).addTo(map);

    }else{

        currentMarker.setLatLng(
            [lat,lng]
        );
    }

    updateHeadingMarker(
        lat,
        lng
    );
}

function updateHeadingMarker(
    lat,
    lng
){

    const distance =
        0.00010;

    const rad =
        currentAlpha *
        Math.PI / 180;

    const targetLat =
        lat +
        Math.cos(rad)
        * distance;

    const targetLng =
        lng +
        Math.sin(rad)
        * distance;

    if(!headingMarker){

        headingMarker =
            L.circleMarker(
                [
                    targetLat,
                    targetLng
                ],
                {
                    radius:10,

                    color:"yellow",

                    fillColor:"yellow",

                    fillOpacity:1
                }
            ).addTo(map);

    }else{

        headingMarker.setLatLng(
            [
                targetLat,
                targetLng
            ]
        );
    }
}

function getDirection(
    alpha
){

    if(alpha < 22.5)
        return "北";

    if(alpha < 67.5)
        return "北東";

    if(alpha < 112.5)
        return "東";

    if(alpha < 157.5)
        return "南東";

    if(alpha < 202.5)
        return "南";

    if(alpha < 247.5)
        return "南西";

    if(alpha < 292.5)
        return "西";

    if(alpha < 337.5)
        return "北西";

    return "北";
}

function startOrientation(){

    window.addEventListener(
        "deviceorientation",
        event => {

            const alpha =
                event.webkitCompassHeading ??
                event.alpha ??
                0;

            const beta =
                event.beta ??
                0;

            const gamma =
                event.gamma ??
                0;

            currentAlpha =
                alpha;

            document
            .getElementById(
                "alpha"
            )
            .textContent =
                alpha.toFixed(1);

            document
            .getElementById(
                "beta"
            )
            .textContent =
                beta.toFixed(1);

            document
            .getElementById(
                "gamma"
            )
            .textContent =
                gamma.toFixed(1);

            document
            .getElementById(
                "direction"
            )
            .textContent =
                getDirection(alpha);

            if(currentMarker){

                const pos =
                    currentMarker
                    .getLatLng();

                updateHeadingMarker(
                    pos.lat,
                    pos.lng
                );
            }
        }
    );
}

document
.getElementById(
    "startSensor"
)
.addEventListener(
    "click",
    async () => {

        if(
            typeof
            DeviceOrientationEvent
            .requestPermission
            === "function"
        ){

            try{

                const result =
                    await
                    DeviceOrientationEvent
                    .requestPermission();

                if(
                    result ===
                    "granted"
                ){

                    startOrientation();
                }

            }catch(e){

                console.error(e);
            }

        }else{

            startOrientation();
        }
    }
);
