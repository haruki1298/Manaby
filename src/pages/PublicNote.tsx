import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { noteRepository } from "@/modules/notes/note.repository";
import Editor from "@/components/Editor";
import { useTranslation } from "react-i18next";

const PublicNote = () => {
  const { t } = useTranslation();
  const params = useParams();
  const id = parseInt(params.id!);
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    const noteWithCreator = await noteRepository.getPublicNoteWithCreator(id);
    setNote(noteWithCreator);
  };

  if (!note) return <div>{t('notes.notFound')}</div>;

  return (
    <div className="pb-40 pt-20">
      <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{note.title ?? t('notes.untitled')}</h1>
        <div className="mb-4 text-gray-600 text-sm">
          {t('notes.creator')}: {note.creator_name} | {t('notes.createdDate')}: {new Date(note.created_at).toLocaleDateString('ja-JP')}
        </div>
        <Editor initialContent={note.content} onChange={() => {}} readOnly />
        <div className="mt-4 text-gray-500 text-sm">{t('notes.readOnlyNote')}</div>
      </div>
    </div>
  );
};

export default PublicNote;