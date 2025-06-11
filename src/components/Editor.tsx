import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/mantine/style.css';
import { BlockNoteView } from '@blocknote/mantine';
import { ja } from "@blocknote/core/locales";
import { useEffect } from "react";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string | null;
  readOnly?: boolean;
}

function Editor({ onChange, initialContent, readOnly = false }: EditorProps) {
  const editor = useCreateBlockNote({
    dictionary: ja,
    initialContent:
      initialContent != null ? JSON.parse(initialContent) : undefined,
  });

  return (
    <div>
      <BlockNoteView  
        editor={editor}
        editable={!readOnly} // ← ここで編集可否を制御
        onChange={() => onChange(JSON.stringify(editor.document))}
      />
    </div>
  );
}

export default Editor;
