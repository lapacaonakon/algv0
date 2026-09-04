import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award, RotateCcw, AlertCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: 'Что мы делаем в алгоритме Краскала, если очередное дешевое ребро соединяет две вершины, которые УЖЕ окрашены в один (например, красный) цвет?',
    options: [
      'Мы радуемся и добавляем его в минимальное остовное дерево.',
      'Мы перекрашиваем их в синий цвет и делим граф пополам.',
      'Мы безжалостно ВЫБРАСЫВАЕМ это ребро, иначе получится цикл (замкнутый контур одного цвета).',
      'Мы вызываем алгоритм Дейкстры для поиска нового ребра.'
    ],
    correctAnswer: 2,
    explanation: 'Верно! Если вершины уже в одном клане (одного цвета), добавление ребра между ними замкнет контур и создаст лишний цикл. Это нарушит структуру дерева.'
  },
  {
    id: 2,
    question: 'Почему алгоритм Дейкстры впадает в ступор при виде ребер с отрицательным весом?',
    options: [
      'Потому что он написан только для положительных чисел типа unsigned int.',
      'Он жадный и считает, что каждый следующий шаг делает общий путь только длиннее или равным. Он не умеет возвращаться и пересчитывать закрытые вершины.',
      'Отрицательные ребра создают гравитационный коллапс в оперативной памяти.',
      'Дейкстра просто не любил отрицательные балансы на кредитках.'
    ],
    correctAnswer: 1,
    explanation: 'Именно! Дейкстра уверен: если ты приехал в город А, то путь туда окончателен. Отрицательные ребра требуют перерасчета, для чего нужен алгоритм Беллмана-Форда.'
  },
  {
    id: 3,
    question: 'Какова ключевая фишка алгоритма Борувки (Билет 20) по сравнению с последовательными Краскалом и Примой?',
    options: [
      'Он использует меньше памяти благодаря коммунистическим идеям.',
      'Он умеет работать с отрицательными весами без циклов.',
      'Он позволяет выполнять шаги слияния колхозов (компонент) ПАРАЛЛЕЛЬНО на нескольких ядрах процессора или GPU, ускоряя расчеты.',
      'Он был разработан в Токио и поэтому самый быстрый на японских железных дорогах.'
    ],
    correctAnswer: 2,
    explanation: 'Абсолютно верно! В Борувке каждая компонента (колхоз) ищет минимальное ребро независимо. Это позволяет идеально распараллелить вычисления на GPU или многопроцессорных кластерах.'
  },
  {
    id: 4,
    question: 'В чем главная суть Динамического программирования (ДП)?',
    options: [
      'Писать код очень быстро, динамично нажимая на клавиши.',
      'Запоминать (кешировать) результаты уже решенных подзадач в таблицу, чтобы не вычислять их заново.',
      'Использовать динамическую типизацию как в Python или JavaScript.',
      'Постоянно менять требования к проекту в процессе разработки.'
    ],
    correctAnswer: 1,
    explanation: 'Точно! Главный принцип ДП — мемоизация или табуляция: запиши ответ, чтобы не пересчитывать его снова.'
  },
  {
    id: 5,
    question: 'Какая структура данных идеально помогает алгоритмам MST проверять, лежат ли вершины в одном множестве (клане / колхозе)?',
    options: [
      'СНМ (Система непересекающихся множеств / Disjoint-Set Union / DSU).',
      'Стек (LIFO).',
      'Красно-черное дерево.',
      'Хэш-таблица со списками коллизий.'
    ],
    correctAnswer: 0,
    explanation: 'Блестяще! СНМ (DSU) позволяет за практически O(1) делать операции find (поиск лидера клана) и union (объединение кланов).'
  }
];

export const ExpressQuiz: React.FC = () => {
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);

  const currentQ = quizQuestions[currentQIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQ.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex + 1 < quizQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto text-center backdrop-blur-sm my-12">
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-2">Тест завершен!</h3>
        <p className="text-slate-400 text-sm mb-6">Ты проверил свои знания по теории графов и анализу сложности алгоритмов.</p>
        
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-mono mb-1">Итоговый результат</p>
          <p className="text-5xl font-black text-indigo-400 mb-2">{score} / {quizQuestions.length}</p>
          <p className="text-slate-300 text-sm">
            {score === quizQuestions.length
              ? '🏆 Идеально! Ты настоящий сеньор-раскрашиватель графов. Ни одного лишнего цикла!'
              : score >= 3
              ? '🔥 Отличный результат! Главные концепции усвоены уверенно.'
              : '📚 Стоит повторить главы пособия и еще раз покрутить интерактивный симулятор.'}
          </p>
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Пройти тест заново</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto backdrop-blur-sm my-12">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Экспресс-тест
          </span>
          <h3 className="text-xl font-bold text-white">Проверка знаний без духоты</h3>
        </div>
        <span className="text-sm font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
          Вопрос {currentQIndex + 1} / {quizQuestions.length}
        </span>
      </div>

      <div className="mb-8">
        <h4 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug mb-6">
          {currentQ.question}
        </h4>

        <div className="space-y-4">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswer;
            
            let optionStyle = "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 cursor-pointer";
            if (isAnswered) {
              if (isCorrect) {
                optionStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950";
              } else if (isSelected) {
                optionStyle = "bg-rose-950/80 border-rose-500 text-rose-200 shadow-lg shadow-rose-950";
              } else {
                optionStyle = "bg-slate-800/40 border-slate-800 text-slate-500 cursor-default";
              }
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={"flex items-start gap-4 p-4 md:p-5 rounded-xl border-2 transition-all " + optionStyle}
              >
                <div className="mt-0.5 shrink-0">
                  {isAnswered && isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : isAnswered && isSelected && !isCorrect ? (
                    <XCircle className="w-6 h-6 text-rose-400" />
                  ) : (
                    <div className={"w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold " + (isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-600 text-slate-400")}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm md:text-base font-medium leading-relaxed">
                  {option}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl mb-8 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Объяснение:</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {currentQ.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={
            "px-8 py-3.5 font-bold rounded-xl transition-all shadow-lg cursor-pointer " +
            (!isAnswered
              ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30")
          }
        >
          {currentQIndex + 1 < quizQuestions.length ? 'Следующий вопрос' : 'Показать результаты'}
        </button>
      </div>
    </div>
  );
};
