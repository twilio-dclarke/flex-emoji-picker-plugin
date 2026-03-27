import { FlexPlugin } from "@twilio/flex-plugin";
import React from "react";
import EmojiPickerButton from "./components/EmojiPickerButton";

// Immediate logging
console.log("[EMOJI_PLUGIN_LOADED]");
window.__EMOJI_PLUGIN_LOADED_AT = new Date().toISOString();

const PLUGIN_NAME = "EmojiPickerPlugin";

export default class EmojiPickerPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
    console.log("[EMOJI_PLUGIN_CONSTRUCTOR]");
    window.__EMOJI_PLUGIN_CONSTRUCTOR_AT = new Date().toISOString();
  }

 async init(flex, manager) {
  console.log("[EMOJI_PLUGIN_INIT]");

  const _error = window.onerror;
  window.onerror = (msg, ...args) => {
    if (typeof msg === 'string' && msg.includes('ResizeObserver loop')) return true;
    return _error ? _error(msg, ...args) : false;
  };

  flex.EmailEditor.Content.add(
    <EmojiPickerButton key="emoji-picker-button" />,
    { sortOrder: -1, align: "start" }
  );

  console.log("[EMOJI_PLUGIN_ADDED_TO_EMAIL_EDITOR]");
  }

  injectButtonViaDom() {
    console.log("[EMOJI_PLUGIN_INJECT_DOM_START]");
    
    const tryInject = () => {
      const toolbars = document.querySelectorAll('[role="toolbar"]');
      console.log("[EMOJI_PLUGIN_FOUND_TOOLBARS] Count: " + toolbars.length);

      if (toolbars.length === 0) {
        return;
      }

      for (const toolbar of toolbars) {
        if (toolbar.querySelector("#emoji-picker-container")) {
          console.log("[EMOJI_PLUGIN_ALREADY_INJECTED]");
          return;
        }

        try {
          const container = document.createElement("div");
          container.id = "emoji-picker-container";
          container.style.display = "inline-flex";

          toolbar.insertBefore(container, toolbar.firstChild);
          console.log("[EMOJI_PLUGIN_CONTAINER_ADDED]");

          const ReactDOM = require("react-dom");
          ReactDOM.render(
            <EmojiPickerButton key="emoji-picker-btn" />,
            container
          );

          console.log("[EMOJI_PLUGIN_BUTTON_RENDERED]");
          return;
        } catch (err) {
          console.log("[EMOJI_PLUGIN_INJECT_ERROR] " + err.message);
        }
      }
    };

    setTimeout(tryInject, 2000);

    // Also try periodically
    const interval = setInterval(() => {
      if (document.querySelector("#emoji-picker-container")) {
        clearInterval(interval);
        console.log("[EMOJI_PLUGIN_CLEANUP_INTERVAL]");
      } else {
        tryInject();
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 30000);
  }
}
