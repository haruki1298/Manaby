import { useEffect, useState } from 'react';
import { noteRepository } from '@/modules/notes/note.repository';
import { X, UserPlus, Edit } from 'lucide-react';

interface Collaborator {
  id: number;
  user_id: string;
  permission: string | null;
  invited_by?: string;
  created_at: string | null;
}

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  isOwner: boolean;
}

export function CollaboratorModal({ isOpen, onClose, noteId, isOwner }: CollaboratorModalProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen, noteId]);

  const fetchCollaborators = async () => {
    try {
      const data = await noteRepository.getCollaborators(noteId);
      setCollaborators(data || []);
    } catch (error) {
      console.error('Failed to fetch collaborators:', error);
    }
  };
  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return;
    
    setLoading(true);
    try {
      await noteRepository.addCollaborator(noteId, newCollaboratorEmail, 'write');
      setNewCollaboratorEmail('');
      fetchCollaborators();
    } catch (error: any) {
      alert(error.message || '共同編集者の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await noteRepository.removeCollaborator(noteId, userId);
      fetchCollaborators();
    } catch (error: any) {
      alert(error.message || '共同編集者の削除に失敗しました');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">共同編集者管理</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isOwner && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">新しい共同編集者を追加</h3>            <div className="flex gap-2 mb-2">
              <input
                type="email"
                placeholder="メールアドレス"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100">
                編集可能
              </div>
            </div>
            <button
              onClick={handleAddCollaborator}
              disabled={loading || !newCollaboratorEmail.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="h-4 w-4" />
              追加
            </button>
          </div>
        )}

        <div>
          <h3 className="font-medium mb-2">現在の共同編集者</h3>
          {collaborators.length === 0 ? (
            <p className="text-gray-500 text-sm">共同編集者はいません</p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-2 border rounded">                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{collaborator.user_id.length > 20 ? collaborator.user_id : collaborator.user_id}</span>
                  </div>
                  
                  {isOwner ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        編集可能
                      </span>
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator.user_id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      編集可能
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
