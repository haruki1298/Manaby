import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (email: string) => void;
  noteTitle: string;
}

export function ShareModal({ isOpen, onClose, onShare, noteTitle }: ShareModalProps) {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleShare = () => {
    if (email) {
      onShare(email);
      setEmail("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">「{noteTitle}」を共有</h2>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="共有先のメールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={() => {
              setEmail("");
              onClose();
            }}
          >
            キャンセル
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleShare}
            disabled={!email}
          >
            共有する
          </button>
        </div>
      </div>
    </div>
  );
}