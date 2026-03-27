import * as FlexPlugin from '@twilio/flex-plugin';
import EmojiPickerPlugin from './EmojiPickerPlugin';

console.log("[EMOJI_PLUGIN_INDEX_START]");

FlexPlugin.loadPlugin(EmojiPickerPlugin);

console.log("[EMOJI_PLUGIN_INDEX_LOADED]");
