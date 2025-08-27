# S3 Bucket & CORS Policy (Generic)

Use **pre‑signed GET/PUT** URLs; do **not** make the bucket public. Configure CORS to allow the SPA to upload images and fetch downloads via XHR.

---

## 1) CORS configuration (AWS S3 example)
Apply via AWS Console → S3 → Bucket → Permissions → **CORS configuration**.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://archivedgames.com",
      "http://localhost:5173"
    ],
    "ExposeHeaders": ["ETag", "x-amz-request-id", "x-amz-version-id"],
    "MaxAgeSeconds": 3000
  }
]
```

Notes:
- `PUT` is needed for **pre‑signed PUT** uploads.
- `GET` is needed if you fetch via XHR/fetch; for direct `<a>` downloads it’s not required, but harmless.
- `AllowedHeaders: ["*"]` covers `x-amz-*` headers present in presigned requests.

---

## 2) Block public access (recommended)
Disable public ACLs and policies, rely solely on presigned URLs.

- **Block Public Access (Bucket Settings)**: Turn **ON** all four toggles
- **Bucket policy**: none required; keep empty unless using deny/allow statements

Optional explicit deny (defense in depth):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyPublicRead",
      "Effect": "Deny",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::archivedgames/*",
      "Condition": {"Bool": {"aws:SecureTransport": "false"}}
    }
  ]
}
```

---

## 3) Key layout (suggested)
```
images/{gameXid}/cover.jpg
images/{gameXid}/gallery/{n}.jpg
files/{platform}/{slug}/{original_name}
```

---

## 4) CDN & Cache
- You may serve presigned GETs directly from S3 (short TTL) or via CDN
- For image GETs, consider normal public objects behind CDN + signed cookies (optional, later)

---

## 5) Troubleshooting
- **CORS errors on PUT**: ensure `AllowedHeaders` includes `*` or all `x-amz-*` used
- **Path‑style vs virtual‑hosted**: set `S3_FORCE_PATH_STYLE=true` for MinIO/compat providers
- **Clock skew** breaks presigned URLs: sync server time (NTP)
