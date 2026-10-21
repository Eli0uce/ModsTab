package main

import (
	"embed"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

//go:embed Install-Windows.bat Install-macOS.command installer/install.js plugin/ModsTab.plugin.js
var payload embed.FS

var payloadFiles = []string{
	"Install-Windows.bat",
	"Install-macOS.command",
	"installer/install.js",
	"plugin/ModsTab.plugin.js",
}

func main() {
	if err := launch(); err != nil {
		fmt.Fprintln(os.Stderr, "ModsTab :", err)
		if runtime.GOOS == "darwin" {
			showMacError(err)
		}
		os.Exit(1)
	}
}

func launch() error {
	dir, err := os.MkdirTemp("", "modstab-install-")
	if err != nil {
		return fmt.Errorf("impossible de préparer l'installation : %w", err)
	}

	if err := extractPayload(dir); err != nil {
		_ = os.RemoveAll(dir)
		return fmt.Errorf("impossible de préparer les fichiers : %w", err)
	}

	switch runtime.GOOS {
	case "windows":
		defer os.RemoveAll(dir)
		return launchWindows(dir, os.Args[1:])
	case "darwin":
		if err := launchMacOS(dir, os.Args[1:]); err != nil {
			_ = os.RemoveAll(dir)
			return err
		}
		return nil
	default:
		_ = os.RemoveAll(dir)
		return fmt.Errorf("système non pris en charge : %s", runtime.GOOS)
	}
}

func extractPayload(dir string) error {
	for _, name := range payloadFiles {
		data, err := fs.ReadFile(payload, name)
		if err != nil {
			return fmt.Errorf("lecture de %s : %w", name, err)
		}

		target := filepath.Join(dir, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(target), 0o700); err != nil {
			return fmt.Errorf("création du dossier de %s : %w", name, err)
		}

		mode := fs.FileMode(0o600)
		if strings.HasSuffix(name, ".command") {
			mode = 0o700
		}
		if err := os.WriteFile(target, data, mode); err != nil {
			return fmt.Errorf("écriture de %s : %w", name, err)
		}
	}
	return nil
}

func launchWindows(dir string, args []string) error {
	commandArgs := append([]string{"/C", "Install-Windows.bat"}, args...)
	command := exec.Command("cmd.exe", commandArgs...)
	command.Dir = dir
	command.Stdin = os.Stdin
	command.Stdout = os.Stdout
	command.Stderr = os.Stderr
	if err := command.Run(); err != nil {
		return fmt.Errorf("l'installeur Windows a échoué : %w", err)
	}
	return nil
}

func launchMacOS(dir string, args []string) error {
	command := exec.Command("osascript", "-e", macTerminalScript(dir, args))
	if output, err := command.CombinedOutput(); err != nil {
		return fmt.Errorf("impossible d'ouvrir Terminal : %w (%s)", err, strings.TrimSpace(string(output)))
	}
	return nil
}

func macTerminalScript(dir string, args []string) string {
	return `tell application "Terminal" to do script "` + appleScriptQuote(macTerminalCommand(dir, args)) + `"` +
		"\ntell application \"Terminal\" to activate"
}

func macTerminalCommand(dir string, args []string) string {
	parts := []string{"bash " + shellQuote(filepath.Join(dir, "Install-macOS.command"))}
	for _, arg := range args {
		parts = append(parts, shellQuote(arg))
	}
	return "cd " + shellQuote(dir) + " && " + strings.Join(parts, " ") +
		"; status=$?; rm -rf " + shellQuote(dir) + "; exit $status"
}

func shellQuote(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "'\\''") + "'"
}

func appleScriptQuote(value string) string {
	value = strings.ReplaceAll(value, `\`, `\\`)
	value = strings.ReplaceAll(value, `"`, `\"`)
	value = strings.ReplaceAll(value, "\r", `\r`)
	return strings.ReplaceAll(value, "\n", `\n`)
}

func showMacError(err error) {
	message := appleScriptQuote(err.Error())
	script := `display dialog "` + message + `" with title "ModsTab" buttons {"OK"} default button "OK"`
	_ = exec.Command("osascript", "-e", script).Run()
}
