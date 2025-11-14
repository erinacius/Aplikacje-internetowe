// ================================
// GLOBAL VARIABLES
// ================================
let map = null;
let userLocation = null;
let userMarker = null;
let currentMapImage = null;
// Puzzle board references (made global so handlers can access)
let puzzleBoard = null;
let puzzlePiecesContainer = null;
const piecesPerRow = 3; // 3x3 puzzle -> 9 pieces

let puzzleState = {
    started: false,
    pieces: [],
    draggedPiece: null
};

// ================================
// INIT LEAFLET MAP
// ================================
function initMap() {
    map = L.map('mapContainer').setView([52.2297, 21.0122], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    map.on('mousemove', (e) => {
        document.getElementById('coordsDisplay').textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    });
}

// ================================
// PERMISSIONS: LOCATION
// ================================
document.getElementById('btnRequestLocation').addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation API nie jest obsługiwane.');

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLocation = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                accuracy: pos.coords.accuracy
            };
            updatePermissionsStatus();
            // Do not add marker here — this button only requests/stores location permission
            showNotification('Zgoda pobrana', 'Lokalizacja została pobrana i zapisana. Kliknij "Moja lokalizacja" aby ją pokazać na mapie.');
        },
        (err) => alert('Błąd pobierania lokalizacji: ' + err.message)
    );
});

function addUserMarker() {
    if (userMarker) map.removeLayer(userMarker);

    userMarker = L.marker([userLocation.lat, userLocation.lon]).addTo(map);
    map.setView([userLocation.lat, userLocation.lon], 15);
}

// ================================
// PERMISSIONS: NOTIFICATIONS
// ================================
document.getElementById('btnRequestNotifications').addEventListener('click', () => {
    if (!('Notification' in window)) return alert('Powiadomienia nie są obsługiwane.');

    if (Notification.permission === 'granted') {
        showNotification('Powiadomienia', 'Powiadomienia już włączone');
    } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(p => {
            updatePermissionsStatus();
            if (p === 'granted') showNotification('Powiadomienia', 'Powiadomienia aktywne!');
        });
    } else alert('Powiadomienia są zablokowane.');
});

function updatePermissionsStatus() {
    let status = `<strong>Status uprawnień:</strong><br>`;

    if (userLocation)
        status += `✓ Lokalizacja: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}<br>`;
    else
        status += `✗ Lokalizacja: brak zgody<br>`;

    if ('Notification' in window) {
        if (Notification.permission === 'granted')
            status += '✓ Powiadomienia: włączone';
        else if (Notification.permission === 'default')
            status += '? Powiadomienia: nie pytano';
        else
            status += '✗ Powiadomienia: zablokowane';
    }

    document.getElementById('permissionsStatus').innerHTML = status;
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body: body });
    }
}

// ================================
// BUTTON: MY LOCATION (GOOGLE MAPS)
// ================================
document.getElementById('btnMyLocation').addEventListener('click', () => {
    // If location was already requested and saved, just show the marker
    if (userLocation) {
        addUserMarker();
        showNotification('Moja lokalizacja', `Wyświetlam zapisaną pozycję: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`);
        return;
    }

    if (!navigator.geolocation) return alert('Brak wsparcia dla geolokalizacji.');

    navigator.geolocation.getCurrentPosition((pos) => {
        // Save location and show on Leaflet map
        userLocation = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy
        };
        updatePermissionsStatus();
        addUserMarker();
        showNotification('Moja lokalizacja', 'Pobrano i wyświetlono Twoją pozycję.');
    }, (err) => {
        alert('Błąd pobierania lokalizacji: ' + err.message);
    });
});

function showGoogleMap(lat, lon) {
    // Google Maps removed — function left empty to avoid errors if referenced elsewhere
}

// btnCloseGoogleMaps removed along with Google Maps UI

// ================================
// RESET MAP
// ================================
document.getElementById('btnResetMap').addEventListener('click', () => {
    map.setView([52.2297, 21.0122], 13);
});

// ================================
// EXPORT MAP + START PUZZLE
// ================================
document.getElementById('btnExportMap').addEventListener('click', () => exportMap());
async function exportMap() {
    const canvas = await html2canvas(document.getElementById('mapContainer'));
    currentMapImage = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = currentMapImage;
    link.download = 'mapa.png';
    link.click();

    initPuzzle();
}

// Start puzzle by capturing current Leaflet map and creating 3x3 puzzle
document.getElementById('btnStartPuzzle').addEventListener('click', async () => {
    try {
        const canvas = await html2canvas(document.getElementById('mapContainer'), {useCORS: true});
        currentMapImage = canvas.toDataURL('image/png');
        initPuzzle();
    } catch (err) {
        console.error('Błąd tworzenia puzzle:', err);
        alert('Nie udało się przygotować puzzle: ' + err.message);
    }
});

// ================================
// PUZZLE ENGINE
// ================================
function initPuzzle() {
    if (!currentMapImage) return alert('Najpierw pobierz mapę!');

    puzzleState.pieces = [];

    // Use global board/pieces references
    puzzleBoard = document.getElementById('board');
    puzzlePiecesContainer = document.getElementById('pieces');
    puzzleBoard.innerHTML = '';
    puzzlePiecesContainer.innerHTML = '';

    let img = new Image();
    img.onload = () => {
        // create 3x3 puzzle with precise slicing so we don't crop edges
        const rows = piecesPerRow;
        const cols = piecesPerRow;

        // floating cell sizes
        const cellWf = img.width / cols;
        const cellHf = img.height / rows;

        // compute integer widths/heights per column/row so sum matches image dimensions
        const colWidths = new Array(cols);
        const rowHeights = new Array(rows);
        for (let c = 0; c < cols; c++) {
            colWidths[c] = Math.round((c + 1) * cellWf) - Math.round(c * cellWf);
        }
        for (let r = 0; r < rows; r++) {
            rowHeights[r] = Math.round((r + 1) * cellHf) - Math.round(r * cellHf);
        }

        // set board size to exact image size so drops align
        puzzleBoard.style.position = 'relative';
        puzzleBoard.style.width = img.width + 'px';
        puzzleBoard.style.height = img.height + 'px';
        puzzleBoard.style.border = '1px dashed rgba(0,0,0,0.2)';

        let temp = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const sx = Math.round(c * cellWf);
                const sy = Math.round(r * cellHf);
                const sw = colWidths[c];
                const sh = rowHeights[r];

                let canvas = document.createElement('canvas');
                canvas.width = sw;
                canvas.height = sh;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

                let div = document.createElement('div');
                div.classList.add('puzzle-piece');
                div.style.width = sw + 'px';
                div.style.height = sh + 'px';
                div.style.backgroundImage = `url(${canvas.toDataURL()})`;
                div.style.backgroundSize = '100% 100%';

                let piece = { r, c, element: div, placed: false, currentRow: null, currentCol: null };

                div.draggable = true;
                div.addEventListener('dragstart', () => puzzleState.draggedPiece = piece);
                div.addEventListener('dragend', () => puzzleState.draggedPiece = null);

                temp.push(piece);
            }
        }

        // shuffle
        temp.sort(() => Math.random() - 0.5);

        // place pieces in pieces container (no absolute positioning needed, flexbox will handle layout)
        temp.forEach((p) => {
            // remove inline positioning since CSS flexbox will handle layout
            p.element.style.position = 'relative';
            puzzlePiecesContainer.appendChild(p.element);
            puzzleState.pieces.push(p);
        });

        // make board accept drops, pass column widths and row heights for precise snapping
        puzzleBoard.ondragover = (e) => e.preventDefault();
        puzzleBoard.ondrop = (e) => handleDrop(e, colWidths, rowHeights);
    };
    img.src = currentMapImage;
}

function handleDrop(e, colWidths, rowHeights) {
    const p = puzzleState.draggedPiece;
    if (!p) return;

    const rect = puzzleBoard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // determine column by accumulating widths
    let cum = 0;
    let col = -1;
    for (let c = 0; c < colWidths.length; c++) {
        cum += colWidths[c];
        if (x < cum) { col = c; break; }
    }

    // determine row by accumulating heights
    cum = 0;
    let row = -1;
    for (let r = 0; r < rowHeights.length; r++) {
        cum += rowHeights[r];
        if (y < cum) { row = r; break; }
    }

    if (col === -1 || row === -1) {
        showNotification('Poza planszą', 'Upuść część na planszy.');
        return;
    }

    // compute position by summing previous widths/heights
    const left = colWidths.slice(0, col).reduce((a, b) => a + b, 0);
    const top = rowHeights.slice(0, row).reduce((a, b) => a + b, 0);

    // find if another piece is sitting at target cell
    const existing = puzzleState.pieces.find(px => px.currentRow === row && px.currentCol === col);

    // remember previous position of dragged piece
    const prevRow = p.currentRow;
    const prevCol = p.currentCol;

    // place dragged piece to target
    p.currentRow = row;
    p.currentCol = col;
    p.placed = true;
    p.element.style.position = 'absolute';
    p.element.style.left = left + 'px';
    p.element.style.top = top + 'px';
    // ensure draggable stays enabled so user can move/swap later
    p.element.draggable = true;
    puzzleBoard.appendChild(p.element);

    if (existing && existing !== p) {
        // swap: move existing piece to dragged piece previous spot (or back to pieces container if none)
        if (prevRow === null || prevCol === null) {
            // move existing back to pieces container
            existing.currentRow = null;
            existing.currentCol = null;
            existing.placed = false;
            // reset positioning and append to pieces container (flexbox will handle layout)
            existing.element.style.position = 'relative';
            existing.element.style.left = '';
            existing.element.style.top = '';
            puzzlePiecesContainer.appendChild(existing.element);
        } else {
            // move existing to previous position of dragged piece
            const prevLeft = colWidths.slice(0, prevCol).reduce((a, b) => a + b, 0);
            const prevTop = rowHeights.slice(0, prevRow).reduce((a, b) => a + b, 0);
            existing.currentRow = prevRow;
            existing.currentCol = prevCol;
            existing.placed = true;
            existing.element.style.position = 'absolute';
            existing.element.style.left = prevLeft + 'px';
            existing.element.style.top = prevTop + 'px';
            puzzleBoard.appendChild(existing.element);
        }
    }

    checkPuzzleCompletion();
}

function checkPuzzleCompletion() {
    // for 3x3 puzzle ensure all 9 pieces are placed
    if (puzzleState.pieces.length > 0 && puzzleState.pieces.every(p => p.placed)) {
        document.getElementById('puzzleStatus').innerHTML = '<p style="color: #27ae60; font-weight: bold; font-size:18px;">🎉 Gratulacje! Ułożyłeś puzzle! 🎉</p>';
        showNotification('🎉 Gratulacje! 🎉', 'Świetnie! Ułożyłeś wszystkie 9 części puzzle mapy!');
    }
}

// ================================
// ON LOAD
// ================================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updatePermissionsStatus();
});