import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { noteRepository } from "@/modules/notes/note.repository";
import Editor from "@/components/Editor";

const PublicNote = () => {
  const params = useParams();
  const id = parseInt(params.id!);
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    const notes = await noteRepository.findPublicNotes();
    const found = notes?.find((n) => n.id === id);
    setNote(found);
  };

  if (!note) return <div>ノートが見つかりません</div>;

  return (
    <div className="pb-40 pt-20">
      <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{note.title ?? "無題"}</h1>
        <Editor initialContent={note.content} onChange={() => {}} readOnly />
        <div className="mt-4 text-gray-500 text-sm">※このノートは閲覧専用です</div>
      </div>
    </div>
  );
};

export default PublicNote;