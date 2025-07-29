import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/mantine/style.css';
import { BlockNoteView } from '@blocknote/mantine';
import { ja, en } from "@blocknote/core/locales";
import { useSettings } from '@/modules/settings/settings.state.tsx';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string | null;
  readOnly?: boolean;
}

function Editor({ onChange, initialContent, readOnly = false }: EditorProps) {
  const { settings } = useSettings();
  
  const editor = useCreateBlockNote({
    dictionary: settings.defaultLanguage === 'en' ? en : ja,
    initialContent:
      initialContent != null ? JSON.parse(initialContent) : undefined,
  });

  return (
    <div className="prose dark:prose-invert max-w-none w-full overflow-hidden">
      <BlockNoteView  
        editor={editor}
        editable={!readOnly} // ← ここで編集可否を制御
        onChange={() => onChange(JSON.stringify(editor.document))}
        className="w-full min-w-0"
      />
    </div>
  );
}

export default Editor;
