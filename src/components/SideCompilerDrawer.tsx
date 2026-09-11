import { createPortal } from "react-dom";
import { CompilerPanelContent } from "./CompilerPanelContent";

interface Props {
  chapterId: string;
  open: boolean;
  onClose: () => void;
  onOpenFull: () => void;
}

/**
 * Мобильный drawer — на десктопе используется inline панель в App.tsx,
 * здесь — только оверлей для телефонов (lg:hidden в App).
 * Контент переиспользует CompilerPanelContent — минималистичные комменты + кнопки Шаг/Пуск/Запустить.
 */
export function SideCompilerDrawer({ chapterId, open, onClose, onOpenFull }: Props) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-end lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative w-[92vw] max-w-[400px] h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
        <CompilerPanelContent chapterId={chapterId} onClose={onClose} onOpenFull={onOpenFull} />
      </div>
    </div>,
    document.body
  );
}
