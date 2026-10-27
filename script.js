const map = L.map("map");

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
    lng,
    accuracy,
    updateDirectionCone();
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
async function startOrientation() {

    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {

        try {

            const permission =
                await DeviceOrientationEvent.requestPermission();

            if (permission !== "granted") {
                return;
            }

        } catch (e) {

            console.error(e);
            return;
        }
    }

    window.addEventListener(
        "deviceorientation",
        function(event) {

            currentHeading =
                event.webkitCompassHeading ??
                event.alpha ??
                0;

            updateDirectionCone();
        }
    );
}

startOrientation();
function updateDirectionCone() {

    if (
        !currentMarker ||
        currentHeading === null
    ) {
        return;
    }

    const pos =
        currentMarker.getLatLng();

    const centerLat = pos.lat;
    const centerLng = pos.lng;

    const radius = 0.0003;

    const points = [];

    points.push([
        centerLat,
        centerLng
    ]);

    for (
        let deg = -25;
        deg <= 25;
        deg += 2
    ) {

        const angle =
            (currentHeading + deg)
            * Math.PI
            / 180;

        const lat =
            centerLat +
            radius *
            Math.cos(angle);

        const lng =
            centerLng +
            radius *
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

    if (headingCone) {

        map.removeLayer(
            headingCone
        );
    }

    headingCone =
        L.polygon(
            points,
            {
                stroke: false,
                fillColor: "#2196f3",
                fillOpacity: 0.25
            }
        )
        .addTo(map);
}
