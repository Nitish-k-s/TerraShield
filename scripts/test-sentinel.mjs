const key = "PLAK47103fdd8f9045abba468c97b025b079";

const payload = {
    input: {
        bounds: { bbox: [76.59, 11.62, 76.60, 11.63] },
        data: [{ type: "sentinel-2-l2a", dataFilter: { mosaickingOrder: "leastCC" } }]
    },
    aggregation: {
        timeRange: { from: "2026-03-01T00:00:00Z", to: "2026-04-01T00:00:00Z" },
        aggregationInterval: { of: "P30D" },
        evalscript: `//VERSION=3
function setup() { return { input: [{ bands: ["B04","B08","dataMask"] }], output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" }, { id: "dataMask", bands: 1 }] }; }
function evaluatePixel(s) { var d = s.B08 + s.B04; return { ndvi: [d > 0 ? (s.B08 - s.B04) / d : 0], dataMask: [s.dataMask] }; }`,
        resx: 10, resy: 10
    }
};

const res = await fetch("https://services.sentinel-hub.com/api/v1/statistics", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
});

console.log("Status:", res.status);
const text = await res.text();
console.log("Response:", text.slice(0, 500));
