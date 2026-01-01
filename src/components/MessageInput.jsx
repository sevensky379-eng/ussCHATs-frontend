import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import "../i18n";
import { FaPaperclip, FaMicrophone, FaGlobe, FaFilePdf, FaFileWord, FaFileAudio, FaFileAlt, FaFileImage, FaSmile, FaTimes, FaReply, FaShare, FaTrash, FaStar, FaRegStar, FaClock, FaRobot } from "react-icons/fa";
import { compressImages } from "../../utils/imageCompression";import { useOffline } from "../hooks/useOffline";
import { analytics } from "../utils/analytics";
// Comprehensive emoji library with categories (UTF-8 properly encoded)
const emojiLibrary = {
  smileys: [
    { emoji: "😀", label: "grinning" }, { emoji: "😁", label: "beaming" }, { emoji: "😂", label: "joy" }, { emoji: "🤣", label: "rofl" }, { emoji: "😃", label: "grinning face" }, { emoji: "😄", label: "smile eyes" }, { emoji: "😅", label: "sweat smile" }, { emoji: "😆", label: "laugh" }, { emoji: "😉", label: "wink" }, { emoji: "😊", label: "blush" }, { emoji: "😇", label: "angel" }, { emoji: "🙂", label: "slightly smiling" }, { emoji: "🙃", label: "upside down" }, { emoji: "😌", label: "relieved" }, { emoji: "😍", label: "heart eyes" }, { emoji: "🥰", label: "smiling hearts" }, { emoji: "😘", label: "kiss" }, { emoji: "😗", label: "kissing" }, { emoji: "😚", label: "kissing closed" }, { emoji: "😙", label: "kissing smiling" }, { emoji: "🥲", label: "smiling" }, { emoji: "😋", label: "yum" }, { emoji: "😜", label: "wink tongue" }, { emoji: "🤪", label: "zany" }, { emoji: "😝", label: "squint tongue" }, { emoji: "🤑", label: "money mouth" }, { emoji: "🤨", label: "raised eyebrow" }, { emoji: "🤓", label: "nerd" }, { emoji: "😎", label: "cool" }, { emoji: "🤩", label: "star eyes" }, { emoji: "🥳", label: "celebrate" }, { emoji: "😏", label: "smirk" }, { emoji: "😒", label: "unamused" }, { emoji: "😞", label: "disappointed" }, { emoji: "😔", label: "pensive" }, { emoji: "😟", label: "worried" }, { emoji: "😕", label: "confused" }, { emoji: "🙁", label: "frowning" }, { emoji: "☹️", label: "frowning face" }, { emoji: "😲", label: "astonished" }, { emoji: "😳", label: "flushed" }, { emoji: "😥", label: "sad relieved" }, { emoji: "😦", label: "frowning eyes" }, { emoji: "😭", label: "sob" }, { emoji: "😱", label: "scream" }, { emoji: "😖", label: "confounded" }, { emoji: "😣", label: "persevere" }, { emoji: "😓", label: "downcast sweat" }, { emoji: "😩", label: "weary" }, { emoji: "😫", label: "tired" }, { emoji: "🥺", label: "pleading" }, { emoji: "😤", label: "triumph" }, { emoji: "😡", label: "rage" }, { emoji: "😠", label: "angry" }, { emoji: "🤬", label: "cursing" }, { emoji: "😈", label: "devil" }, { emoji: "👿", label: "angry devil" }, { emoji: "💀", label: "skull" }, { emoji: "☠️", label: "skull bones" }, { emoji: "💩", label: "poop" }, { emoji: "🤡", label: "clown" }, { emoji: "👹", label: "ogre" }, { emoji: "👺", label: "goblin" }, { emoji: "👻", label: "ghost" }, { emoji: "👽", label: "alien" }, { emoji: "👾", label: "space invader" }, { emoji: "🤖", label: "robot" }, { emoji: "😺", label: "cat grinning" }, { emoji: "😸", label: "cat smile" }, { emoji: "😹", label: "cat joy" }, { emoji: "😻", label: "cat heart eyes" }, { emoji: "😼", label: "cat wry smile" }, { emoji: "😽", label: "cat kissing" }, { emoji: "🙀", label: "weary cat" }, { emoji: "😿", label: "crying cat" }, { emoji: "😾", label: "pouting cat" }, { emoji: "🙈", label: "see no evil" }, { emoji: "🙉", label: "hear no evil" }, { emoji: "🙊", label: "speak no evil" },
  ],
  hearts: [
    { emoji: "❤️", label: "red heart" }, { emoji: "🧡", label: "orange heart" }, { emoji: "💛", label: "yellow heart" }, { emoji: "💚", label: "green heart" }, { emoji: "💙", label: "blue heart" }, { emoji: "💜", label: "purple heart" }, { emoji: "🖤", label: "black heart" }, { emoji: "🤍", label: "white heart" }, { emoji: "🤎", label: "brown heart" }, { emoji: "🩷", label: "pink heart" }, { emoji: "💔", label: "broken heart" }, { emoji: "💕", label: "two hearts" }, { emoji: "💞", label: "revolving hearts" }, { emoji: "💓", label: "beating heart" }, { emoji: "💗", label: "growing heart" }, { emoji: "💖", label: "sparkling heart" }, { emoji: "💘", label: "heart arrow" }, { emoji: "💝", label: "heart ribbon" }, { emoji: "💟", label: "heart decoration" }, { emoji: "👋", label: "waving hand" }, { emoji: "🤚", label: "raised back hand" }, { emoji: "🖐️", label: "hand spread" }, { emoji: "✋", label: "raised hand" }, { emoji: "🖖", label: "vulcan salute" }, { emoji: "👌", label: "ok hand" }, { emoji: "🤌", label: "pinched fingers" }, { emoji: "🤏", label: "pinching hand" }, { emoji: "✌️", label: "victory hand" }, { emoji: "🤞", label: "crossed fingers" }, { emoji: "🤟", label: "love you gesture" }, { emoji: "🤘", label: "sign horns" }, { emoji: "🤙", label: "call me hand" }, { emoji: "👍", label: "thumbs up" }, { emoji: "👎", label: "thumbs down" }, { emoji: "✊", label: "raised fist" }, { emoji: "👊", label: "oncoming fist" }, { emoji: "🤛", label: "left fist" }, { emoji: "🤜", label: "right fist" }, { emoji: "👏", label: "clapping hands" }, { emoji: "🙌", label: "raising hands" }, { emoji: "👐", label: "open hands" }, { emoji: "🤲", label: "palms up" }, { emoji: "🤝", label: "handshake" }, { emoji: "💅", label: "nail polish" }, { emoji: "💪", label: "flexed biceps" },
  ],
  objects: [
    { emoji: "🎉", label: "party popper" }, { emoji: "🎊", label: "confetti ball" }, { emoji: "🎈", label: "balloon" }, { emoji: "🎁", label: "gift" }, { emoji: "🔔", label: "bell" }, { emoji: "🔕", label: "muted bell" }, { emoji: "📢", label: "megaphone" }, { emoji: "📣", label: "loudspeaker" }, { emoji: "📯", label: "postal horn" }, { emoji: "🎶", label: "musical notes" }, { emoji: "🎤", label: "microphone" }, { emoji: "🎧", label: "headphone" }, { emoji: "📻", label: "radio" }, { emoji: "🎷", label: "saxophone" }, { emoji: "🎸", label: "guitar" }, { emoji: "🎹", label: "piano" }, { emoji: "🎺", label: "trumpet" }, { emoji: "🎻", label: "violin" }, { emoji: "🎲", label: "game die" }, { emoji: "🎯", label: "target" }, { emoji: "🎳", label: "bowling" }, { emoji: "🎮", label: "video game" }, { emoji: "🎰", label: "slot machine" }, { emoji: "🧩", label: "puzzle" }, { emoji: "🚗", label: "car" }, { emoji: "🚕", label: "taxi" }, { emoji: "🚙", label: "suv" }, { emoji: "🚌", label: "bus" }, { emoji: "🚎", label: "trolleybus" }, { emoji: "🚓", label: "police car" }, { emoji: "🚑", label: "ambulance" }, { emoji: "🚒", label: "fire engine" }, { emoji: "🚚", label: "truck" }, { emoji: "🚛", label: "articulated lorry" }, { emoji: "✈️", label: "airplane" }, { emoji: "🛫", label: "airplane departure" }, { emoji: "🛬", label: "airplane arrival" }, { emoji: "💺", label: "seat" }, { emoji: "💻", label: "laptop" }, { emoji: "📱", label: "mobile phone" }, { emoji: "⌨️", label: "keyboard" }, { emoji: "🖥️", label: "desktop" }, { emoji: "📷", label: "camera" }, { emoji: "📹", label: "video camera" }, { emoji: "🎥", label: "movie camera" }, { emoji: "🎬", label: "clapper board" }, { emoji: "📺", label: "television" }, { emoji: "📻", label: "radio" }, { emoji: "🔍", label: "magnifying glass" }, { emoji: "💡", label: "light bulb" }, { emoji: "🔦", label: "flashlight" }, { emoji: "🕯️", label: "candle" }, { emoji: "📔", label: "notebook" }, { emoji: "📕", label: "closed book" }, { emoji: "📖", label: "open book" }, { emoji: "📗", label: "green book" }, { emoji: "📘", label: "blue book" }, { emoji: "📙", label: "orange book" }, { emoji: "📚", label: "books" }, { emoji: "📓", label: "notebook" }, { emoji: "📒", label: "ledger" }, { emoji: "📃", label: "page curl" }, { emoji: "📜", label: "scroll" }, { emoji: "📄", label: "page facing" }, { emoji: "📰", label: "newspaper" }, { emoji: "📑", label: "bookmark tabs" }, { emoji: "📇", label: "card index" }, { emoji: "📈", label: "chart up" }, { emoji: "📉", label: "chart down" }, { emoji: "📊", label: "bar chart" }, { emoji: "📋", label: "clipboard" }, { emoji: "📁", label: "file folder" }, { emoji: "📂", label: "open folder" }, { emoji: "📅", label: "calendar" }, { emoji: "📆", label: "tear calendar" }, { emoji: "🗂️", label: "card dividers" }, { emoji: "🗳️", label: "ballot box" }, { emoji: "🔒", label: "locked" }, { emoji: "🔓", label: "unlocked" }, { emoji: "🔏", label: "locked pen" }, { emoji: "🔐", label: "locked key" }, { emoji: "🔑", label: "key" }, { emoji: "🗝️", label: "old key" }, { emoji: "🔨", label: "hammer" }, { emoji: "⛏️", label: "pick" }, { emoji: "⚒️", label: "hammer pick" }, { emoji: "🛠️", label: "hammer wrench" }, { emoji: "🔧", label: "wrench" }, { emoji: "🔩", label: "nut bolt" }, { emoji: "⚙️", label: "gear" }, { emoji: "🗜️", label: "clamp" }, { emoji: "⚖️", label: "balance scale" }, { emoji: "🔗", label: "link" }, { emoji: "⛓️", label: "chains" }, { emoji: "💣", label: "bomb" }, { emoji: "💥", label: "collision" }, { emoji: "⚡", label: "lightning" }, { emoji: "✨", label: "sparkles" }, { emoji: "🔥", label: "fire" }, { emoji: "💫", label: "dizzy" }, { emoji: "💢", label: "anger symbol" }, { emoji: "💯", label: "hundred" }, { emoji: "💬", label: "speech balloon" }, { emoji: "💭", label: "thought balloon" }, { emoji: "💤", label: "sleeping" },
  ],
  nature: [
    { emoji: "🌀", label: "cyclone" }, { emoji: "🌈", label: "rainbow" }, { emoji: "⛅", label: "sun behind cloud" }, { emoji: "🌤️", label: "sun small cloud" }, { emoji: "⛈️", label: "cloud lightning" }, { emoji: "🌥️", label: "cloud" }, { emoji: "🌦️", label: "sun behind rain" }, { emoji: "🌧️", label: "cloud rain" }, { emoji: "☔", label: "umbrella rain" }, { emoji: "☀️", label: "sun" }, { emoji: "🌞", label: "sun face" }, { emoji: "🌝", label: "full moon face" }, { emoji: "🌛", label: "first quarter moon" }, { emoji: "⭐", label: "star" }, { emoji: "🌟", label: "glowing star" }, { emoji: "🍏", label: "green apple" }, { emoji: "🍎", label: "red apple" }, { emoji: "🍐", label: "pear" }, { emoji: "🍊", label: "orange" }, { emoji: "🍋", label: "lemon" }, { emoji: "🍌", label: "banana" }, { emoji: "🍉", label: "watermelon" }, { emoji: "🍇", label: "grapes" }, { emoji: "🍓", label: "strawberry" }, { emoji: "🍈", label: "melon" }, { emoji: "🍒", label: "cherries" }, { emoji: "🍑", label: "peach" }, { emoji: "🥭", label: "mango" }, { emoji: "🍍", label: "pineapple" }, { emoji: "🍅", label: "tomato" }, { emoji: "🍆", label: "eggplant" }, { emoji: "🥑", label: "avocado" }, { emoji: "🥦", label: "broccoli" }, { emoji: "🥬", label: "leafy green" }, { emoji: "🌶️", label: "hot pepper" }, { emoji: "🌽", label: "corn" }, { emoji: "🥔", label: "potato" }, { emoji: "🍞", label: "bread" }, { emoji: "🧀", label: "cheese" }, { emoji: "🥚", label: "egg" }, { emoji: "🍳", label: "cooking" }, { emoji: "🥞", label: "pancakes" }, { emoji: "🥓", label: "bacon" }, { emoji: "🍗", label: "poultry leg" }, { emoji: "🍖", label: "meat bone" }, { emoji: "🌭", label: "hot dog" }, { emoji: "🍔", label: "hamburger" }, { emoji: "🍟", label: "fries" }, { emoji: "🍕", label: "pizza" }, { emoji: "🥪", label: "sandwich" }, { emoji: "🌮", label: "taco" }, { emoji: "🌯", label: "burrito" }, { emoji: "🥗", label: "salad" }, { emoji: "🍝", label: "spaghetti" }, { emoji: "🍜", label: "steaming bowl" }, { emoji: "🍲", label: "pot food" }, { emoji: "🍛", label: "curry rice" }, { emoji: "🍣", label: "sushi" }, { emoji: "🍱", label: "bento box" }, { emoji: "🍤", label: "shrimp" }, { emoji: "🍙", label: "rice ball" }, { emoji: "🍚", label: "rice" }, { emoji: "🍘", label: "rice cracker" }, { emoji: "🍥", label: "fish cake" }, { emoji: "🍢", label: "oden" }, { emoji: "🍡", label: "dango" }, { emoji: "🍧", label: "shaved ice" }, { emoji: "🍨", label: "ice cream" }, { emoji: "🍦", label: "soft ice cream" }, { emoji: "🍰", label: "cake slice" }, { emoji: "🎂", label: "birthday cake" }, { emoji: "🍮", label: "custard" }, { emoji: "🍭", label: "lollipop" }, { emoji: "🍬", label: "candy" }, { emoji: "🍫", label: "chocolate bar" }, { emoji: "🍿", label: "popcorn" }, { emoji: "🍩", label: "doughnut" }, { emoji: "🍪", label: "cookie" }, { emoji: "🌰", label: "chestnut" }, { emoji: "🍯", label: "honey pot" }, { emoji: "☕", label: "hot beverage" }, { emoji: "🍵", label: "teacup" }, { emoji: "🍶", label: "sake" }, { emoji: "🍷", label: "wine glass" }, { emoji: "🍸", label: "cocktail" }, { emoji: "🍹", label: "tropical drink" }, { emoji: "🍺", label: "beer mug" }, { emoji: "🍻", label: "clinking beer" }, { emoji: "🥂", label: "clinking glasses" },
  ],
  flags: [
    { emoji: "🇺🇸", label: "United States" }, { emoji: "🇬🇧", label: "United Kingdom" }, { emoji: "🇨🇦", label: "Canada" }, { emoji: "🇦🇺", label: "Australia" }, { emoji: "🇯🇵", label: "Japan" }, { emoji: "🇰🇷", label: "South Korea" }, { emoji: "🇨🇳", label: "China" }, { emoji: "🇮🇳", label: "India" }, { emoji: "🇧🇷", label: "Brazil" }, { emoji: "🇲🇽", label: "Mexico" }, { emoji: "🇫🇷", label: "France" }, { emoji: "🇩🇪", label: "Germany" }, { emoji: "🇮🇹", label: "Italy" }, { emoji: "🇪🇸", label: "Spain" }, { emoji: "🇮🇪", label: "Ireland" }, { emoji: "🇷🇺", label: "Russia" }, { emoji: "🇮🇩", label: "Indonesia" }, { emoji: "🇳🇬", label: "Nigeria" }, { emoji: "🇿🇦", label: "South Africa" }, { emoji: "🇪🇬", label: "Egypt" }, { emoji: "🇸🇦", label: "Saudi Arabia" }, { emoji: "🇨🇭", label: "Switzerland" }, { emoji: "🇸🇪", label: "Sweden" }, { emoji: "🇳🇴", label: "Norway" }, { emoji: "🇳🇱", label: "Netherlands" }, { emoji: "🇵🇱", label: "Poland" }, { emoji: "🇷🇴", label: "Romania" }, { emoji: "🇭🇰", label: "Hong Kong" }, { emoji: "🇹🇼", label: "Taiwan" }, { emoji: "🇵🇭", label: "Philippines" }, { emoji: "🇹🇭", label: "Thailand" }, { emoji: "🇻🇳", label: "Vietnam" }, { emoji: "🇮🇱", label: "Israel" }, { emoji: "🇺🇦", label: "Ukraine" }, { emoji: "🇹🇷", label: "Turkey" }, { emoji: "🇬🇷", label: "Greece" }, { emoji: "🇵🇹", label: "Portugal" }, { emoji: "🇧🇪", label: "Belgium" }, { emoji: "🇦🇹", label: "Austria" }, { emoji: "🇧🇬", label: "Bulgaria" }, { emoji: "🇪🇪", label: "Estonia" }, { emoji: "🇱🇹", label: "Lithuania" }, { emoji: "🇱🇻", label: "Latvia" }, { emoji: "🇸🇰", label: "Slovakia" }, { emoji: "🇨🇿", label: "Czech" }, { emoji: "🇭🇺", label: "Hungary" }, { emoji: "🇲🇩", label: "Moldova" }, { emoji: "🇦🇲", label: "Armenia" }, { emoji: "🇬🇪", label: "Georgia" }, { emoji: "🇰🇿", label: "Kazakhstan" }, { emoji: "🇺🇿", label: "Uzbekistan" }, { emoji: "🇵🇰", label: "Pakistan" }, { emoji: "🇧🇩", label: "Bangladesh" }, { emoji: "🇱🇰", label: "Sri Lanka" }, { emoji: "🇲🇾", label: "Malaysia" }, { emoji: "🇸🇬", label: "Singapore" }, { emoji: "🇦🇷", label: "Argentina" }, { emoji: "🇨🇱", label: "Chile" }, { emoji: "🇨🇴", label: "Colombia" }, { emoji: "🇵🇪", label: "Peru" }, { emoji: "🇻🇪", label: "Venezuela" }, { emoji: "🇲🇼", label: "Malawi" }, { emoji: "🇰🇪", label: "Kenya" }, { emoji: "🇪🇹", label: "Ethiopia" }, { emoji: "🇬🇭", label: "Ghana" }, { emoji: "🇲🇷", label: "Mauritania" }, { emoji: "🇲🇬", label: "Madagascar" }, { emoji: "🇿🇲", label: "Zambia" }, { emoji: "🇿🇼", label: "Zimbabwe" }, { emoji: "🇳🇿", label: "New Zealand" },
  ]
};

// Flatten all emojis for search functionality
const allEmojis = Object.values(emojiLibrary).flat();

// AI API proxy function - calls backend instead of exposing OpenAI key
const callAI = async (messages, context = "general") => {
  try {
    const token = localStorage.getItem("usschats_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ messages, context })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("AI call error:", error);
    throw error;
  }
};

export default function MessageInput({ chatId, onTyping, onSend, replyTo, onCancelReply }) {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sending, setSending] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [translateTo, setTranslateTo] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [generatingReplies, setGeneratingReplies] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [selfDestructTime, setSelfDestructTime] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [currentEmojiTab, setCurrentEmojiTab] = useState("smileys");
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { isOnline, saveMessageOffline } = useOffline();

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "zh", label: "中文" }
  ];

  let typingTimeout;
  const handleTyping = (val) => {
    onTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => onTyping(false), 1000);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping(e.target.value);
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < selectedFiles.length) setError("Some files too large (max 5MB)");
    else setError("");
    
    // Compress image files
    try {
      const compressedFiles = await compressImages(validFiles);
      setFiles(compressedFiles);
      setPreviews(compressedFiles.map(f => f.type.startsWith("image") ? URL.createObjectURL(f) : null));
    } catch (error) {
      console.error("File compression error:", error);
      // Fallback to original files if compression fails
      setFiles(validFiles);
      setPreviews(validFiles.map(f => f.type.startsWith("image") ? URL.createObjectURL(f) : null));
    }
  };

  const removeFile = (idx) => {
    setFiles(files => files.filter((_, i) => i !== idx));
    setPreviews(previews => previews.filter((_, i) => i !== idx));
  };

  const addEmoji = (emoji) => {
    setText(t => t + emoji);
    setShowEmoji(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // AI Smart Reply - calls backend proxy
  React.useEffect(() => {
    if (text.trim()) {
      // Simulate AI reply suggestions
      setSmartReplies([
        `Great! ${text}`,
        `Can you clarify?`,
        `Sounds great!`,
        `Let's do it!`
      ]);
    } else {
      setSmartReplies([]);
    }
  }, [text]);

  // Translation - calls backend proxy
  React.useEffect(() => {
    if (translateTo && text.trim()) {
      const translateText = async () => {
        try {
          const langName = languages.find(l => l.code === translateTo)?.label || translateTo;
          const response = await callAI([
            {
              role: "system",
              content: `You are a translator. Translate to ${langName}. Return ONLY the translation.`
            },
            { role: "user", content: text }
          ], "translation");
          setTranslatedText(response);
        } catch (error) {
          console.error("Translation error:", error);
          setTranslatedText(`[Translation unavailable]`);
        }
      };
      translateText();
    } else {
      setTranslatedText("");
    }
  }, [text, translateTo, languages]);

  const handleSmartReply = (reply) => {
    setText(reply);
    setShowEmoji(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const f = items[i].getAsFile();
        handleFileChange({ target: { files: [f] } });
        e.preventDefault();
        break;
      }
    }
  };

  const getFileIcon = (f) => {
    if (!f) return null;
    if (f.type.startsWith("image")) return <FaFileImage color="#0a84ff" />;
    if (f.type === "application/pdf") return <FaFilePdf color="#d32f2f" />;
    if (f.type === "audio/mpeg" || f.type.startsWith("audio")) return <FaFileAudio color="#0a84ff" />;
    if (f.type === "application/msword" || f.name?.endsWith(".doc") || f.name?.endsWith(".docx")) return <FaFileWord color="#2b579a" />;
    return <FaFileAlt color="#666" />;
  };

  // Generate smart replies using backend AI
  const generateSmartReplies = async () => {
    if (!text.trim()) return;
    setGeneratingReplies(true);



    try {
      const response = await callAI([
        {
          role: "system",
          content: "Generate 3 short, contextual reply suggestions. Return as JSON array of strings."
        },
        { role: "user", content: text }
      ], "smart-replies");
      const replies = JSON.parse(response);
      setSmartReplies(replies);
    } catch (error) {
      console.error("Smart replies error:", error);
      setSmartReplies(["Sorry, couldn't generate replies."]);
    }
    setGeneratingReplies(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (text.trim() || files.length) {
      setSending(true);
      try {
        setUploading(true);
        setProgress(0);
        let p = 0;
        const interval = setInterval(() => {
          p += 10;
          setProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            setUploading(false);
            setProgress(0);
          }
        }, 50);

        const messageData = { text, files, replyTo, selfDestructTime, chatId };

        if (!isOnline) {
          // Save message offline
          await saveMessageOffline(messageData);
          // Show offline indicator
          setError("Message saved offline. Will sync when connection is restored.");
          setTimeout(() => setError(""), 3000);
        } else {
          // Send normally
          await onSend(messageData);
        }

        // Track message sent analytics
        analytics.trackMessageSent(chatId, text.trim() ? 'text' : 'media', files.length > 0);

        setText("");
        setFiles([]);
        setPreviews([]);
        if (fileRef.current) fileRef.current.value = "";
        onTyping(false);
        if (inputRef.current) inputRef.current.focus();
      } finally {
        setSending(false);
      }
    }
  };

  const scheduleMessage = async () => {
    if (!scheduledDateTime) {
      alert("Please select a date and time");
      return;
    }

    const scheduledTime = new Date(scheduledDateTime);
    if (scheduledTime <= new Date()) {
      alert("Please select a future date and time");
      return;
    }

    if (!text.trim() && !files.length) {
      alert("Please enter a message or attach files");
      return;
    }

    try {
      const token = localStorage.getItem("usschats_token");
      const formData = new FormData();
      formData.append("chatId", chatId);
      formData.append("content", text);
      formData.append("scheduledTime", scheduledDateTime);
      if (replyTo) formData.append("replyTo", replyTo._id);

      files.forEach((file) => {
        formData.append("media", file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/schedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert("Message scheduled successfully!");
        setShowScheduleModal(false);
        setScheduledDateTime("");
        setText("");
        setFiles([]);
        setPreviews([]);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        alert("Failed to schedule message");
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      alert("Error scheduling message");
    }
  };

  let mediaRecorder;
  const startRecording = async () => {
    setRecording(true);
    setAudioBlob(null);
    setTranscript("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new window.MediaRecorder(stream);
    const chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
      setTranscript("[Transcribed text here]");
    };
    mediaRecorder.start();
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorder) mediaRecorder.stop();
  };

  return (
    <>
      <form
        className="message-input"
        onSubmit={submit}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onPaste={handlePaste}
        aria-label="Message input form"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <label htmlFor="lang-switch" style={{ fontWeight: 500 }}>🌐</label>
          <select id="lang-switch" value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)} aria-label="Language switcher" style={{ borderRadius: 6, padding: "2px 8px" }}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
          <FaGlobe style={{ marginLeft: 12 }} />
          <select value={translateTo} onChange={e => setTranslateTo(e.target.value)} aria-label="Translate to" style={{ borderRadius: 6, padding: "2px 8px" }}>
            <option value="">No translation</option>
            {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder={t("Type a message")}
          aria-label={t("Type a message")}
          ref={inputRef}
          tabIndex={0}
        />
        {translatedText && (
          <div style={{ background: "#e1f5fe", color: "#333", borderRadius: 8, padding: "4px 12px", margin: "8px 0", fontStyle: "italic" }} aria-label="Translated message">{translatedText}</div>
        )}
        <button
          type="button"
          className="file-attach-btn"
          aria-label={t("Attach file")}
          onClick={() => fileRef.current && fileRef.current.click()}
          style={{ background: "none", border: "none", cursor: "pointer", marginRight: 8 }}
          tabIndex={0}
        >
          <FaPaperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileChange}
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
          style={{ display: "none" }}
          aria-label={t("Attach file")}
          multiple
        />
        <button
          type="button"
          className="emoji-btn"
          aria-label={t("Add emoji")}
          onClick={() => setShowEmoji(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", marginRight: 8, fontSize: 20 }}
          tabIndex={0}
        >
          😀
        </button>
        {showEmoji && (
          <div 
            ref={emojiPickerRef}
            style={{ 
              position: "fixed", 
              bottom: 80, 
              left: 20, 
              background: "#fff", 
              border: "1px solid #ddd", 
              borderRadius: 12, 
              boxShadow: "0 5px 40px rgba(0,0,0,0.16)", 
              zIndex: 2000,
              width: 350,
              maxHeight: 500,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }} 
            role="dialog" 
            aria-label={t("Emoji picker")}
          > 
            <div style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
              <input
                type="text"
                placeholder="Search emoji..."
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 20,
                  fontSize: 13,
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid #eee", background: "#f9f9f9" }}>
              {["smileys", "hearts", "objects", "nature", "flags"].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setCurrentEmojiTab(tab); setEmojiSearch(""); }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: currentEmojiTab === tab ? "#fff" : "transparent",
                    border: "none",
                    borderBottom: currentEmojiTab === tab ? "3px solid #0a84ff" : "none",
                    cursor: "pointer",
                    fontSize: 18
                  }}
                  title={tab}
                >
                  {tab === "smileys" && "😀"}
                  {tab === "hearts" && "❤️"}
                  {tab === "objects" && "🎉"}
                  {tab === "nature" && "🌈"}
                  {tab === "flags" && "🚩"}
                </button>
              ))}
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: "auto", 
              padding: "12px", 
              display: "grid", 
              gridTemplateColumns: "repeat(6, 1fr)", 
              gap: "6px"
            }}>
              {emojiSearch.trim() 
                ? allEmojis.filter(e => e.label.includes(emojiSearch.toLowerCase())).map((e) => (
                    <button
                      key={e.emoji}
                      type="button"
                      onClick={() => { addEmoji(e.emoji); setShowEmoji(false); }}
                      style={{
                        fontSize: 24,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
                      onMouseLeave={(e) => e.target.style.background = "none"}
                      title={e.label}
                      tabIndex={0}
                    >
                      {e.emoji}
                    </button>
                  ))
                : emojiLibrary[currentEmojiTab]?.map((e) => (
                    <button
                      key={e.emoji}
                      type="button"
                      onClick={() => { addEmoji(e.emoji); setShowEmoji(false); }}
                      style={{
                        fontSize: 24,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
                      onMouseLeave={(e) => e.target.style.background = "none"}
                      title={e.label}
                      tabIndex={0}
                    >
                      {e.emoji}
                    </button>
                  ))
              }
            </div>
          </div>
        )}
        {replyTo && (
          <div className="reply-preview" style={{ background: "#f3f3f3", borderRadius: 8, padding: "6px 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, color: "#0a84ff" }}>{t("Replying to")}</span>
            <span style={{ flex: 1, color: "#333" }}>{replyTo.content?.slice(0, 60) || "Media"}</span>
            <button type="button" onClick={onCancelReply} style={{ background: "none", border: "none", color: "#d32f2f", fontWeight: 700, cursor: "pointer" }} aria-label={t("Cancel reply")}> <FaTimes size={18} /> </button>
          </div>
        )}
        {error && (
          <div className="error-msg" style={{ color: "#b00020", fontSize: 13, background: "#fff3f3", borderRadius: 4, padding: "2px 8px", marginTop: 4 }} role="alert">{t("Some files too large")}</div>
        )}        {!isOnline && (
          <div className="offline-indicator" style={{ color: "#ff9800", fontSize: 13, background: "#fff8e1", borderRadius: 4, padding: "2px 8px", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }} role="alert">
            <span>⚠️</span>
            You're offline. Messages will be sent when connection is restored.
          </div>
        )}        {uploading && (
          <div className="upload-progress" style={{ width: "100%", background: "#eee", borderRadius: 6, margin: "6px 0" }} aria-label={t("Upload progress")}> 
            <div style={{ width: `${progress}%`, height: 6, background: "#0a84ff", borderRadius: 6, transition: "width 0.2s" }} />
          </div>
        )}
        {previews.length > 0 && (
          <div className="media-preview" style={{ flexWrap: "wrap" }} aria-label={t("Media preview")}> 
            {previews.map((preview, idx) => {
              const file = files[idx];
              if (file.type.startsWith("image")) {
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}>
                    {getFileIcon(file)}
                    <img src={preview} alt="preview" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8 }} tabIndex={0} />
                    <button type="button" onClick={() => removeFile(idx)} style={{ background: "none", border: "none", color: "#d32f2f", fontWeight: 700, cursor: "pointer" }} aria-label={t("Remove file")} tabIndex={0}> <FaTimes size={16} /> </button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        {smartReplies.length > 0 && (
          <div className="smart-replies" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }} aria-label={t("Smart replies")}> 
            {smartReplies.map((reply, idx) => (
              <button key={idx} type="button" onClick={() => handleSmartReply(reply)} style={{ background: "#e1f5fe", borderRadius: 16, padding: "6px 12px", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }} tabIndex={0}>
                <FaReply style={{ marginRight: 6 }} />
                {reply}
              </button>
            ))}
          </div>
        )}
        <div className="voice-message" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            style={{ background: recording ? "#d32f2f" : "#0a84ff", color: "#fff", borderRadius: 24, padding: "8px 16px", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
            aria-label={recording ? t("Stop recording") : t("Start recording")}
            tabIndex={0}
          >
            <FaMicrophone size={20} />
            {recording ? t("Stop recording") : t("Voice message")}
          </button>
          {audioBlob && (
            <audio src={URL.createObjectURL(audioBlob)} controls style={{ borderRadius: 8, marginLeft: 8 }} tabIndex={0} />
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => setTranslateTo(translateTo ? "" : "es")}
            style={{ background: translateTo ? "#d32f2f" : "#0a84ff", color: "#fff", borderRadius: 24, padding: "8px 16px", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
            aria-label={translateTo ? t("Cancel translation") : t("Translate to Spanish")}
            tabIndex={0}
          >
            {translateTo ? <FaTimes size={18} /> : <FaGlobe size={18} />}
            {translateTo ? t("Cancel translation") : t("Translate")}
          </button>
          <button
            type="button"
            onClick={generateSmartReplies}
            disabled={generatingReplies || !text.trim()}
            style={{ background: "#ff9800", color: "#fff", borderRadius: 24, padding: "8px 16px", border: "none", cursor: "pointer", fontWeight: 600, marginRight: 8, display: "flex", alignItems: "center", gap: 6 }}
            aria-label="Generate smart replies"
            tabIndex={0}
          >
            <FaRobot size={18} />
            {generatingReplies ? t("Generating...") : t("Smart Replies")}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FaClock size={14} color="#666" />
            <select
              value={selfDestructTime}
              onChange={(e) => setSelfDestructTime(Number(e.target.value))}
              style={{
                background: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
                color: "#666",
                cursor: "pointer"
              }}
              aria-label="Self-destruct timer"
            >
              <option value={0}>No timer</option>
              <option value={5000}>5 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
              <option value={3600000}>1 hour</option>
              <option value={86400000}>24 hours</option>
              <option value={604800000}>7 days</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            style={{ background: "#ff9800", color: "#fff", border: "none", borderRadius: 24, padding: "8px 16px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
            aria-label="Schedule message"
            tabIndex={0}
          >
            <FaClock size={16} />
            {t("Schedule")}
          </button>
          <button 
            type="submit" 
            disabled={sending || uploading} 
            style={{ 
              opacity: sending || uploading ? 0.6 : 1,
              display: "flex", 
              alignItems: "center", 
              gap: "6px" 
            }}
            tabIndex={0}
          >
            {sending ? (
              <>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  border: "2px solid #fff", 
                  borderTop: "2px solid transparent", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite" 
                }}></div>
                {t("Sending...")}
              </>
            ) : (
              t("Send")
            )}
          </button>
        </div>
        {showScheduleModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}>
              <h3 style={{ margin: 0, marginBottom: 16, color: "#333" }}>Schedule Message</h3>
              <p style={{ margin: 0, marginBottom: 20, color: "#666", fontSize: 14 }}>
                Choose when to send this message
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                  Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <strong>Message Preview:</strong>
                <div style={{
                  background: "#f5f5f5",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 8,
                  fontSize: 14,
                  color: "#333"
                }}>
                  {text || "(No text)"}
                  {files.length > 0 && (
                    <div style={{ marginTop: 8, color: "#666" }}>
                      📎 {files.length} file{files.length > 1 ? 's' : ''} attached
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setScheduledDateTime("");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#f5f5f5",
                    color: "#666",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={scheduleMessage}
                  style={{
                    padding: "8px 16px",
                    background: "#ff9800",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Schedule Message
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
