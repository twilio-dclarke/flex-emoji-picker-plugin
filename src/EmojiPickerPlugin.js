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
}
