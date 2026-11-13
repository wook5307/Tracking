import VectorTileLayer from "ol/layer/VectorTile";
import { applyStyle } from "ol-mapbox-style";

export type BasemapTheme = "light" | "dark";

/**
 * OpenFreeMap(OpenMapTiles/OSM) 벡터 타일.
 * API 키·가입·요청 수 제한 없음, 상업적 사용 허용.
 *
 * 기존 CARTO(basemaps.cartocdn.com)는 키 없는 요청을 차단하고
 * "API KEY REQUIRED" 워터마크 타일을 내려주기 때문에 대체함.
 */
const STYLE_URL: Record<BasemapTheme, string> = {
    light: "https://tiles.openfreemap.org/styles/positron",
    dark: "https://tiles.openfreemap.org/styles/dark",
};

/**
 * 기존 CARTO 타일(rastertiles/voyager_nolabels, dark_nolabels)에서
 * 실제로 추출한 색상. 교체 후에도 화면 톤이 그대로 유지되도록 덮어쓴다.
 */
const PALETTE: Record<BasemapTheme, { land: string; water: string; line: string }> = {
    light: { land: "#fbf8f3", water: "#d5e8eb", line: "#e7e6e4" },
    dark: { land: "#090909", water: "#262626", line: "#171717" },
};

/** 우측 하단 'i' 버튼에 표시되는 저작권 문구. OSM 데이터 사용 조건. */
const ATTRIBUTION =
    '© <a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> ' +
    '© <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> ' +
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

type MapboxStyle = {
    /**
     * ol-mapbox-style이 내부 캐시 키로 쓰는 값.
     * 비워두면 라이브러리가 0부터 번호를 매기는데, 0은 falsey라 호출할 때마다
     * 다시 매겨지면서 캐시가 어긋난다. 직접 고유값을 넣어 고정한다.
     */
    id?: string;
    layers: {
        id: string;
        type: string;
        paint?: Record<string, unknown>;
    }[];
};

/**
 * applyStyle은 전달받은 스타일 객체를 내부에서 변형시킨다.
 * 같은 객체를 두 번 넘기면 렌더가 깨지므로 원본 JSON 문자열만 캐시하고
 * 호출할 때마다 새 객체를 만들어 넘긴다.
 */
const styleTextCache = new Map<BasemapTheme, Promise<string>>();
let styleSeq = 0;

function fetchStyleText(theme: BasemapTheme): Promise<string> {
    const cached = styleTextCache.get(theme);
    if (cached) return cached;

    const pending = fetch(STYLE_URL[theme]).then((res) => {
        if (!res.ok) throw new Error(`basemap style ${res.status}`);
        return res.text();
    });
    styleTextCache.set(theme, pending);
    return pending;
}

/** 스타일 JSON을 받아 라벨을 없애고 CARTO 팔레트로 색을 맞춘다. */
async function loadStyle(theme: BasemapTheme): Promise<MapboxStyle> {
    const style = JSON.parse(await fetchStyleText(theme)) as MapboxStyle;
    style.id = `ofm-${theme}-${++styleSeq}`;
    const { land, water, line } = PALETTE[theme];

    // nolabels: 텍스트/아이콘 레이어 전부 제거
    style.layers = style.layers.filter((l) => l.type !== "symbol");

    for (const l of style.layers) {
        if (l.id === "background") {
            l.paint = { ...l.paint, "background-color": land };
        } else if (l.id === "water") {
            l.paint = { ...l.paint, "fill-color": water };
        } else if (l.id === "waterway") {
            l.paint = { ...l.paint, "line-color": water };
        } else if (l.id.startsWith("boundary")) {
            l.paint = { ...l.paint, "line-color": line };
        }
    }
    return style;
}

/**
 * applyStyle을 같은 레이어에 동시에 두 번 호출하면 타일이 렌더되지 않는다.
 * (React StrictMode의 이펙트 2회 실행, 테마 연속 토글 등)
 * 레이어별로 적용을 직렬화하고 이미 적용된 테마는 건너뛴다.
 */
type LayerState = { desired: BasemapTheme; applied: BasemapTheme | null; queue: Promise<void> };
const layerStates = new WeakMap<VectorTileLayer, LayerState>();

/** 지도에 바로 넣을 수 있는 베이스맵 레이어를 만든다. */
export function createBasemapLayer(theme: BasemapTheme): VectorTileLayer {
    // 숨겨진 레이어는 타일을 요청하지 않는다. 스타일 함수가 붙기 전에 타일이
    // 도착하면 OL이 "그릴 것 없음"으로 캐시해 그 타일만 영구히 비어버리므로,
    // 스타일 적용이 끝난 뒤에 보이게 한다.
    const layer = new VectorTileLayer({ declutter: false, visible: false });
    void setBasemapTheme(layer, theme).then(() => layer.setVisible(true));
    return layer;
}

/** 베이스맵 레이어의 테마를 적용/교체한다. */
export function setBasemapTheme(layer: VectorTileLayer, theme: BasemapTheme): Promise<void> {
    let state = layerStates.get(layer);
    if (!state) {
        state = { desired: theme, applied: null, queue: Promise.resolve() };
        layerStates.set(layer, state);
    }
    const st = state;
    st.desired = theme;

    st.queue = st.queue
        .then(async () => {
            if (st.applied === st.desired) return;
            const target = st.desired;

            const style = await loadStyle(target);

            // background 레이어는 applyStyle이 칠해주지 않으므로 레이어 배경으로 직접 지정한다.
            layer.setBackground(() => PALETTE[target].land);

            await applyStyle(layer, style, {
                source: "openmaptiles",
                // light/dark 모두 같은 OpenMapTiles 소스를 쓴다.
                // 최초 1회만 소스를 만들고, 이후에는 스타일만 교체한다.
                updateSource: layer.getSource() === null,
            });

            // OSM 기반 데이터라 저작권 표기가 필요하다(지도 우측 하단 'i' 버튼).
            layer.getSource()?.setAttributions(ATTRIBUTION);

            st.applied = target;
        })
        .catch((e) => {
            console.error("[basemap] 스타일 적용 실패", e);
        });

    return st.queue;
}

/**
 * light/dark 레이어를 둘 다 미리 만들어 스타일까지 입혀둔다.
 * 두 레이어는 같은 VectorTileSource(디코딩된 PBF 벡터 타일)를 공유하므로
 * 타일 다운로드/디코딩은 한 번만 일어나고, light/dark는 그 위에 씌우는
 * 스타일(색상)만 다르다. 테마 전환은 setVisible 토글뿐이라 즉시 반영되고,
 * applyStyle 재계산이나 스타일 JSON 재파싱이 전혀 일어나지 않는다.
 */
export type BasemapLayers = {
    light: VectorTileLayer;
    dark: VectorTileLayer;
    /** 보여줄 테마를 즉시 전환한다(레이어 준비 전에 호출해도 준비되는 대로 반영됨). */
    setTheme: (theme: BasemapTheme) => void;
};

export function createBasemapLayers(initialTheme: BasemapTheme): BasemapLayers {
    const light = new VectorTileLayer({ declutter: false, visible: false });
    const dark = new VectorTileLayer({ declutter: false, visible: false });

    let desired: BasemapTheme = initialTheme;
    let ready = false;
    const applyVisibility = () => {
        light.setVisible(ready && desired === "light");
        dark.setVisible(ready && desired === "dark");
    };

    void (async () => {
        try {
            // 먼저 스타일을 입히는 레이어가 소스를 새로 만들고, 나머지는 그 소스를 공유한다.
            const firstTheme = initialTheme;
            const secondTheme: BasemapTheme = firstTheme === "light" ? "dark" : "light";
            const firstLayer = firstTheme === "light" ? light : dark;
            const secondLayer = firstTheme === "light" ? dark : light;

            const firstStyle = await loadStyle(firstTheme);
            firstLayer.setBackground(() => PALETTE[firstTheme].land);
            await applyStyle(firstLayer, firstStyle, { source: "openmaptiles", updateSource: true });

            const sharedSource = firstLayer.getSource();
            if (sharedSource) secondLayer.setSource(sharedSource);

            const secondStyle = await loadStyle(secondTheme);
            secondLayer.setBackground(() => PALETTE[secondTheme].land);
            await applyStyle(secondLayer, secondStyle, { source: "openmaptiles", updateSource: false });

            ready = true;
            applyVisibility();
        } catch (e) {
            console.error("[basemap] 스타일 적용 실패", e);
        }
    })();

    return {
        light,
        dark,
        setTheme(theme: BasemapTheme) {
            desired = theme;
            applyVisibility();
        },
    };
}
