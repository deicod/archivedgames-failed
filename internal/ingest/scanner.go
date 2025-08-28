package ingest

import (
    "context"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "archive/zip"
    "io"
    "os"
    "path/filepath"
    "regexp"
    "strings"
    "strconv"

	"github.com/deicod/archivedgames/ent"
	"github.com/deicod/archivedgames/ent/file"
	"github.com/deicod/archivedgames/ent/game"
)

var (
    bracketed  = regexp.MustCompile(`[\[\(\{][^\]\)\}]+[\]\)\}]`)
    diskToken  = regexp.MustCompile(`(?i)(?:disk|d)\s*([0-9]+)|\b(?:side)\s*([ab])\b`)
    diskOfToken = regexp.MustCompile(`(?i)\b(?:disk|disc|d)\s*\d+\s*of\s*\d+`)
    yearToken  = regexp.MustCompile(`\b(19|20)\d{2}\b`)
    langToken  = regexp.MustCompile(`(?i)\b(EN|DE|FR|ES|IT|JP|US|UK)\b`)
    multiSpace = regexp.MustCompile(`\s+`)
)

// allowlists by platform (lowercase extensions without dot)
var (
    c64Exts  = map[string]bool{"d64": true, "t64": true, "prg": true, "tap": true, "crt": true, "zip": true}
    amigaExts = map[string]bool{"adf": true, "ipf": true, "dms": true, "lha": true}
    dosExts  = map[string]bool{"zip": true, "rar": true, "7z": true, "exe": true, "com": true, "img": true, "iso": true}
)

func isArchiveExt(ext string) bool {
    switch strings.ToLower(ext) {
    case "zip", "rar", "7z":
        return true
    default:
        return false
    }
}

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
    // strip typical tags
    base = diskOfToken.ReplaceAllString(base, " ")
    base = diskToken.ReplaceAllString(base, " ")
    base = yearToken.ReplaceAllString(base, " ")
    base = langToken.ReplaceAllString(base, " ")
	// common tags
	lower := strings.ToLower(base)
	lower = strings.ReplaceAll(lower, "disk", "")
	lower = strings.ReplaceAll(lower, "side", "")
	// collapse spaces
	lower = strings.TrimSpace(multiSpace.ReplaceAllString(lower, " "))
	// title-case-ish: first letter upper of each word
	words := strings.Fields(lower)
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(w[:1]) + w[1:]
		}
	}
	title = strings.Join(words, " ")
	return title, base
}

// parseDiskSide extracts a disk number and side label (A/B) from a filename.
// Returns nil for disk if not present and empty string for side if not present.
func parseDiskSide(name string) (disk *int, side string) {
    base := name
    if i := strings.LastIndex(base, "."); i > 0 {
        base = base[:i]
    }
    lower := strings.ToLower(base)
    lower = strings.ReplaceAll(lower, "_", " ")
    lower = strings.ReplaceAll(lower, "-", " ")
    lower = strings.ReplaceAll(lower, ".", " ")
    if m := diskToken.FindStringSubmatch(lower); len(m) == 3 {
        if m[1] != "" {
            if dn, err := strconv.Atoi(m[1]); err == nil && dn > 0 {
                disk = &dn
            }
        }
        if m[2] != "" {
            side = strings.ToUpper(m[2])
        }
    }
    return
}

func guessFormat(filename string) string {
    ext := strings.ToLower(filepath.Ext(filename))
    if len(ext) > 0 {
        ext = ext[1:]
    }
    switch ext {
    case "d64", "t64", "prg", "tap", "crt":
        return ext
    case "adf", "ipf", "dms", "lha":
        return ext
    case "zip", "rar", "7z", "exe", "com", "img", "iso":
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

// zipHasDOSExecutable inspects a .zip file and returns true if it contains
// at least one .exe or .com file entry (case-insensitive).
func zipHasDOSExecutable(zipPath string) bool {
    zr, err := zip.OpenReader(zipPath)
    if err != nil {
        return false
    }
    defer zr.Close()
    for _, f := range zr.File {
        // skip directories
        if f.FileInfo().IsDir() {
            continue
        }
        ext := strings.ToLower(filepath.Ext(f.Name))
        if ext == ".exe" || ext == ".com" {
            return true
        }
    }
    return false
}

// Scan walks the root dir and ingests files into the database.
// Expected structure: root/{c64,amiga,dos}/.../file.ext
type Options struct {
    Platform string // optional filter: c64|amiga|dos
    DryRun   bool
}

func Scan(ctx context.Context, client *ent.Client, root string, opts *Options) error {
	if opts == nil {
		opts = &Options{}
	}
	return filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}

		rel, _ := filepath.Rel(root, path)
		parts := strings.Split(rel, string(filepath.Separator))
		if len(parts) < 2 {
			return nil
		}
		platDir := strings.ToLower(parts[0])
		var plat game.Platform
		switch platDir {
		case "c64":
			plat = game.PlatformC64
		case "amiga":
			plat = game.PlatformAMIGA
		case "dos":
			plat = game.PlatformDOS
		default:
			return nil
		}
		if opts.Platform != "" && strings.ToLower(opts.Platform) != platDir {
			return nil
		}

        fname := filepath.Base(path)
        title, _ := normalizeTitle(fname)
        // extract disk/side tokens for labeling and fields
        diskNumPtr, sideLabel := parseDiskSide(fname)
        if title == "" {
            title = strings.TrimSuffix(fname, filepath.Ext(fname))
        }
        slug := slugify(platDir, title)
        // Group key used to tie multi-disk/side files for the same game title
        groupKey := fmt.Sprintf("%s:%s", platDir, slug)

		// Find or create game by slug.
		g, err := client.Game.Query().Where(game.SlugEQ(slug)).Only(ctx)
		if err != nil {
			if ent.IsNotFound(err) {
				if opts.DryRun {
					fmt.Printf("[DRY] create game: %s (%s)\n", title, platDir)
					// fake game record for dry-run association
					g = &ent.Game{ID: "dry-" + slug, Slug: slug}
				} else {
					g, err = client.Game.Create().SetSlug(slug).SetPlatform(plat).SetTitle(title).Save(ctx)
				}
				if err != nil {
					return err
				}
			} else {
				return err
			}
		}

		// Compute checksum and size.
		f, err := os.Open(path)
		if err != nil {
			return err
		}
		h := sha256.New()
		size, err := io.Copy(h, f)
		f.Close()
		if err != nil {
			return err
		}
		checksum := hex.EncodeToString(h.Sum(nil))

		// Check if a file with same checksum exists for this game.
		exists := false
		if !opts.DryRun {
			exists, err = client.File.Query().Where(file.ChecksumEQ(checksum), file.HasGameWith(game.ID(g.ID))).Exist(ctx)
			if err != nil {
				return err
			}
		}
		if exists {
			return nil
		}

        // Create file row.
        needsReview := false
        fmtStr := guessFormat(fname)
        if fmtStr == "" {
            needsReview = true
        }
        // platform-specific allowlist check
        allowed := false
        switch platDir {
        case "c64":
            allowed = c64Exts[fmtStr]
        case "amiga":
            allowed = amigaExts[fmtStr]
        case "dos":
            allowed = dosExts[fmtStr]
        }
        if !allowed {
            needsReview = true
        }
        // flag archive containers for review (unless DOS zip contains executables)
        if isArchiveExt(fmtStr) {
            needsReview = true
            if platDir == "dos" && fmtStr == "zip" {
                if zipHasDOSExecutable(path) {
                    needsReview = false
                }
            }
        }

        // normalized file label: include disk/side when detected
        normalizedName := title
        if diskNumPtr != nil && sideLabel != "" {
            normalizedName = fmt.Sprintf("%s (Disk %d, Side %s)", title, *diskNumPtr, sideLabel)
        } else if diskNumPtr != nil {
            normalizedName = fmt.Sprintf("%s (Disk %d)", title, *diskNumPtr)
        } else if sideLabel != "" {
            normalizedName = fmt.Sprintf("%s (Side %s)", title, sideLabel)
        }
        if opts.DryRun {
            fmt.Printf("[DRY] add file: %s size=%d fmt=%s game=%s set=%s review=%v label=\"%s\"\n", rel, size, fmtStr, g.Slug, groupKey, needsReview, normalizedName)
            return nil
        }
        fc := client.File.Create().
            SetOriginalName(fname).
            SetNormalizedName(normalizedName).
            SetPath(filepath.ToSlash(rel)).
            SetSetKey(groupKey).
            SetChecksum(checksum).
            SetSizeBytes(size).
            SetFormat(fmtStr).
            SetSource("local").
            SetNeedsReview(needsReview).
            SetGame(g)
        if diskNumPtr != nil {
            fc = fc.SetDiskNumber(*diskNumPtr)
        }
        if sideLabel != "" {
            fc = fc.SetSide(sideLabel)
        }
        _, err = fc.Save(ctx)
        return err
    })
}
