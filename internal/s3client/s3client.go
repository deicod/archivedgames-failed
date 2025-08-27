package s3client

import (
    "context"
    "errors"
    "net/url"
    "os"
    "strconv"
    "time"

    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/credentials"
    awss3 "github.com/aws/aws-sdk-go-v2/service/s3"
    s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type Client struct {
    Bucket  string
    S3      *awss3.Client
    Presign *awss3.PresignClient
}

func getenv(key, def string) string {
    if v := os.Getenv(key); v != "" { return v }
    return def
}

func getbool(key string, def bool) bool {
    if v := os.Getenv(key); v != "" {
        b, _ := strconv.ParseBool(v)
        return b
    }
    return def
}

// New creates an S3 client using env vars: S3_ENDPOINT, S3_REGION, S3_BUCKET,
// S3_ACCESS_KEY, S3_SECRET_KEY, S3_FORCE_PATH_STYLE, S3_USE_ACCELERATE.
func New(ctx context.Context) (*Client, error) {
    region := getenv("S3_REGION", "us-east-1")
    endpoint := getenv("S3_ENDPOINT", "")
    bucket := getenv("S3_BUCKET", "")
    if bucket == "" {
        return nil, errors.New("S3_BUCKET is required")
    }

    var opts []func(*config.LoadOptions) error
    if endpoint != "" {
        opts = append(opts, config.WithRegion(region))
    }
    if ak := os.Getenv("S3_ACCESS_KEY"); ak != "" {
        sk := os.Getenv("S3_SECRET_KEY")
        opts = append(opts, config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(ak, sk, "")))
    }
    cfg, err := config.LoadDefaultConfig(ctx, opts...)
    if err != nil { return nil, err }

    s3Opts := func(o *awss3.Options) {
        if endpoint != "" {
            // S3-compatible provider (MinIO, etc.)
            o.BaseEndpoint = aws.String(endpoint)
            o.Region = region
            o.UsePathStyle = getbool("S3_FORCE_PATH_STYLE", true)
        }
        if getbool("S3_USE_ACCELERATE", false) {
            o.UseAccelerate = true
        }
    }
    s3 := awss3.NewFromConfig(cfg, s3Opts)
    return &Client{Bucket: bucket, S3: s3, Presign: awss3.NewPresignClient(s3)}, nil
}

// PresignGet returns a pre-signed GET URL for the given object key.
func (c *Client) PresignGet(ctx context.Context, key string, ttl time.Duration) (string, error) {
    if key == "" { return "", errors.New("empty key") }
    res, err := c.Presign.PresignGetObject(ctx, &awss3.GetObjectInput{
        Bucket: aws.String(c.Bucket),
        Key:    aws.String(key),
        ResponseContentDisposition: aws.String("attachment"),
        ResponseCacheControl:       aws.String("private, max-age=60"),
        ChecksumMode:               s3types.ChecksumModeEnabled,
    }, awss3.WithPresignExpires(ttl))
    if err != nil { return "", err }
    // Ensure it is a valid URL
    if _, err := url.Parse(res.URL); err != nil { return "", err }
    return res.URL, nil
}

