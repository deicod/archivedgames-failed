package rate

import (
	"errors"
	"os"
	"strconv"
	"sync"
	"time"
)

type Limiter struct {
    mu sync.Mutex
    // key -> counter
    hour map[string]*counter
    day  map[string]*counter
    min  map[string]*counter
    // caps
    anonMBPerDay         int64
    anonDownloadsPerHour int64
    userMBPerDay         int64
    userDownloadsPerHour int64
    anonCommentsPerMin   int64
    userCommentsPerMin   int64
}

type counter struct {
	used int64
	end  time.Time
}

func getInt64Env(key string, def int64) int64 {
	v, err := strconv.ParseInt(os.Getenv(key), 10, 64)
	if err != nil {
		return def
	}
	return v
}

func NewFromEnv() *Limiter {
    return &Limiter{
        hour:                 make(map[string]*counter),
        day:                  make(map[string]*counter),
        min:                  make(map[string]*counter),
        anonMBPerDay:         getInt64Env("RATE_LIMIT_ANON_MB_PER_DAY", 500),
        anonDownloadsPerHour: getInt64Env("RATE_LIMIT_ANON_DOWNLOADS_PER_HOUR", 8),
        userMBPerDay:         getInt64Env("RATE_LIMIT_USER_MB_PER_DAY", 2048),
        userDownloadsPerHour: getInt64Env("RATE_LIMIT_USER_DOWNLOADS_PER_HOUR", 20),
        anonCommentsPerMin:   getInt64Env("RATE_LIMIT_ANON_COMMENTS_PER_MIN", 5),
        userCommentsPerMin:   getInt64Env("RATE_LIMIT_USER_COMMENTS_PER_MIN", 15),
    }
}

var (
    ErrTooManyDownloads = errors.New("download rate limit exceeded")
    ErrTooMuchData      = errors.New("daily data cap exceeded")
    ErrTooManyComments  = errors.New("comment rate limit exceeded")
)

func (l *Limiter) AllowDownload(userID, ip string, sizeBytes int64) error {
	l.mu.Lock()
	defer l.mu.Unlock()
	key := "ip:" + ip
	capCount := l.anonDownloadsPerHour
	capBytes := l.anonMBPerDay * 1024 * 1024
	if userID != "" {
		key = "user:" + userID
		capCount = l.userDownloadsPerHour
		capBytes = l.userMBPerDay * 1024 * 1024
	}
	now := time.Now()
	// Hour bucket
	hc := l.hour[key]
	if hc == nil || now.After(hc.end) {
		hc = &counter{used: 0, end: now.Truncate(time.Hour).Add(time.Hour)}
		l.hour[key] = hc
	}
	if hc.used+1 > capCount {
		return ErrTooManyDownloads
	}
	// Day bucket
	dc := l.day[key]
	if dc == nil || now.After(dc.end) {
		// end at next midnight
		t := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).Add(24 * time.Hour)
		dc = &counter{used: 0, end: t}
		l.day[key] = dc
	}
	if dc.used+sizeBytes > capBytes {
		return ErrTooMuchData
	}
	// consume
	hc.used += 1
	dc.used += sizeBytes
	return nil
}

// AllowComment enforces a per-minute comment cap per user/ip.
func (l *Limiter) AllowComment(userID, ip string) error {
    l.mu.Lock()
    defer l.mu.Unlock()
    key := "ip:" + ip
    capCount := l.anonCommentsPerMin
    if userID != "" {
        key = "user:" + userID
        capCount = l.userCommentsPerMin
    }
    now := time.Now()
    mc := l.min[key]
    if mc == nil || now.After(mc.end) {
        mc = &counter{used: 0, end: now.Truncate(time.Minute).Add(time.Minute)}
        l.min[key] = mc
    }
    if mc.used+1 > capCount {
        return ErrTooManyComments
    }
    mc.used += 1
    return nil
}
