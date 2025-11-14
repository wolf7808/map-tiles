
/* ============================= ГЛОБАЛЬНЫЕ ============================= */
const TILE_COUNT = 16;
const TILE_SIZE = 128;
const MAP_SIZE = 2048;
const TOTAL_TILES = 256;
const TIMEOUT_MS = 10000;
const BASE_URLS = {
    1: 'https://raw.githubusercontent.com/wolf7808/map-tiles/main/tiles/',
    2: 'https://raw.githubusercontent.com/wolf7808/map-tiles/main/tiles2/'
};
const COMMUNITY_URLS = {
    1: 'https://raw.githubusercontent.com/wolf7808/map-tiles/main/markers-map1.json',
    2: 'https://raw.githubusercontent.com/wolf7808/map-tiles/main/markers-map2.json'
};

let currentMap = null;
let canvas, ctx, zoomEl, tileCoordsEl, pixelCoordsEl, clearAllBtn, saveStatus;
let addMarkerBtn, exportBtn, importFile, dialog, closeDialog;
let uiPanel, uiToggle, uiClose, loadCommunityBtn;
let scale = 1, offsetX = 0, offsetY = 0, isDragging = false, startX, startY;
let placingMarker = null;
let tiles = {}, loaded = 0, failed = 0;
let markers = [];
let currentLang = 'ru';
let isUIPanelOpen = false;
let loadingOverlay, loadingProgress, criticalErrorModal, retryBtn;
let firstTileTimer = null, firstTileLoaded = false, remainingTilesLoaded = false;
let tempMessage;

/* === НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ ТАЧ === */
let touchStartScale = 1;
let touchStartOffsetX = 0;
let touchStartOffsetY = 0;
let pinchStartDist = 0;
let pinchStartCenter = { x: 0, y: 0 };

/* ============================= ПЕРЕВОДЫ ============================= */
const translations = {
    ru: { 
        loading:"Загрузка карты...", retry:"Повторить", connection_error:"Ошибка подключения", 
        blocked_hint:"CDN ERR_CONNECTION_RESET<br>(Что-то на вашем устройстве заблокировало запрос)", 
        zoom:"Зум", tile:"Тайл", pixel:"Пиксель", add_marker:"Поставить метку", export:"Экспорт JSON", 
        import:"Импорт JSON", clear_all:"Очистить всё", grid:"Сетка", saved:"Сохранено", 
        author:"Автор", choose_marker:"Выберите тип метки", community_markers:"Загрузить Маркеры Сообщества", 
        loading_community:"Загрузка маркеров сообщества...", community_loaded:"Маркеры загружены!", 
        community_error:"Ошибка загрузки маркеров", 
        poi:"Интерес", challenge:"Испытание", boss:"Босс", crate:"Ящик", 
        weapon:"Оружие", medkit:"Аптечка", key:"Карты", grenade:"Гранаты", 
        material:"Материалы", chest:"Сундук", wmodule:"Обвесы", ammo:"Патроны", 
        map1:"Разбойная Пустошь", map2:"Мрачные Топи", 
        expedition_progress:"Прогресс Экспедиции", quest:"Задание", warehouse:"Склад",
        trader:"Торговец", outpost:"Аванпост", food:"Рыбалка", trash:"Хлам", artifact: 'Артефакт', crystal: 'Кристалл',
		containers: "Контейнеры", npc: "NPC", places: "Места", other: "Прочее", carnage: "Резня",
		henbane: "Беленица", mushroom: "Веселка", rose: "Огн. роза", solenoid: "Соленоид", cwater:"Зар. вода",
		fuel:"Топливо", teleport:"Телепорт", hogweed:"Борщевик", spices:"Пряности"
    },
    en: { 
        loading:"Loading map...", retry:"Retry", connection_error:"Connection error", 
        blocked_hint:"CDN ERR_CONNECTION_RESET<br>(Something blocked request)", 
        zoom:"Zoom", tile:"Tile", pixel:"Pixel", add_marker:"Add Marker", export:"Export JSON", 
        import:"Import JSON", clear_all:"Clear All", grid:"Show Grid", saved:"Saved", 
        author:"Author", choose_marker:"Choose marker type", community_markers:"Load Community Markers", 
        loading_community:"Loading community markers...", community_loaded:"Markers loaded!", 
        community_error:"Failed to load markers", 
        poi:"POI", challenge:"Challenge", boss:"Boss", crate:"Crate", 
        weapon:"Weapon", medkit:"Medkit", key:"Key/Card", grenade:"Grenades", 
        material:"Materials", chest:"Chest", wmodule:"Weapon Kit", ammo:"Ammo", 
        map1:"Rogue Wastelands", map2:"Murky Swamps", 
        expedition_progress:"Expedition Progress", quest:"Quest", warehouse:"Storage",
        trader:"Trader", outpost:"Outpost", food:"Fishing", trash:"Trash", artifact: 'Artifact', crystal: 'Crystal',
		containers: "Containers", npc: "NPC", places: "Locations", other: "Other", carnage: "carnage",
		henbane: "Henbane", mushroom: "Stinkhorn", rose: "Fire Rose", solenoid: "Solenoid", cwater:"Ch. Water",
		fuel:"Fuel", teleport:"Teleport", hogweed:"Hogweed", spices:"Spices"
    },
    zh: { 
loading:"正在加载地图……",
retry:"重试",
connection_error:"连接错误",
blocked_hint:"CDN 错误 - 连接已重置<br>(有东西阻止了请求)",
zoom:"缩放倍率",
tile:"格数",
pixel:"坐标",
add_marker:"添加标记",
export:"导出 JSON ",
import:"导入 JSON ",
clear_all:"清除所有标记",
grid:"显示网格",
saved:"已保存",
author:"作者",
choose_marker:"选择标记类型",
community_markers:"加载社区标志",
loading_community:"正在加载社区标识...",
community_loaded:"标记已加载！",
community_error:"无法加载标记点",
poi:"兴趣点",
challenge:"挑战",
boss:"Boss",
crate:"板条箱",
weapon:"武器箱",
medkit:"医疗包",
key:"钥匙/卡片",
grenade:"手榴弹箱",
material:"材料箱",
chest:"装备箱",
wmodule:"武器配件",
ammo:"子弹箱",
map1:"荒蛮之地",
map2:"黑暗沼泽",
expedition_progress:"探险进展",
quest:"任务",
warehouse:"探险家储物室",
trader:"商人",
outpost:"哨站",
food:"钓鱼",
trash:"垃圾",
artifact: '神器',
crystal: '水晶',
containers: "容器",
npc: "NPC",
places: "地点",
other: "其他",
carnage: "大杀",
henbane: "莨菪",
mushroom: "白鬼笔",
rose: "火之玫瑰",
solenoid: "电磁线圈",
cwater:"充能水",
fuel:"燃料",
teleport:"传送门",
hogweed:"大猪草",
spices:"香料"
    }
};

const markerTypes = {
    poi:{title:()=>translations[currentLang].poi},
    challenge:{title:()=>translations[currentLang].challenge},
    boss:{title:()=>translations[currentLang].boss},
    crate:{title:()=>translations[currentLang].crate},
    weapon:{title:()=>translations[currentLang].weapon},
    medkit:{title:()=>translations[currentLang].medkit},
    key:{title:()=>translations[currentLang].key},
    grenade:{title:()=>translations[currentLang].grenade},
    material:{title:()=>translations[currentLang].material},
    chest:{title:()=>translations[currentLang].chest},
    wmodule:{title:()=>translations[currentLang].wmodule},
    ammo:{title:()=>translations[currentLang].ammo},
    quest:{title:()=>translations[currentLang].quest},
    warehouse:{title:()=>translations[currentLang].warehouse},
    trader:{title:()=>translations[currentLang].trader},
    outpost:{title:()=>translations[currentLang].outpost},
    food:{title:()=>translations[currentLang].food},
	trash:{title:() => translations[currentLang].trash},
    artifact:{title:() => translations[currentLang].artifact},
    crystal:{title:() => translations[currentLang].crystal},
	carnage: {title: () => translations[currentLang].carnage},
	henbane: {title: () => translations[currentLang].henbane},
    mushroom: {title: () => translations[currentLang].mushroom},
    rose: {title: () => translations[currentLang].rose},
	solenoid: {title: () => translations[currentLang].solenoid},
    cwater: {title: () => translations[currentLang].cwater},
	fuel:     {title:()=>translations[currentLang].fuel},
	teleport: {title:()=>translations[currentLang].teleport},
	hogweed:  {title:()=>translations[currentLang].hogweed},
	spices:   {title:()=>translations[currentLang].spices}
};

/* ============================= ПОДСЧЁТ МАРКЕРОВ ============================= */
function updateFilterCounters() {
    const counts = {};
    markers.forEach(m => counts[m.type] = (counts[m.type] || 0) + 1);

    document.querySelectorAll('.filter-toggle').forEach(btn => {
        const type = btn.dataset.type;
        const realCount = counts[type] || 0;
        const counter = btn.querySelector('.counter');

        if (btn.classList.contains('active')) {
            // Фильтр включён → показываем реальное количество
            btn.dataset.count = realCount;
            if (counter) counter.textContent = realCount; 
        } else {
            // Фильтр выключен → всегда 0
            btn.dataset.count = '0';
            if (counter) counter.textContent = '0';
        }
    });
}

/* ============================= ИНИЦИАЛИЗАЦИЯ ============================= */
function initElements() {
    loadingOverlay     = document.getElementById('loadingOverlay');
    loadingProgress    = document.getElementById('loadingProgress');
    criticalErrorModal = document.getElementById('criticalErrorModal');
    retryBtn           = document.getElementById('retryBtn');
    tempMessage        = document.getElementById('tempMessage');
    
    uiPanel            = document.getElementById('ui');   // ← важно!

    // === КНОПКИ ОТКРЫТИЯ/ЗАКРЫТИЯ UI ===
    const openBtn = document.getElementById('openUI');
    const closeBtn = document.getElementById('uiClose');
    
    if (openBtn) openBtn.onclick = toggleUI;
    if (closeBtn) closeBtn.onclick = toggleUI;
}

/* ============================= ЯЗЫК ============================= */
function selectLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('map-lang', lang);
    document.getElementById('langModal').style.display = 'none';
    document.getElementById('mapModal').style.display = 'flex';
    const map1Btn = document.getElementById('map1Btn');
    const map2Btn = document.getElementById('map2Btn');
    if (map1Btn) map1Btn.textContent = translations[lang].map1;
    if (map2Btn) map2Btn.textContent = translations[lang].map2;
    applyTranslations();
    initElements();
}

/* ============================= ПЕРЕВОДЫ ============================= */
function applyTranslations() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.dataset.t;
        const text = translations[currentLang][key];
        if (text !== undefined) {
            if (el.tagName === 'LABEL' && el.querySelector('input')) {
                el.lastChild.textContent = ' ' + text;
            } else {
                el.innerHTML = text;
            }
        }
    });

    const switchMap1 = document.getElementById('switchMap1');
    const switchMap2 = document.getElementById('switchMap2');
    if (switchMap1) switchMap1.textContent = translations[currentLang].map1;
    if (switchMap2) switchMap2.textContent = translations[currentLang].map2;
    if (retryBtn) retryBtn.textContent = translations[currentLang].retry;

    document.querySelectorAll('.filter-toggle span:not(.counter), .marker-option > div:last-child').forEach(span => {
        const btn = span.closest('[data-type]') || span.closest('.marker-option');
        const type = btn?.dataset.type;
        if (type && translations[currentLang][type]) {
            span.textContent = translations[currentLang][type];
        }
    });
}

/* ============================= ЗАГРУЗКА КАРТЫ ============================= */
function loadMap(mapNumber) {
    if (currentMap === mapNumber && canvas) return;
    document.querySelectorAll('.marker').forEach(m => m.remove());
    currentMap = mapNumber;
    markers = JSON.parse(localStorage.getItem(`map-markers-v10-map${currentMap}`) || '[]');
    document.getElementById('mapModal').style.display = 'none';
    loadingOverlay.querySelector('[data-t="loading"]').innerHTML = translations[currentLang].loading;
    loadingOverlay.style.display = 'flex';
    loadingProgress.textContent = '0%';
    tiles = {}; loaded = 0; failed = 0; firstTileLoaded = false; remainingTilesLoaded = false;
    if (firstTileTimer) clearTimeout(firstTileTimer);
    Object.keys(tiles).forEach(k => URL.revokeObjectURL(tiles[k]?.src));

    const firstImg = new Image();
    firstImg.onload = () => { 
        firstTileLoaded = true; 
        clearTimeout(firstTileTimer); 
        tiles[1] = firstImg; 
        loaded = 1; 
        updateProgress(); 
        loadRemainingTiles(BASE_URLS[currentMap]); 
    };
    firstImg.onerror = () => { 
        firstTileLoaded = true; 
        clearTimeout(firstTileTimer); 
        tiles[1] = null; 
        failed++; 
        updateProgress(); 
    };
    firstTileTimer = setTimeout(() => { 
        if (!firstTileLoaded) { 
            criticalErrorModal.style.display = 'flex'; 
            applyTranslations(); 
        } 
    }, TIMEOUT_MS);
    firstImg.src = `${BASE_URLS[currentMap]}1.jpg`;
}

function loadRemainingTiles(baseUrl) {
    if (remainingTilesLoaded) return;
    remainingTilesLoaded = true;
    for (let i = 2; i <= TOTAL_TILES; i++) {
        const img = new Image();
        img.onload = () => { tiles[i] = img; loaded++; updateProgress(); };
        img.onerror = () => { tiles[i] = null; failed++; updateProgress(); };
        img.src = `${baseUrl}${i}.jpg`;
    }
}

function retryCurrentMap() { 
    criticalErrorModal.style.display = 'none'; 
    loadMap(currentMap); 
}


function updateProgress() {
    const percent = Math.round((loaded + failed) / TOTAL_TILES * 100);
    loadingProgress.textContent = percent + '%';

    // === АНИМАЦИЯ ЛОГОТИПА ПО БУКВАМ ===
    const logo = document.getElementById('pLogo');
    if (logo) {
        const lettersToShow = Math.min(Math.floor(percent / 20) + 1, 6);
        const visiblePercent = (lettersToShow / 6) * 100;
        
        logo.style.clipPath = `inset(0 ${100 - visiblePercent}% 0 0)`;
        
        // Свечение при появлении новой буквы
        if (lettersToShow > (logo.dataset.shown || 0)) {
            logo.style.animation = 'none';
            setTimeout(() => logo.style.animation = 'letterGlow 1.2s ease-out', 10);
            logo.dataset.shown = lettersToShow;
        }
    }

    if (loaded + failed === TOTAL_TILES && firstTileLoaded) finishLoading();
}


function finishLoading() {
    setTimeout(() => { 
        loadingOverlay.style.display = 'none'; 
        initUI(); 
        draw(); 
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        updateFilterCounters();
if (isUIPanelOpen) {
    uiPanel.style.display = 'flex';
    uiPanel.classList.add('visible');
}
    }, 300);
    showTempMessage();
}

function initUI() {
    if (canvas) return;
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.style.display = 'block';
    zoomEl = document.getElementById('zoom');
    tileCoordsEl = document.getElementById('tileCoords');
    pixelCoordsEl = document.getElementById('pixelCoords');
    clearAllBtn = document.getElementById('clearAll');
    saveStatus = document.getElementById('saveStatus');
    addMarkerBtn = document.getElementById('addMarkerBtn');
    exportBtn = document.getElementById('exportBtn');
    importFile = document.getElementById('importFile');
    dialog = document.getElementById('markerDialog');
    closeDialog = document.getElementById('closeDialog');
    loadCommunityBtn = document.getElementById('loadCommunityBtn');

    // ← ВАЖНО: инициализация UI панели
    uiPanel = document.getElementById('ui');
   uiPanel.style.display = isUIPanelOpen ? 'flex' : 'none';
uiPanel.classList.toggle('visible', isUIPanelOpen);

    applyTranslations();
    initEvents();
    resize();
    updateFilterCounters();
	// НОВОЕ: Активируем все фильтры по умолчанию
    document.querySelectorAll('.filter-toggle').forEach(btn => {
        btn.classList.add('active');
    });
    updateFilterCounters();  // Обновляем счётчики после активации
}

function showTempMessage() {
    if (!tempMessage) return;
    let msg;
    if (currentLang === 'ru') {
        msg = "Нажмите 'Загрузить Маркеры Сообщества', чтобы показать найденные.";
    } else if (currentLang === 'zh') {
        msg = "按 '加载社区标记' 以显示找到的标记";
    } else {
        msg = "Press 'Load Community Markers' to display found ones.";
    }
    tempMessage.textContent = msg;
    tempMessage.classList.add('show');
    setTimeout(() => {
        tempMessage.classList.remove('show');
    }, 5000);
}

function loadCommunityMarkers() {
    if (!currentMap) return;
    const url = COMMUNITY_URLS[currentMap];
    saveStatus.textContent = translations[currentLang].loading_community;
    loadCommunityBtn.disabled = true;
    fetch(url).then(r => r.json()).then(data => {
        if (Array.isArray(data)) { 
            markers = data; 
            saveMarkers(); 
            draw(); 
            updateFilterCounters();
            saveStatus.textContent = translations[currentLang].community_loaded; 
        } else throw new Error("Invalid data");
    }).catch(err => { 
        console.error(err); 
        saveStatus.textContent = translations[currentLang].community_error; 
    }).finally(() => {
        setTimeout(() => saveStatus.textContent = translations[currentLang].saved, 2000); 
        loadCommunityBtn.disabled = false;
    });
}

/* === ПЕРЕОПРЕДЕЛЁМ toggleUI === */
function toggleUI() {
    if (!uiPanel) return;

    isUIPanelOpen = !isUIPanelOpen;

    // Управляем display и классом .visible
    if (isUIPanelOpen) {
        uiPanel.style.display = 'flex';
        uiPanel.classList.add('visible');
    } else {
        uiPanel.style.display = 'none';
        uiPanel.classList.remove('visible');
    }
}

function resize() { 
    if (!canvas) return; 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    draw(); 
}

function draw() {
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); 
    ctx.translate(offsetX, offsetY); 
    ctx.scale(scale, scale);

    const startCol = Math.max(0, Math.floor(-offsetX / scale / TILE_SIZE));
    const endCol = Math.min(TILE_COUNT, Math.ceil((canvas.width - offsetX) / scale / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(-offsetY / scale / TILE_SIZE));
    const endRow = Math.min(TILE_COUNT, Math.ceil((canvas.height - offsetY) / scale / TILE_SIZE));

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const num = row * TILE_COUNT + col + 1;
            const img = tiles[num];
            if (img && img.complete) ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            else { ctx.fillStyle = '#222'; ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE); }
        }
    }

    if (document.getElementById('showGrid').checked) {
        ctx.strokeStyle = 'rgba(0,255,0,0.3)'; 
        ctx.lineWidth = 1 / scale;
        for (let i = 0; i <= TILE_COUNT; i++) { 
            const p = i * TILE_SIZE;
            ctx.beginPath(); 
            ctx.moveTo(p, 0); ctx.lineTo(p, MAP_SIZE);
            ctx.moveTo(0, p); ctx.lineTo(MAP_SIZE, p); 
            ctx.stroke();
        }
    }
    ctx.restore();
    drawMarkers();
}

function drawMarkers() {
    document.querySelectorAll('.marker').forEach(m => m.remove());
    const container = document.getElementById('container');

    markers.forEach((m, i) => {
        const filterBtn = document.querySelector(`.filter-toggle[data-type="${m.type}"]`);
        if (!filterBtn?.classList.contains('active')) return;

        // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: считаем координаты ОТНОСИТЕЛЬНО container, а не экрана
        const x = m.x * scale + offsetX;
        const y = m.y * scale + offsetY;

        // Проверяем, попадает ли маркер в видимую область (с небольшим запасом)
        if (x > -100 && x < canvas.width + 100 && y > -100 && y < canvas.height + 100) {
			const el = document.createElement('div');
            el.className = `marker ${m.type}`;
            
            // === ДОБАВЛЯЕМ КЛАСС ПО T ===
			if (m.T === "0") el.classList.add('t0');
            else if (m.T === "1") el.classList.add('t1');
            else if (m.T === "2") el.classList.add('t2');
            else if (m.T === "3") el.classList.add('t3');
			else if (m.T === "9") el.classList.add('t9');
            // ==============================

            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.dataset.index = i;
            el.title = `${m.title}\nTile: [${Math.floor(m.x / TILE_SIZE)}, ${Math.floor(m.y / TILE_SIZE)}]`;

            el.onclick = e => {
                e.stopPropagation();
                const newTitle = prompt("Название:", m.title);
                if (newTitle !== null) {
                    m.title = newTitle.trim() || 'Marker';
                    saveMarkers();
                    draw();
                }
            };

            el.oncontextmenu = e => {
                e.preventDefault();
                if (confirm(`Удалить "${m.title}"?`)) {
                    markers.splice(i, 1);
                    saveMarkers();
                    draw();
                }
            };

            container.appendChild(el);
        }
    });
}

function saveMarkers() {
    localStorage.setItem(`map-markers-v10-map${currentMap}`, JSON.stringify(markers));
    saveStatus.textContent = translations[currentLang].saved;
    setTimeout(() => saveStatus.textContent = translations[currentLang].saved, 1000);
    updateFilterCounters();
}
/* ============================= СОБЫТИЯ ============================= */
function initEvents() {
    document.getElementById('showGrid').addEventListener('change', draw);
    loadCommunityBtn.onclick = loadCommunityMarkers;

    // === КНОПКИ МЕТОК ===
    addMarkerBtn.onclick = () => { dialog.style.display = 'block'; addMarkerBtn.disabled = true; };
    closeDialog.onclick = () => { dialog.style.display = 'none'; addMarkerBtn.disabled = false; placingMarker = null; };

    document.querySelectorAll('.marker-option').forEach(opt => {
        opt.onclick = () => {
            const type = opt.dataset.type;
            placingMarker = {type, title: markerTypes[type].title()};
            dialog.style.display = 'none';
            addMarkerBtn.disabled = false;
            alert(`Выбрано: ${markerTypes[type].title()}\nКликните по карте!`);
        };
    });

document.querySelectorAll('.filter-toggle').forEach(btn => {
    btn.onclick = () => {
btn.classList.toggle('active');
updateFilterCounters();   // ← теперь всё делает эта функция
draw(); // Обновляем карту (скрываем/показываем маркеры)
    };
});

    /* === МЫШЬ === */
    canvas.addEventListener('mousedown', e => {
        if (e.button !== 0 || placingMarker) return;
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', e => {
        if (!isDragging && !placingMarker) {
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left - offsetX) / scale;
            const my = (e.clientY - rect.top - offsetY) / scale;
            if (mx >= 0 && mx < MAP_SIZE && my >= 0 && my < MAP_SIZE) {
                const tileX = Math.floor(mx / TILE_SIZE), tileY = Math.floor(my / TILE_SIZE);
                tileCoordsEl.textContent = `[${tileX}, ${tileY}]`;
                pixelCoordsEl.textContent = `(${Math.round(mx)}, ${Math.round(my)})`;
            } else {
                tileCoordsEl.textContent = `[--, --]`;
                pixelCoordsEl.textContent = `( --, -- )`;
            }
        }

        if (isDragging) {
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
            draw();
        }
    });

    canvas.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; canvas.style.cursor = 'grab'; });

    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.8 : 1.25;
        const newScale = Math.max(0.1, Math.min(20, scale * delta));
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        offsetX = mx - (mx - offsetX) * (newScale / scale);
        offsetY = my - (my - offsetY) * (newScale / scale);
        scale = newScale;
        zoomEl.textContent = scale.toFixed(1) + 'x';
        draw();
    }, {passive: false});

/* === ТАЧ === */
let prevPinchDist = 0;

canvas.addEventListener('touchstart', e => {
    if (!canvas || placingMarker) return;
    e.preventDefault();
    const touches = e.touches;
    const rect = canvas.getBoundingClientRect();
    if (touches.length === 1) {
        const t = touches[0];
        isDragging = true;
        startX = t.clientX - offsetX;
        startY = t.clientY - offsetY;
        canvas.style.cursor = 'grabbing';
    } else if (touches.length === 2) {
        isDragging = false;
        const t1 = touches[0], t2 = touches[1];
        prevPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    if (!canvas || placingMarker) return;
    e.preventDefault();
    const touches = e.touches;
    const rect = canvas.getBoundingClientRect();
    if (touches.length === 1 && isDragging) {
        const t = touches[0];
        offsetX = t.clientX - startX;
        offsetY = t.clientY - startY;
        // Update coordinates for single touch move (similar to mousemove)
        const mx = (t.clientX - rect.left - offsetX) / scale;
        const my = (t.clientY - rect.top - offsetY) / scale;
        if (mx >= 0 && mx < MAP_SIZE && my >= 0 && my < MAP_SIZE) {
            const tileX = Math.floor(mx / TILE_SIZE), tileY = Math.floor(my / TILE_SIZE);
            tileCoordsEl.textContent = `[${tileX}, ${tileY}]`;
            pixelCoordsEl.textContent = `(${Math.round(mx)}, ${Math.round(my)})`;
        } else {
            tileCoordsEl.textContent = `[--, --]`;
            pixelCoordsEl.textContent = `( --, -- )`;
        }
        draw();
    } else if (touches.length === 2 && prevPinchDist > 0) {
        const t1 = touches[0], t2 = touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const delta = currentDist / prevPinchDist;
        const cx = (t1.clientX + t2.clientX) / 2 - rect.left;
        const cy = (t1.clientY + t2.clientY) / 2 - rect.top;
        // World coordinates before zoom
        const wx = (cx - offsetX) / scale;
        const wy = (cy - offsetY) / scale;
        // Apply incremental zoom
        scale *= delta;
        scale = Math.max(0.1, Math.min(20, scale));
        // Adjust offset to keep the point under the center fixed
        offsetX = cx - wx * scale;
        offsetY = cy - wy * scale;
        zoomEl.textContent = scale.toFixed(1) + 'x';
        prevPinchDist = currentDist;
        draw();
    }
}, { passive: false });

canvas.addEventListener('touchend', e => {
    if (!canvas) return;
    const touches = e.touches;
    if (touches.length === 0) {
        isDragging = false;
        canvas.style.cursor = 'grab';
        prevPinchDist = 0;
    } else if (touches.length === 1 && !isDragging) {
        // If transitioning from pinch to single touch, start dragging from current position
        const t = touches[0];
        startX = t.clientX - offsetX;
        startY = t.clientY - offsetY;
        isDragging = true;
    }
});
    /* === КЛИК ПО КАРТЕ ДЛЯ МЕТКИ === */
    canvas.addEventListener('click', e => {
        if (!placingMarker) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left - offsetX) / scale;
        const my = (e.clientY - rect.top - offsetY) / scale;
        if (mx >= 0 && mx < MAP_SIZE && my >= 0 && my < MAP_SIZE) {
            const title = prompt("Название:", placingMarker.title) || placingMarker.title;
            markers.push({x: Math.round(mx), y: Math.round(my), title, type: placingMarker.type});
            saveMarkers();
            draw();
            placingMarker = null;
            addMarkerBtn.disabled = false;
            dialog.style.display = 'none';
        }
    });
    window.addEventListener('resize', resize);

    // Экспорт/Импорт
exportBtn.onclick = () => {
    const formatted = '[\n' + 
        markers.map(m => 
            JSON.stringify(m)
        ).join(',\n') + 
        '\n]';

    const blob = new Blob([formatted], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markers-map${currentMap}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

    document.getElementById('importBtn').onclick = () => importFile.click();
    importFile.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const imported = JSON.parse(ev.target.result);
                if (Array.isArray(imported) && confirm(`Импортировать ${imported.length} меток?`)) {
                    markers = imported; 
                    saveMarkers(); 
                    draw();
                }
            } catch(err) { alert('Неверный JSON'); }
        };
        reader.readAsText(file);
        importFile.value = '';
    };

    clearAllBtn.onclick = () => { 
        if (confirm('Удалить все метки?')) { 
            markers = []; 
            saveMarkers(); 
            draw(); 
        }
    };
}

// === ИМИТАЦИЯ :active для тач ===
document.addEventListener('touchstart', e => {
  const btn = e.target.closest('button, .filter-toggle, #openUI');  // УБРАЛИ #uiToggle
  if (btn) btn.classList.add('touched');
}, {passive: true});

document.addEventListener('touchend', e => {
  const btn = e.target.closest('button, .filter-toggle, #openUI');  // УБРАЛИ #uiToggle
  if (btn) {
    btn.classList.remove('touched');
  }
}, {passive: true});

// === ПОЛНАЯ БЛОКИРОВКА СИСТЕМНОГО ЗУМА ===
document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', e => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Блокировка gesture (iOS)
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
document.addEventListener('gestureend', e => e.preventDefault(), { passive: false });

let lastTap = 0;
document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300) {
        e.preventDefault();
    }
    lastTap = now;
}, { passive: false });




