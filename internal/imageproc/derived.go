package imageproc

import (
    "bytes"
    "context"
    "image"
    "image/jpeg"
    "strconv"
    "strings"

    "golang.org/x/image/draw"
    "github.com/deicod/archivedgames/internal/s3client"
)

// Derive creates scaled JPEGs at target widths preserving aspect ratio.
// Keys are derived by inserting _w{width} before the extension.
func Derive(ctx context.Context, s3 *s3client.Client, origKey string, widths []int) error {
    data, ctype, err := s3.Get(ctx, origKey)
    if err != nil {
        return err
    }
    // For now we assume JPEG input; other types may fail jpeg.Decode
    _ = ctype
    img, err := jpeg.Decode(bytes.NewReader(data))
    if err != nil {
        // if not jpeg, just skip silently
        return nil
    }
    b := img.Bounds()
    ow := b.Dx()
    oh := b.Dy()
    for _, w := range widths {
        if w <= 0 || ow == 0 || oh == 0 { continue }
        nh := int(float64(w) * float64(oh) / float64(ow))
        dst := image.NewRGBA(image.Rect(0, 0, w, nh))
        draw.ApproxBiLinear.Scale(dst, dst.Bounds(), img, b, draw.Over, nil)
        var buf bytes.Buffer
        _ = jpeg.Encode(&buf, dst, &jpeg.Options{Quality: 80})
        key := deriveKey(origKey, w)
        _ = s3.Put(ctx, key, buf.Bytes(), "image/jpeg", "public, max-age=31536000, immutable")
    }
    return nil
}

func deriveKey(orig string, w int) string {
    dot := strings.LastIndex(orig, ".")
    if dot <= 0 { return orig + "_w" + strconv.Itoa(w) }
    return orig[:dot] + "_w" + strconv.Itoa(w) + orig[dot:]
}

