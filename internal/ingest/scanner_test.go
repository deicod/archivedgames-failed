package ingest

import (
    "archive/zip"
    "os"
    "path/filepath"
    "testing"
)

func TestNormalizeTitle(t *testing.T) {
    cases := []struct{
        in string
        want string
    }{
        {"IK+ (1987) [cr-FLT].d64", "Ik+"},
        {"Monkey_Island_Disk_1_of_4 (EN).adf", "Monkey Island"},
        {"Last_Ninja_Side_B.t64", "Last Ninja"},
    }
    for _, c := range cases {
        got, _ := normalizeTitle(c.in)
        if got != c.want {
            t.Fatalf("normalizeTitle(%q) = %q, want %q", c.in, got, c.want)
        }
    }
}

func TestParseDiskSide(t *testing.T) {
    // Disk number only
    if dn, side := parseDiskSide("Monkey_Island_Disk_2_of_4.adf"); dn == nil || *dn != 2 || side != "" {
        if dn == nil {
            t.Fatalf("parseDiskSide: expected disk=2, got nil")
        }
        t.Fatalf("parseDiskSide: got disk=%v side=%q, want disk=2 side=\"\"", *dn, side)
    }
    // Side only
    if dn, side := parseDiskSide("Last_Ninja_Side_B.t64"); dn != nil || side != "B" {
        t.Fatalf("parseDiskSide: got disk=%v side=%q, want disk=nil side=\"B\"", dn, side)
    }
    // None
    if dn, side := parseDiskSide("IK+ (1987).d64"); dn != nil || side != "" {
        t.Fatalf("parseDiskSide: got disk=%v side=%q, want disk=nil side=\"\"", dn, side)
    }
}

func TestSlugify(t *testing.T) {
    if got := slugify("c64", "Ik Plus"); got != "c64/ik-plus" {
        t.Fatalf("slugify: got %q, want %q", got, "c64/ik-plus")
    }
}

func TestZipHasDOSExecutable(t *testing.T) {
    dir := t.TempDir()
    z1 := filepath.Join(dir, "withexe.zip")
    if err := writeZip(z1, map[string]string{
        "GAME/DOOM.EXE": "",
        "README.TXT": "hi",
    }); err != nil {
        t.Fatalf("writeZip: %v", err)
    }
    if !zipHasDOSExecutable(z1) {
        t.Fatalf("zipHasDOSExecutable: expected true for %s", z1)
    }
    z2 := filepath.Join(dir, "noexe.zip")
    if err := writeZip(z2, map[string]string{
        "docs/readme.txt": "hi",
        "assets/data.bin": "\x00\x01",
    }); err != nil {
        t.Fatalf("writeZip: %v", err)
    }
    if zipHasDOSExecutable(z2) {
        t.Fatalf("zipHasDOSExecutable: expected false for %s", z2)
    }
}

func writeZip(path string, files map[string]string) error {
    f, err := os.Create(path)
    if err != nil { return err }
    defer f.Close()
    zw := zip.NewWriter(f)
    for name, content := range files {
        w, err := zw.Create(name)
        if err != nil { return err }
        if _, err := w.Write([]byte(content)); err != nil { return err }
    }
    return zw.Close()
}

