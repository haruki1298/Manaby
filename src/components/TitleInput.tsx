import { Note } from '@/modules/notes/note.entity';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextAreaAutoSize from 'react-textarea-autosize';

interface TitleInputProps {
  initialData: Note;
  onTitleChange: (val: string) => void;
  readOnly?: boolean;
}

export function TitleInput({ initialData, onTitleChange, readOnly = false }: TitleInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialData.title ?? t('notes.title.placeholder'));

  const handleTnputChange = (value: string) => {
    if (readOnly) return;
    setValue(value);
    onTitleChange(value);
  };
  return (
    <div className="pl-[54px] group relative">      <TextAreaAutoSize
        className={`text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F 
        resize-none ${readOnly ? 'cursor-default' : ''}`}
        value={value}
        onChange={(e) => handleTnputChange(e.target.value)}
        readOnly={readOnly}
      />
    </div>
  );
}
