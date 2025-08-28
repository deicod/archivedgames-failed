package sanitize

import (
  "github.com/microcosm-cc/bluemonday"
)

var policy = bluemonday.UGCPolicy()

func HTML(s string) string {
  return policy.Sanitize(s)
}

