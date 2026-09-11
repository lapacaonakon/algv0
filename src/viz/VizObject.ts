/**
 * Визуализация — отдельный объект с двумя наследниками:
 *  - наследник код реализации (как алгоритм пишется)
 *  - наследник структура переменных (какие i,j,k,n,m сейчас подсвечены)
 *
 * Единый Python-компилятор — движок и для визуализаций, и для кода пользователя.
 * По дефолту терминал пустой с захардкоженными переменными (i,j=0,0 и 4→1),
 * кнопка "показать код" раскрывает реализацию под визуализацией.
 */

export abstract class VizObject {
  /** Заголовок визуализации */
  abstract title: string;
  /** Идентификатор главы для синхронизации */
  abstract chapterId: string;
  /** Захардкоженные переменные текущего шага — структура переменных (наследник 1) */
  abstract getVars(): Record<string, string | number>;
  /** Код реализации — минимальный для понимания, без перегрузки (наследник 2) */
  abstract getCode(): string;
  /** Подсветка в визуализации — какой элемент сейчас активен */
  abstract getHighlight(): { i?: number; j?: number; k?: number } | null;
}

/** Наследник 1: структура переменных — живые значения как в отладчике */
export abstract class VizVars extends VizObject {
  abstract override getVars(): Record<string, string | number>;
}

/** Наследник 2: код реализации — строки которые показывают алгоритм */
export abstract class VizCode extends VizObject {
  abstract override getCode(): string;
}
