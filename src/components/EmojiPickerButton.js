import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import "./EmojiPickerButton.css";

// Walk the React fiber tree to find the Slate editor instance
const getSlateEditor = () => {
  const frame = document.querySelector('[data-testid="email-body-frame"]');
  if (!frame) return null;
  const doc = frame.contentDocument;
  const slateEl = doc.querySelector('[contenteditable="true"]');
  if (!slateEl) return null;
  const fiberKey = Object.keys(slateEl).find(k => k.startsWith('__reactFiber'));
  let node = slateEl[fiberKey];
  while (node) {
    if (node.memoizedProps?.editor?.insertText) return node.memoizedProps.editor;
    node = node.return;
  }
  return null;
};

const EmojiPickerButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const pickerRef = useRef(null);

  const insertEmoji = (emojiData) => {
    const editor = getSlateEditor();
    if (!editor) {
      console.warn("[EMOJI_PICKER] Slate editor not found");
      setIsOpen(false);
      return;
    }
    editor.insertText(emojiData.emoji);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerHeight = 400;
      const openUpward = window.innerHeight - rect.bottom < pickerHeight + 16;
      setPickerPosition({
        top: openUpward ? rect.top - pickerHeight - 8 : rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 360),
      });
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutside, true);
    return () => document.removeEventListener("mousedown", handleOutside, true);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        className="emoji-picker-trigger-btn"
        onClick={handleButtonClick}
        title="Insert emoji"
        aria-label="Insert emoji"
        aria-expanded={isOpen}
        type="button"
      >
        <span className="emoji-picker-trigger-icon" aria-hidden="true">😊</span>
        <span className="emoji-picker-trigger-label">Emoji</span>
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="emoji-picker-popover"
          style={{ top: pickerPosition.top, left: pickerPosition.left }}
          role="dialog"
          aria-label="Emoji picker"
        >
          <EmojiPicker
            onEmojiClick={insertEmoji}
            autoFocusSearch={true}
            lazyLoadEmojis={true}
            skinTonesDisabled
            height={400}
            width={350}
          />
        </div>
      )}
    </>
  );
};

export default EmojiPickerButton;