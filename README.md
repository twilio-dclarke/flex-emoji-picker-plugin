# Flex Email Emoji Picker Plugin

A Twilio Flex 2.x plugin that adds an emoji picker to the Email Editor, allowing agents to insert emojis directly into email replies.

---

## How it works

The plugin injects an emoji button into the Email Editor via `flex.EmailEditor.Content.add()`. When an emoji is selected, it is inserted at the agent's cursor position using Slate.js's native `insertText` API — accessed directly via the React fiber tree on the iframe's contenteditable element.

This approach means:
- Emojis insert at the cursor, not appended to the end
- Backspace removes the full emoji character correctly
- Undo/redo (Ctrl+Z) works as expected
- No execCommand, no selection saving, no DOM hacks

---

## Compatibility

| | |
|---|---|
| Twilio Flex UI | 2.x (tested on 2.14.0) |
| Node.js | ≥ 18 |
| @twilio/flex-plugin-scripts | 7.x (Webpack 4) |

---

## Installation

```bash
npm install
npm install emoji-picker-react@4
```

> **Do not use `emoji-mart` v5 or `@emoji-mart/react`.** They use optional chaining (`?.`) which Webpack 4 (used by flex-plugin-scripts) cannot parse. `emoji-picker-react@4` ships pre-transpiled and works correctly.

> **Do not use dynamic `import()`.** Webpack code splitting creates chunks that the Flex dev server cannot serve. Use static imports only.

---

## Required files

Two files must exist before the plugin will load — flex-plugin-scripts v6 requires both and fails silently without them.

**`plugin.json`** at the project root:
```json
{"name": "flex-emoji-picker-plugin", "version": "1.0.0"}
```

**`src/index.js`**:
```javascript
import EmojiPickerPlugin from "./EmojiPickerPlugin";
import { loadPlugin } from "@twilio/flex-plugin";
loadPlugin(EmojiPickerPlugin);
```

---

## Development

```bash
npm start
```

Open an Email task in Flex. The 😊 Emoji button will appear in the Email Editor. Click into the email body first to place your cursor, then select an emoji.

---

## Deployment

```bash
npm run deploy
npm run release
```

Or via Twilio CLI:
```bash
twilio flex:plugins:deploy --major --changelog "Add emoji picker to Email Editor"
twilio flex:plugins:release --name "Emoji Picker" --plugin flex-emoji-picker-plugin@latest
```

---

## Architecture notes

### Why not the formatting toolbar?
The Bold/Italic/formatting buttons live inside `Twilio-EmailMessageHeader`, which is not exposed as a pluggable Flex component in Flex 2.14. Only `EmailEditor` and `EmailMessageItem` have `Content.add`. DOM injection into the formatting toolbar is possible but fragile — it sits inside a MuiAccordion that re-renders on expand/collapse.

### Why not execCommand?
The Flex Email Editor renders the email body inside an unsandboxed iframe (`data-testid="email-body-frame"`) containing a Slate.js editor. `execCommand('insertText')` works at the DOM level but bypasses Slate's internal state model, causing incorrect codepoint boundary tracking and broken backspace behaviour.

### Slate editor access via React fiber
The Slate editor instance is retrieved by walking the React fiber tree from the iframe's contenteditable element:

```javascript
const fiberKey = Object.keys(slateEl).find(k => k.startsWith('__reactFiber'));
let node = slateEl[fiberKey];
while (node) {
  if (node.memoizedProps?.editor?.insertText) return node.memoizedProps.editor;
  node = node.return;
}
```

Once we have the editor instance, insertion is a single call:
```javascript
editor.insertText("😊");
```

The `__reactFiber` key suffix is stable within a React version. Since Flex controls the React version, this is reliable in practice.

### Known issues
- `ResizeObserver loop completed with undelivered notifications` — a cosmetic warning thrown internally by `emoji-picker-react` during render. Suppressed in `EmojiPickerPlugin.js` via `window.onerror`. Does not affect functionality.

---

## File structure

```
src/
├── index.js                    # Entry point — calls loadPlugin()
├── EmojiPickerPlugin.js        # Plugin class — injects via flex.EmailEditor.Content.add()
└── components/
    ├── EmojiPickerButton.js    # Button, picker, Slate insertion logic
    └── EmojiPickerButton.css   # Styles — Twilio Paste-aligned
plugin.json                     # Required by flex-plugin-scripts v6
public/
└── appConfig.js                # Account SID config for local dev
```