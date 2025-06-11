import Editor from '@/components/Editor';
import { TitleInput } from '@/components/TitleInput';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { title } from 'process';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const NoteDetail = () => {
  const params = useParams();
  const id = parseInt(params.id!);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();
  const note = noteStore.getOne(id);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);

  useEffect(() => {
    fetchOne()
  }, [id]);
  
  const fetchOne = async () => {
    setIsLoading(true);
    const note = await noteRepository.findOne(currentUser!.id, id);
    if(note == null) return;
    noteStore.set([note]);
    setIsLoading(false);
  };

  const updataNote = async (
    id: number,
    note: { title?: string; content?: string }
  ) => {
    const updataNote = await noteRepository.updata(id, note);
    if(updataNote == null) return;
    noteStore.set([updataNote]);
    return updataNote;
  };

  const handlePublish = async () => {
    await noteRepository.setPublic(id, true);
    setIsPublicModalOpen(false);
    fetchOne();
  };

  if(isLoading) return <div />;
  if(note == null) return <div>note is not existed</div>;
  console.log(note);

  return (
    <div className="pb-40 pt-20">
      <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
        <TitleInput 
          initialData={note} 
          onTitleChange={(title)=> updataNote(id, { title })}
          />
          <Editor 
          initialContent={note.content}
          onChange={(content)=> updataNote(id, { content })}/>
          <button
  className="absolute right-0 top-0 px-4 py-2 bg-blue-500 text-white rounded"
  onClick={() => setIsPublicModalOpen(true)}
>
  公開
</button>
{isPublicModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
      <h2 className="text-lg font-bold mb-4">このノートを公開しますか？</h2>
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 rounded bg-gray-200"
          onClick={() => setIsPublicModalOpen(false)}
        >
          キャンセル
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={handlePublish}
        >
          公開
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default NoteDetail;
