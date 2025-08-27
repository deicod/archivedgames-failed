package ingest

import (
    "context"
    "crypto/sha256"
    "encoding/hex"
    "io"
    "os"
    "path/filepath"
    "regexp"
    "strings"

    "github.com/deicod/archivedgames/ent"
    "github.com/deicod/archivedgames/ent/file"
    "github.com/deicod/archivedgames/ent/game"
)

var (
    bracketed = regexp.MustCompile(`[\[\(\{][^\]\)\}]+[\]\)\}]`)
    multiSpace = regexp.MustCompile(`\s+`)
)

func normalizeTitle(name string) (title string, base string) {
    // drop extension
    base = name
    if i := strings.LastIndex(name, "."); i > 0 {
        base = name[:i]
    }
    // replace separators
    base = strings.ReplaceAll(base, "_", " ")
    base = strings.ReplaceAll(base, ".", " ")
    // remove bracketed tokens
    base = bracketed.ReplaceAllString(base, " ")
    // common tags
    lower := strings.ToLower(base)
    lower = strings.ReplaceAll(lower, "disk", "")
    lower = strings.ReplaceAll(lower, "side", "")
    // collapse spaces
    lower = strings.TrimSpace(multiSpace.ReplaceAllString(lower, " "))
    // title-case-ish: first letter upper of each word
    words := strings.Fields(lower)
    for i, w := range words {
        if len(w) > 0 { words[i] = strings.ToUpper(w[:1]) + w[1:] }
    }
    title = strings.Join(words, " ")
    return title, base
}

func guessFormat(filename string) string {
    ext := strings.ToLower(filepath.Ext(filename))
    if len(ext) > 0 { ext = ext[1:] }
    switch ext {
    case "d64", "t64", "prg", "tap", "crt":
        return ext
    case "adf", "ipf":
        return ext
    case "zip", "exe", "com", "img":
        return ext
    default:
        return ext
    }
}

func slugify(platform, title string) string {
    s := strings.ToLower(title)
    // replace non-alnum with hyphen
    out := make([]rune, 0, len(s))
    lastHyphen := false
    for _, r := range s {
        if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
            out = append(out, r)
            lastHyphen = false
        } else {
            if !lastHyphen {
                out = append(out, '-')
                lastHyphen = true
            }
        }
    }
    slug := strings.Trim(string(out), "-")
    if platform != "" {
        slug = platform + "/" + slug
    }
    return slug
}

// Scan walks the root dir and ingests files into the database.
// Expected structure: root/{c64,amiga,dos}/.../file.ext
func Scan(ctx context.Context, client *ent.Client, root string) error {
    return filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
        if err != nil { return err }
        if d.IsDir() { return nil }

        rel, _ := filepath.Rel(root, path)
        parts := strings.Split(rel, string(filepath.Separator))
        if len(parts) < 2 { return nil }
        platDir := strings.ToLower(parts[0])
        var plat game.Platform
        switch platDir {
        case "c64": plat = game.PlatformC64
        case "amiga": plat = game.PlatformAMIGA
        case "dos": plat = game.PlatformDOS
        default: return nil
        }

        fname := filepath.Base(path)
        title, _ := normalizeTitle(fname)
        if title == "" { title = strings.TrimSuffix(fname, filepath.Ext(fname)) }
        slug := slugify(platDir, title)

        // Find or create game by slug.
        g, err := client.Game.Query().Where(game.SlugEQ(slug)).Only(ctx)
        if err != nil {
            if ent.IsNotFound(err) {
                g, err = client.Game.Create().SetSlug(slug).SetPlatform(plat).SetTitle(title).Save(ctx)
                if err != nil { return err }
            } else {
                return err
            }
        }

        // Compute checksum and size.
        f, err := os.Open(path)
        if err != nil { return err }
        h := sha256.New()
        size, err := io.Copy(h, f)
        f.Close()
        if err != nil { return err }
        checksum := hex.EncodeToString(h.Sum(nil))

        // Check if a file with same checksum exists for this game.
        exists, err := client.File.Query().Where(file.ChecksumEQ(checksum), file.HasGameWith(game.ID(g.ID))).Exist(ctx)
        if err != nil { return err }
        if exists { return nil }

        // Create file row.
        _, err = client.File.Create().
            SetOriginalName(fname).
            SetNormalizedName(title).
            SetPath(filepath.ToSlash(rel)).
            SetChecksum(checksum).
            SetSizeBytes(size).
            SetFormat(guessFormat(fname)).
            SetSource("local").
            SetNeedsReview(false).
            SetGame(g).
            Save(ctx)
        return err
    })
}

