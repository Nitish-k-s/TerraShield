# TerraShield

A Next.js application with a backend API for extracting **EXIF metadata** (including GPS latitude & longitude) from uploaded images.

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Framework | Next.js 14 (App Router)                 |
| Runtime   | Node.js                                 |
| EXIF      | [`exifr`](https://github.com/MikeKovarik/exifr) |
| Upload    | [`formidable`](https://github.com/node-formidable/formidable) |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

The dev server starts at **http://localhost:3000**.

---

## 📡 API Reference

### `POST /api/extract-exif`

Extracts EXIF metadata, GPS coordinates, and a Google Maps link from an uploaded image.

#### Request

| Field         | Type   | Description                              |
| ------------- | ------ | ---------------------------------------- |
| `image`       | `File` | The image file (JPEG, HEIC, TIFF, PNG …) |

Send as `multipart/form-data`.

#### Example — cURL

```bash
curl -X POST http://localhost:3000/api/extract-exif \
  -F "image=@/path/to/your/photo.jpg"
```

#### Example — JavaScript `fetch`

```js
const formData = new FormData();
formData.append("image", fileInput.files[0]);

const res = await fetch("/api/extract-exif", {
  method: "POST",
  body: formData,
});
const data = await res.json();

console.log(data.gps.latitude);   // e.g. 48.8584
console.log(data.gps.longitude);  // e.g. 2.2945
console.log(data.mapsUrl);        // "https://www.google.com/maps?q=48.8584,2.2945"
```

#### Response Schema

```jsonc
{
  "success": true,
  "filename": "photo.jpg",
  "mimeType": "image/jpeg",
  "gps": {
    "latitude": 48.8584,       // decimal degrees (positive = N, negative = S)
    "longitude": 2.2945,       // decimal degrees (positive = E, negative = W)
    "altitude": 35.0,          // metres above sea level (can be null)
    "latitudeRef": "N",        // "N" | "S" | null
    "longitudeRef": "E"        // "E" | "W" | null
  },
  "allTags": { /* full flat map of every EXIF tag exifr could read */ },
  "mapsUrl": "https://www.google.com/maps?q=48.8584,2.2945"
}
```

If the image has **no GPS data**, `gps` values will be `null` and `mapsUrl` will be `null`.

#### Error Response

```jsonc
{
  "success": false,
  "error": "No file found. Make sure the form field name is \"image\"."
}
```

---

## 📂 Project Structure

```
TerraShield/
├── app/
│   └── api/
│       └── extract-exif/
│           └── route.ts      ← EXIF extraction API route
├── package.json
├── next.config.ts
└── README.md
```

---

## ⚠️ Notes

- Maximum upload size is **50 MB** (configurable in `route.ts`).
- The file is processed in-memory and the temp file is deleted after each request.
- Supports JPEG, HEIC, TIFF, PNG, WebP and most other common image formats via `exifr`.
- GPS coordinates are returned as **decimal degrees** (WGS84), ready for direct use in mapping APIs (Google Maps, Leaflet, Mapbox, etc.).
