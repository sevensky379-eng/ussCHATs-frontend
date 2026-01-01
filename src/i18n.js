import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Type a message": "Type a message...",
      "Attach file": "Attach file",
      "Add emoji": "Add emoji",
      "Send": "Send",
      "Replying to": "Replying to:",
      "Cancel reply": "Cancel reply",
      "Some files too large": "Some files too large (max 10MB)",
      "Remove file": "Remove file",
      "Upload progress": "Upload progress",
      "Media preview": "Media preview",
      "Emoji picker": "Emoji picker"
    }
  },
  es: {
    translation: {
      "Type a message": "Escribe un mensaje...",
      "Attach file": "Adjuntar archivo",
      "Add emoji": "Agregar emoji",
      "Send": "Enviar",
      "Replying to": "Respondiendo a:",
      "Cancel reply": "Cancelar respuesta",
      "Some files too large": "Algunos archivos son demasiado grandes (máx 10MB)",
      "Remove file": "Eliminar archivo",
      "Upload progress": "Progreso de carga",
      "Media preview": "Vista previa de medios",
      "Emoji picker": "Selector de emojis"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
