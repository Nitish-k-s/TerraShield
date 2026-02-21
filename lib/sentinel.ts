/**
 * lib/sentinel.ts
 *
 * Core Sentinel Hub client for TerraShield's satellite validation module.
 *
 * Responsibilities:
 *  1. OAuth2 authentication (with token caching)
 *  2. Bounding-box generation from a GPS coordinate (~200 m radius)
 *  3. Current NDVI fetch (last 30 days) via Statistical API
 *  4. Historical NDVI fetch (90–31 days ago) for baseline
 *  5. Anomaly calculation, normalisation (0–1), and risk classification
 *  6. Result caching (in-memory Map, 5-minute TTL)
 *
 * API keys are read exclusively from process.env and are never forwarded
 * to the browser.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SentinelResult {
    current_ndvi: number;        // NDVI mean for the last 30 days
    historical_ndvi: number;        // NDVI mean for the prior 3-month baseline
    anomaly_score: number;        // Normalised 0–1 departure from baseline
    risk_level: RiskLevel;     // Human-readable classification
    /** Extra diagnostics — not required by spec but useful for debugging */
    meta: {
        bbox: number[];   // [minLng, minLat, maxLng, maxLat]
        current_period: { from: string; to: string };
        historical_period: { from: string; to: string };
        cloud_coverage_pct: number | null;
        cached: boolean;
    };
}

export type RiskLevel =
    | "Low Vegetation Anomaly"
    | "Moderate Vegetation Anomaly"
    | "High Vegetation Anomaly";

// ─── Constants ────────────────────────────────────────────────────────────────

const SENTINEL_AUTH_URL = "https://services.sentinel-hub.com/oauth/token";
const SENTINEL_STATS_URL = "https://services.sentinel-hub.com/api/v1/statistics";

/** Square half-side in decimal degrees (~200 m at mid-latitudes). */
const BBOX_DELTA = 0.001; // ≈ 111 m per 0.001°

/** Result cache TTL in milliseconds. */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Round cache key to 3 decimal places (~111 m resolution). */
const CACHE_PRECISION = 3;

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

interface CacheEntry {
    result: SentinelResult;
    expiresAt: number;  // Date.now() + CACHE_TTL_MS
}

const resultCache = new Map<string, CacheEntry>();

function buildCacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(CACHE_PRECISION)},${lng.toFixed(CACHE_PRECISION)}`;
}

function getCached(lat: number, lng: number): SentinelResult | null {
    const key = buildCacheKey(lat, lng);
    const entry = resultCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        resultCache.delete(key);
        return null;
    }
    return { ...entry.result, meta: { ...entry.result.meta, cached: true } };
}

function setCached(lat: number, lng: number, result: SentinelResult): void {
    const key = buildCacheKey(lat, lng);
    resultCache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Token Cache ──────────────────────────────────────────────────────────────

interface TokenEntry {
    token: string;
    expiresAt: number;
}

let tokenCache: TokenEntry | null = null;

async function getAccessToken(): Promise<string> {
    // Return a cached token if still valid (with 30 s buffer)
    if (tokenCache && Date.now() < tokenCache.expiresAt - 30_000) {
        return tokenCache.token;
    }

    const clientId = process.env.SENTINEL_CLIENT_ID;
    const clientSecret = process.env.SENTINAL_CLIENT_SECRET; // note: env key uses "SENTINAL"

    if (!clientId || !clientSecret) {
        throw new Error(
            "Missing Sentinel Hub credentials. " +
            "Set SENTINEL_CLIENT_ID and SENTINAL_CLIENT_SECRET in .env.local."
        );
    }

    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
    });

    const res = await fetch(SENTINEL_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Sentinel Hub auth failed (${res.status}): ${errText}`);
    }

    const json = await res.json() as { access_token: string; expires_in: number };

    tokenCache = {
        token: json.access_token,
        expiresAt: Date.now() + json.expires_in * 1000,
    };

    return tokenCache.token;
}

// ─── Bounding Box ─────────────────────────────────────────────────────────────

/**
 * Builds a [minLng, minLat, maxLng, maxLat] bounding box
 * of roughly 200 m × 200 m around the given coordinate.
 */
function buildBbox(lat: number, lng: number): [number, number, number, number] {
    return [
        +(lng - BBOX_DELTA).toFixed(6),
        +(lat - BBOX_DELTA).toFixed(6),
        +(lng + BBOX_DELTA).toFixed(6),
        +(lat + BBOX_DELTA).toFixed(6),
    ];
}

// ─── Evalscript ───────────────────────────────────────────────────────────────

/**
 * Evalscript compatible with the Sentinel Hub Statistical API.
 * Computes per-pixel NDVI and outputs float32 statistics.
 * Uses dataMask to exclude no-data / cloud-masked pixels.
 */
const NDVI_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "ndvi",     bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}

function evaluatePixel(sample) {
  var denom = sample.B08 + sample.B04;
  var ndvi  = denom > 0 ? (sample.B08 - sample.B04) / denom : 0.0;
  return {
    ndvi:     [ndvi],
    dataMask: [sample.dataMask]
  };
}
`;

// ─── Statistical API fetch ────────────────────────────────────────────────────

interface StatResult {
    mean: number | null;
    noDataFraction: number | null;   // 0–1; high = cloudy / invalid
}

async function fetchNdviStats(
    token: string,
    bbox: [number, number, number, number],
    fromDate: string,   // ISO date, e.g. "2025-01-01"
    toDate: string,
): Promise<StatResult> {
    const payload = {
        input: {
            bounds: { bbox },
            data: [{
                type: "sentinel-2-l2a",
                dataFilter: {
                    mosaickingOrder: "leastCC",    // prefer least cloud cover
                    maxCloudCoverage: 80,           // skip heavily clouded scenes
                },
            }],
        },
        aggregation: {
            timeRange: {
                from: `${fromDate}T00:00:00Z`,
                to: `${toDate}T23:59:59Z`,
            },
            aggregationInterval: {
                of: "P1D",  // daily mosaics → averaged over the window
            },
            evalscript: NDVI_EVALSCRIPT,
            resx: 10,   // 10m resolution (Sentinel-2 native)
            resy: 10,
        },
        calculations: {
            ndvi: { histogramBins: null },
        },
    };

    const res = await fetch(SENTINEL_STATS_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Statistical API error (${res.status}): ${errText}`);
    }

    const json = await res.json() as {
        data: Array<{
            interval?: { from: string; to: string };
            outputs?: {
                ndvi?: {
                    bands?: {
                        B0?: {
                            stats?: {
                                mean?: number;
                                noDataCount?: number;
                                sampleCount?: number;
                            };
                        };
                    };
                };
            };
        }>;
    };

    const intervals = json.data ?? [];
    if (intervals.length === 0) {
        return { mean: null, noDataFraction: null };
    }

    // Aggregate across daily intervals — weighted average by valid pixel count
    let totalWeightedNdvi = 0;
    let totalValidPixels = 0;
    let totalNoData = 0;
    let totalSamples = 0;

    for (const interval of intervals) {
        const stats = interval.outputs?.ndvi?.bands?.B0?.stats;
        if (!stats) continue;

        const mean = stats.mean ?? null;
        const noData = stats.noDataCount ?? 0;
        const sampleCount = stats.sampleCount ?? 0;
        const validPixels = sampleCount - noData;

        if (mean !== null && validPixels > 0) {
            totalWeightedNdvi += mean * validPixels;
            totalValidPixels += validPixels;
        }
        totalNoData += noData;
        totalSamples += sampleCount;
    }

    const aggregatedMean = totalValidPixels > 0
        ? totalWeightedNdvi / totalValidPixels
        : null;

    const noDataFraction = totalSamples > 0
        ? totalNoData / totalSamples
        : null;

    return {
        mean: aggregatedMean !== null ? +aggregatedMean.toFixed(4) : null,
        noDataFraction: noDataFraction !== null ? +noDataFraction.toFixed(3) : null,
    };
}

// ─── Anomaly calculation ──────────────────────────────────────────────────────

/**
 * Computes a normalised anomaly score in [0, 1].
 *
 * Logic:
 *   raw_anomaly = |current_ndvi − historical_ndvi|
 *
 *   We normalise against a maximum expected departure of 0.5 NDVI units
 *   (a departure beyond that indicates near-total vegetation loss / gain).
 *
 *   score = clamp(raw_anomaly / 0.5, 0, 1)
 *
 * Positive anomaly  → current NDVI above baseline → unusual growth (potential invasive)
 * Negative anomaly  → current NDVI below baseline → die-back / disturbance
 * Both are ecologically significant.
 */
const MAX_EXPECTED_DEPARTURE = 0.5;

function computeAnomalyScore(current: number, historical: number): number {
    const raw = Math.abs(current - historical);
    const score = Math.min(raw / MAX_EXPECTED_DEPARTURE, 1);
    return +score.toFixed(4);
}

function classifyRisk(score: number): RiskLevel {
    if (score < 0.33) return "Low Vegetation Anomaly";
    if (score < 0.66) return "Moderate Vegetation Anomaly";
    return "High Vegetation Anomaly";
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export class SentinelNoDataError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SentinelNoDataError";
    }
}

/**
 * Main entry point. Fetches current + historical NDVI for a coordinate,
 * computes the vegetation anomaly, and returns a structured result.
 *
 * Results are cached for 5 minutes keyed by rounded coordinate.
 */
export async function validateVegetationAnomaly(
    lat: number,
    lng: number,
): Promise<SentinelResult> {
    // 1. Cache hit?
    const cached = getCached(lat, lng);
    if (cached) return cached;

    // 2. Date windows
    const today = new Date();
    const currentFrom = daysAgo(30);
    const historicalFrom = daysAgo(120); // 90-day baseline starts 4 months ago
    const historicalTo = daysAgo(31);  // ends just before the current window

    // 3. Build bbox and authenticate in parallel
    const bbox = buildBbox(lat, lng);
    const token = await getAccessToken();

    // 4. Fetch current + historical NDVI concurrently
    const [currentStats, historicalStats] = await Promise.all([
        fetchNdviStats(token, bbox, isoDate(currentFrom), isoDate(today)),
        fetchNdviStats(token, bbox, isoDate(historicalFrom), isoDate(historicalTo)),
    ]);

    // 5. Validate — handle no-data / heavy cloud cover
    const cloudPct = currentStats.noDataFraction != null
        ? +(currentStats.noDataFraction * 100).toFixed(1)
        : null;

    if (currentStats.mean === null) {
        throw new SentinelNoDataError(
            "No valid NDVI data for the current period. " +
            "This is likely due to persistent cloud cover or no available imagery. " +
            (cloudPct !== null ? `Estimated cloud/no-data coverage: ${cloudPct}%.` : "")
        );
    }

    if (historicalStats.mean === null) {
        throw new SentinelNoDataError(
            "No valid historical NDVI baseline available for this location. " +
            "Cannot compute anomaly without a 3-month reference."
        );
    }

    // 6. Anomaly + classification
    const anomalyScore = computeAnomalyScore(currentStats.mean, historicalStats.mean);
    const riskLevel = classifyRisk(anomalyScore);

    const result: SentinelResult = {
        current_ndvi: currentStats.mean,
        historical_ndvi: historicalStats.mean,
        anomaly_score: anomalyScore,
        risk_level: riskLevel,
        meta: {
            bbox,
            current_period: { from: isoDate(currentFrom), to: isoDate(today) },
            historical_period: { from: isoDate(historicalFrom), to: isoDate(historicalTo) },
            cloud_coverage_pct: cloudPct,
            cached: false,
        },
    };

    // 7. Store in cache
    setCached(lat, lng, result);

    return result;
}
