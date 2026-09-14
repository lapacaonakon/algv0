import React, { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle, Zap } from "lucide-react";
import { quizzes } from "../data/quizzes";

interface Props {
  chapterId: string;
}

/**
 * Блиц по прочитанной теме: 3–5 коротких вопросов с немедленным разбором.
 *
 * Вопросы живут в `src/data/quizzes.ts` (по id главы). Раньше этот файл и
 * компонент-викторина существовали, но не были подключены ни к одной странице —
 * контент был, а добраться до него было нельзя. Теперь блиц стоит после
 * демонстрации: прочитал → посмотрел, как работает → проверил себя.
 *
 * В текстовой версии (`?lite=1`) и в PDF те же вопросы печатаются списком
 * с ответами и разбором — там интерактив не нужен.
 */
export const ChapterQuiz: React.FC<Props> = ({ chapterId }) => {
  const list = quizzes[chapterId];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // другая тема — другой блиц с нуля
  useEffect(() => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }, [chapterId]);

  if (!list || list.length === 0) return null;

  const q = list[idx];
  const answered = picked !== null;
  const correct = answered && picked === q.correctIndex;

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 < list.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <section aria-label="Блиц по теме" className="mt-8 print:hidden">
      <div className="bg-slate-700/50 p-5 rounded-xl border-l-4 border-indigo-500">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <Zap className="w-4 h-4 text-indigo-400" />
            Блиц: {list.length} вопроса по этой теме
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {finished ? `итог ${score}/${list.length}` : `вопрос ${idx +1}/${list.length} · верно ${score}`}
          </span>
        </div>

        {finished ? (
          <div className="text-center py-3">
            <p className="text-sm text-slate-300 mb-1">
              {score === list.length
                ? "Все верно: тему можно закрывать."
                : score * 2 >= list.length
                  ? "Половина и больше верно — стоит перечитать раздел с ловушками."
                  : "Стоит вернуться к тексту страницы: разбор ошибок ниже по списку вопросов."}
            </p>
            <p className="text-2xl font-bold text-white mb-3">
              {score} / {list.length}
            </p>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/50 bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Пройти заново
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-white mb-3">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((option, i) => {
                const isRight = i === q.correctIndex;
                const chosen = picked === i;
                const tone = !answered
                  ? "border-slate-600 bg-slate-800/70 text-slate-200 hover:border-indigo-400 hover:text-white"
                  : isRight
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-100"
                    : chosen
                      ? "border-rose-500 bg-rose-500/15 text-rose-100"
                      : "border-slate-700 bg-slate-800/40 text-slate-500";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(i)}
                    disabled={answered}
                    className={`w-full text-left flex items-start gap-2 rounded-lg border px-3 py-2 text-[13px] leading-snug transition-colors disabled:cursor-default ${tone}`}
                  >
                    {answered && isRight && <CheckCircle2 className="w-4 h-4 shrink-0 mt-px text-emerald-400" />}
                    {answered && chosen && !isRight && <XCircle className="w-4 h-4 shrink-0 mt-px text-rose-400" />}
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div role="status" className="mt-3 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                <p className={`text-xs font-bold mb-1 ${correct ? "text-emerald-300" : "text-rose-300"}`}>
                  {correct ? "Верно" : "Неверно"}
                </p>
                <p className="text-[13px] leading-relaxed text-slate-300">{q.explanation}</p>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={next}
                disabled={!answered}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/50 bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-200 transition-colors hover:bg-indigo-500/25 hover:text-white disabled:opacity-40 disabled:hover:bg-indigo-500/15"
              >
                {idx + 1 < list.length ? "Следующий вопрос" : "Показать итог"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ChapterQuiz;
