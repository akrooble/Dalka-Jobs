package httpapi

import (
	"strings"
	"testing"
)

func TestProfileUnicodeAndControlBoundaries(t *testing.T) {
	for _, v := range []struct {
		s            string
		min, max     int
		multi, valid bool
	}{{"Ali", 2, 100, false, true}, {"علي", 2, 100, false, true}, {"x", 2, 100, false, false}, {strings.Repeat("é", 100), 2, 100, false, true}, {strings.Repeat("é", 101), 2, 100, false, false}, {"A\x00B", 2, 100, false, false}, {"A\nB", 2, 100, false, false}, {"A\nB\tC", 0, 2000, true, true}, {"A\x1bB", 0, 2000, true, false}, {string([]byte{0xff}), 0, 2000, true, false}} {
		if validProfileText(v.s, v.min, v.max, v.multi) != v.valid {
			t.Fatal("profile text boundary failed")
		}
	}
}
