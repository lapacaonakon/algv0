import { liveMatrix, pickLiveVar, useVizRuntime } from "../data/vizStepBus";
import { VizSourceBadge } from "./VizSourceBadge";

interface VizLiveStatusProps {
  /** Название демонстрации — подписывается в режиме встроенного сценария. */
  demoTitle?: string;
  className?: string;
}

/** Имена, по которым визуализации обычно читают матрицы/таблицы. */
const MATRIX_NAMES = ["d", "dist", "dp", "D", "S", "P", "pref", "st", "st2", "A", "a", "grid", "memo", "tbl"];

/**
 * Строка состояния связи «компилятор → демонстрация» для ЛЮБОЙ визуализации.
 *
 * Раньше компонент молча проигрывал собственный встроенный сценарий, если в
 * редакторе Python был пустой код, код с другими именами или данные другой
 * размерности, — выглядело так, будто компилятор исполняет что-то своё, а
 * картинка живёт отдельной жизнью. Теперь источник данных всегда подписан:
 * «данные из компилятора (i, j, dist 5×5)», «компилятор выполнен · переменных
 * пока нет» (отладчик стоит до первой строки) или «встроенное демо».
 */
export function VizLiveStatus({ demoTitle, className = "" }: VizLiveStatusProps) {
  const runtime = useVizRuntime();
  const vars = runtime?.variables;
  const names = vars ? Object.keys(vars).filter((name) => !name.startsWith("__")) : [];
  const linked = names.length > 0;

  const matrixSource = pickLiveVar(vars, MATRIX_NAMES);
  const matrix = liveMatrix(matrixSource?.value);

  const detail = matrix
    ? `${matrixSource?.name} ${matrix.sizeLabel}`
    : names.length
      ? names.slice(0, 6).join(", ") + (names.length > 6 ? " …" : "")
      : undefined;

  return (
    <VizSourceBadge
      linked={linked}
      awaiting={!linked && !!runtime}
      line={runtime?.line}
      detail={detail}
      demoTitle={demoTitle}
      className={className}
    />
  );
}
