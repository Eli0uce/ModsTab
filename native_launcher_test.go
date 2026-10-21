package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestExtractPayload(t *testing.T) {
	dir := t.TempDir()
	if err := extractPayload(dir); err != nil {
		t.Fatalf("extractPayload() error = %v", err)
	}

	for _, name := range payloadFiles {
		if info, err := os.Stat(filepath.Join(dir, filepath.FromSlash(name))); err != nil || !info.Mode().IsRegular() {
			t.Errorf("payload file %q was not extracted as a regular file: info=%v err=%v", name, info, err)
		}
	}
}

func TestExtractPayloadReportsWriteFailure(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "not-a-directory")
	if err := os.WriteFile(dir, []byte("file"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := extractPayload(dir); err == nil {
		t.Fatal("extractPayload() succeeded with a non-directory destination")
	}
}

func TestShellQuote(t *testing.T) {
	for _, test := range []struct {
		input string
		want  string
	}{
		{input: "/tmp/modstab-install-1", want: "'/tmp/modstab-install-1'"},
		{input: "a'b", want: "'a'\\''b'"},
	} {
		if got := shellQuote(test.input); got != test.want {
			t.Errorf("shellQuote(%q) = %q, want %q", test.input, got, test.want)
		}
	}
}

func TestAppleScriptQuote(t *testing.T) {
	got := appleScriptQuote(`path\to "ModsTab"` + "\nnext")
	if want := `path\\to \"ModsTab\"\nnext`; got != want {
		t.Errorf("appleScriptQuote() = %q, want %q", got, want)
	}
}

func TestMacTerminalScriptQuotesPathsAndArguments(t *testing.T) {
	command := macTerminalCommand("/tmp/ModsTab's files", []string{"--channel=ptb"})
	for _, expected := range []string{
		`cd '/tmp/ModsTab'\''s files'`,
		`bash '/tmp/ModsTab'\''s files/Install-macOS.command'`,
		"'--channel=ptb'",
		"rm -rf '/tmp/ModsTab'\\''s files'",
	} {
		if !strings.Contains(command, expected) {
			t.Errorf("macTerminalCommand() = %q, missing %q", command, expected)
		}
	}

	script := macTerminalScript("/tmp/ModsTab", nil)
	if !strings.Contains(script, `do script "cd '/tmp/ModsTab' && bash '/tmp/ModsTab/Install-macOS.command'`) {
		t.Errorf("macTerminalScript() = %q, missing an escaped Terminal command", script)
	}
}
