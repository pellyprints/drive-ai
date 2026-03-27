---
name: electron-testing
description: Electron desktop app automation testing using agent-browser CLI. Use when testing UI features in the running Electron app, verifying visual state, interacting with the desktop app, or running manual QA scenarios. Triggers on 'test in electron', 'test desktop', 'electron test', 'manual test', or UI verification tasks.
---

# Electron Automation Testing with agent-browser

Use the `agent-browser` CLI to automate and test the LobeHub desktop Electron app.

## Prerequisites

1. **agent-browser CLI** is installed globally (`agent-browser --version` to verify)
2. **Electron app** must be running with remote debugging enabled

## Starting the Electron App for Testing

```bash
# Kill any existing instance
pkill -f "Electron" 2> /dev/null
pkill -f "electron-vite" 2> /dev/null

# Start desktop dev with remote debugging
cd apps/desktop && ELECTRON_ENABLE_LOGGING=1 npx electron-vite dev -- --remote-debugging-port=9222
```

Or from project root:

```bash
ELECTRON_ARGS="--remote-debugging-port=9222" bun run dev:desktop
```

Wait for `[Browser] initUrl` in logs before connecting.

## Connecting to Electron

```bash
# Auto-detect and connect to the Electron app
agent-browser --cdp 9222 snapshot -i

# Or use auto-connect
agent-browser --auto-connect snapshot -i
```

## Core Workflow: Snapshot → Interact → Verify

### Step 1: Take a snapshot to see the current state

```bash
agent-browser --cdp 9222 snapshot -i
```

This returns element refs like `@e1`, `@e2` etc. **Refs are ephemeral** — re-snapshot after any page change.

### Step 2: Interact with elements

```bash
agent-browser --cdp 9222 click @e5       # Click an element
agent-browser --cdp 9222 fill @e3 "text" # Fill a text input
agent-browser --cdp 9222 type @e3 "text" # Type character by character
agent-browser --cdp 9222 press Enter     # Press a key
agent-browser --cdp 9222 scroll down 500 # Scroll
```

### Step 3: Wait for state changes

```bash
agent-browser --cdp 9222 wait 2000               # Wait ms
agent-browser --cdp 9222 wait --load networkidle # Wait for network
agent-browser --cdp 9222 wait @e1                # Wait for element
agent-browser --cdp 9222 wait --url "**/chat"    # Wait for URL
```

### Step 4: Take screenshot for visual verification

```bash
agent-browser --cdp 9222 screenshot            # Current viewport
agent-browser --cdp 9222 screenshot --full     # Full page
agent-browser --cdp 9222 screenshot --annotate # With element annotations
```

Screenshot images are saved to the current directory and can be read with the `Read` tool.

### Step 5: Get text/data for assertions

```bash
agent-browser --cdp 9222 get text @e1 # Get text content
agent-browser --cdp 9222 get url      # Get current URL
agent-browser --cdp 9222 get title    # Get page title
```

## Common Test Patterns

### Navigate to a specific agent chat

```bash
agent-browser --cdp 9222 snapshot -i
# Find the agent in sidebar and click it
agent-browser --cdp 9222 click @e<sidebar-agent-ref>
agent-browser --cdp 9222 wait --load networkidle
agent-browser --cdp 9222 snapshot -i
```

### Send a chat message

```bash
agent-browser --cdp 9222 snapshot -i
# Find the contenteditable chat input
agent-browser --cdp 9222 click @e<input-ref>
agent-browser --cdp 9222 type @e<input-ref> "Hello"
agent-browser --cdp 9222 press Enter
agent-browser --cdp 9222 wait 3000
agent-browser --cdp 9222 snapshot -i
```

### Verify element exists/text content

```bash
agent-browser --cdp 9222 snapshot -i
# Check output for expected text/elements
agent-browser --cdp 9222 get text @e<target-ref>
```

### Run JavaScript in the app context

```bash
agent-browser --cdp 9222 eval "document.title"
agent-browser --cdp 9222 eval --stdin << 'EOF'
JSON.stringify(Object.keys(window.__ZUSTAND_STORES__ || {}))
EOF
```

## Tips

- **Always re-snapshot** after clicking, navigating, or waiting — refs become stale
- **Use `--cdp 9222`** consistently for all commands when testing the Electron app
- **Chain commands** with `&&` only when you don't need intermediate output
- **Take screenshots** at key points for visual verification
- **Close when done**: `agent-browser --cdp 9222 close` (optional, doesn't kill Electron)
- For **rich text editors** (contenteditable), use `type` instead of `fill`
