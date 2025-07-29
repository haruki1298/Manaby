import { Note } from '@/modules/notes/note.entity';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextAreaAutoSize from 'react-textarea-autosize';

interface TitleInputProps {
  initialData: Note;
  onTitleChange: (val: string) => void;
  readOnly?: boolean;
  titleColor?: string; // 新しく追加
}

export function TitleInput({ initialData, onTitleChange, readOnly = false, titleColor }: TitleInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialData.title ?? t('notes.title.placeholder'));

  const handleTnputChange = (value: string) => {
    if (readOnly) return;
    setValue(value);
    onTitleChange(value);
  };
  
  return (
    <div className="pl-4 sm:pl-[54px] group relative w-full">
      <TextAreaAutoSize
        className={`title-input text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-transparent font-bold break-words outline-none
        resize-none w-full ${readOnly ? 'cursor-default' : ''}`}
        style={{ color: titleColor, wordWrap: 'break-word', overflowWrap: 'break-word' }}
        value={value}
        onChange={(e) => handleTnputChange(e.target.value)}
        readOnly={readOnly}
      />
    </div>
  );
}
