import { useState } from "react";
import useAuth from "../hooks/useAuth";
import Cropper from "react-easy-crop";
import { compressImage } from "../../utils/imageCompression";

export default function ProfileModal({ onClose }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(user?.status || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatarUrl || "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [privacy, setPrivacy] = useState({
    profile: user?.privacy?.profile || "everyone",
    status: user?.privacy?.status || "everyone",
    lastSeen: user?.privacy?.lastSeen || "everyone"
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setError("");
    if (f.size > 5 * 1024 * 1024) {
      setError("Avatar too large (max 5MB)");
      setFile(null);
      setPreview("");
      return;
    }
    setFile(f);
    if (f.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(f);
    } else {
      setPreview("");
      setShowCropper(false);
    }
  };

  async function getCroppedImg(imageSrc, cropPixels) {
    // Utility to crop image in browser
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise(res => { image.onload = res; });
    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob);
      }, "image/jpeg");
    });
  }

  const upload = async () => {
    setUploading(true);
    setProgress(0);
    try {
      const form = new FormData();
      form.append("userId", user.id || user._id);
      form.append("name", name);
      form.append("status", status);
      form.append("privacy", JSON.stringify(privacy));
      
      if (file && croppedAreaPixels && preview) {
        const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);
        // Convert blob to File for compression
        const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        // Compress the cropped image
        const compressedFile = await compressImage(croppedFile, {
          maxSizeMB: 0.3, // Smaller for avatars
          maxWidthOrHeight: 512 // Avatars don't need to be huge
        });
        form.append("avatar", compressedFile, "avatar.jpg");
      } else if (file) {
        // Compress the original file
        const compressedFile = await compressImage(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 512
        });
        form.append("avatar", compressedFile, file.name);
      }
      
      setProgress(50);
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/avatar`, { method: "POST", body: form });
      setProgress(100);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="modal" aria-label="Edit profile modal">
      <h3>Edit profile</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <img src={preview || user?.avatarUrl || "/default-avatar.png"} alt="avatar" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }} />
          {showCropper && preview && (
            <div style={{ position: "absolute", top: 0, left: 70, width: 220, height: 220, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.12)", zIndex: 100 }}>
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
                <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: 120 }} aria-label="Zoom" />
                <button type="button" onClick={() => setShowCropper(false)} style={{ background: "#0a84ff", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>Done</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" aria-label="Name" style={{ marginBottom: 8, width: "100%" }} />
          <input value={status} onChange={e => setStatus(e.target.value)} placeholder="Status" aria-label="Status" style={{ marginBottom: 8, width: "100%" }} />
          {user?.badge && (
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#666" }}>Badge:</span>
              <span style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "#000",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: 12,
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                {user.badge}
              </span>
            </div>
          )}
          <input type="file" onChange={handleFileChange} accept="image/*" aria-label="Avatar upload" />
        </div>
      </div>
      {error && <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 6 }}>{error}</div>}
      {uploading && (
        <div style={{ width: "100%", background: "#eee", borderRadius: 6, margin: "6px 0" }}>
          <div style={{ width: `${progress}%`, height: 6, background: "#0a84ff", borderRadius: 6, transition: "width 0.2s" }} />
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <h4>Privacy Settings</h4>
        <label>Profile visibility:
          <select value={privacy.profile} onChange={e => setPrivacy(p => ({ ...p, profile: e.target.value }))}>
            <option value="everyone">Everyone</option>
            <option value="contacts">Contacts only</option>
            <option value="nobody">Nobody</option>
          </select>
        </label>
        <label>Status visibility:
          <select value={privacy.status} onChange={e => setPrivacy(p => ({ ...p, status: e.target.value }))}>
            <option value="everyone">Everyone</option>
            <option value="contacts">Contacts only</option>
            <option value="nobody">Nobody</option>
          </select>
        </label>
        <label>Last seen:
          <select value={privacy.lastSeen} onChange={e => setPrivacy(p => ({ ...p, lastSeen: e.target.value }))}>
            <option value="everyone">Everyone</option>
            <option value="contacts">Contacts only</option>
            <option value="nobody">Nobody</option>
          </select>
        </label>
      </div>
      {showCropper && (
        <div style={{ marginTop: 16 }}>
          <h4>Crop Avatar</h4>
          <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto" }}>
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{ containerStyle: { width: "100%", height: "100%" } }}
            />
          </div>
          <button onClick={() => setShowCropper(false)} style={{ marginTop: 12 }}>Crop</button>
        </div>
      )}
      <button onClick={upload} style={{ marginTop: 12 }}>Save</button>
      <button onClick={onClose} style={{ marginLeft: 8 }}>Close</button>
    </div>
  );
}
