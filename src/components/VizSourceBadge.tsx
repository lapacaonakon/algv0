import { Cpu, Film } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface VizSourceBadgeProps {
  /**
   * true — картинку рисуют переменные из выполненного Python-кода,
   * false — компонент показывает собственную встроенную демонстрацию.
   */
  linked: boolean;
  /**
   * Компилятор уже выполнил код и прислал шаг, но переменных на нём нет
   * (отладчик стоит ДО первой строки или в коде другие имена). Это не «демо»:
   * подпись должна объяснять, почему картинка ещё не изменилась.
   */
  awaiting?: boolean;
  /** Строка пользовательского кода, на которой стоит отладчик. */
  line?: number;
  /** Короткая подпись данных компилятора: «матрица 5×5», «i=2, j=3», «dist: 7 вершин». */
  detail?: string;
  /** Как называется встроенная демонстрация (для подписи в режиме демо). */
  demoTitle?: string;
  /** Размеры демо-сетки и данных пользователя не совпали — показываем предупреждение. */
  mismatch?: string | null;
  className?: string;
}

/**
 * Явный индикатор источника данных визуализации.
 *
 * Без него демонстрация молча проигрывала собственный захардкоженный сценарий,
 * когда редактор Python пуст или в нём другие имена/размерности, — выглядело
 * так, будто компилятор «исполняет какой-то свой код». Теперь режим виден:
 * «из компилятора» или «встроенное демо».
 */
export function VizSourceBadge({ linked, awaiting = false, line, detail, demoTitle, mismatch, className = "" }: VizSourceBadgeProps) {
  const tip = linked
    ? `Значения берутся из выполненного Python-кода${detail ? `: ${detail}` : ""}. Измените переменные в панели — картинка обновится.`
    : awaiting
      ? `Панель Python выполнила код и стоит на строке ${line ?? 1}: на этом шаге переменные ещё не созданы, поэтому картинка пока своя. Нажмите «шаг вперёд» (→) или «в конец трассы» — демонстрация перейдёт на значения из кода. Если ваши имена переменных другие, визуализация их не увидит: список имён этой темы есть в панели компилятора.`
      : "Сейчас показана встроенная демонстрация компонента, а не ваш код. Откройте панель Python и запустите код (▶ или кнопка-«глаз») — визуализация переключится на ваши переменные.";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <Tooltip side="bottom" content={tip}>
        <span
          tabIndex={0}
          className={`cursor-help inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
            linked
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
              : awaiting
                ? "border-sky-500/50 bg-sky-500/10 text-sky-300"
                : "border-slate-600 bg-slate-800/80 text-slate-300"
          }`}
        >
          {linked ? <Cpu className="h-3 w-3" /> : awaiting ? <Cpu className="h-3 w-3 animate-pulse" /> : <Film className="h-3 w-3" />}
          {linked ? "данные из компилятора" : awaiting ? `компилятор выполнен · переменных пока нет${line ? ` (строка ${line})` : ""}` : "встроенное демо"}
          {linked && detail ? <span className="font-mono text-emerald-200/80">· {detail}</span> : null}
        </span>
      </Tooltip>

      {!linked && !awaiting && demoTitle ? (
        <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
          сценарий: {demoTitle}
        </span>
      ) : null}

      {mismatch ? (
        <Tooltip side="bottom" content={mismatch}>
          <span
            tabIndex={0}
            className="cursor-help rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300"
          >
            размерность не совпадает
          </span>
        </Tooltip>
      ) : null}
    </div>
  );
}
