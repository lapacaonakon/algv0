import React, { useState } from 'react';
import { Play, RotateCcw, SkipForward, HelpCircle, CheckCircle, XCircle, GitGraph, Layers, Users, BookOpen, Clock, Code, Award } from 'lucide-react';

interface Vertex {
  id: number;
  label: string;
  x: number;
  y: number;
  color: string; // 'none', 'red', 'blue', 'purple', 'mold', 'gold', etc.
}

interface Edge {
  id: string;
  u: number;
  v: number;
  weight: number;
  status: 'pending' | 'inspecting' | 'included' | 'rejected' | 'in_heap';
  color: string;
}

interface StepLog {
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// 9 Vertices layout
const initialVertices: Vertex[] = [
  { id: 0, label: 'A', x: 20, y: 20, color: 'none' },
  { id: 1, label: 'B', x: 50, y: 13, color: 'none' },
  { id: 2, label: 'C', x: 80, y: 20, color: 'none' },
  { id: 3, label: 'D', x: 18, y: 50, color: 'none' },
  { id: 4, label: 'E', x: 50, y: 50, color: 'none' },
  { id: 5, label: 'F', x: 82, y: 50, color: 'none' },
  { id: 6, label: 'G', x: 20, y: 80, color: 'none' },
  { id: 7, label: 'H', x: 50, y: 87, color: 'none' },
  { id: 8, label: 'I', x: 80, y: 80, color: 'none' },
];

// 12 Edges connecting the 9 vertices
const initialEdges: Edge[] = [
  { id: '0-1', u: 0, v: 1, weight: 2, status: 'pending', color: 'none' },  // A-B (2)
  { id: '3-4', u: 3, v: 4, weight: 3, status: 'pending', color: 'none' },  // D-E (3)
  { id: '1-2', u: 1, v: 2, weight: 4, status: 'pending', color: 'none' },  // B-C (4)
  { id: '0-3', u: 0, v: 3, weight: 5, status: 'pending', color: 'none' },  // A-D (5)
  { id: '1-4', u: 1, v: 4, weight: 6, status: 'pending', color: 'none' },  // B-E (6) - cycle in Kruskal
  { id: '4-5', u: 4, v: 5, weight: 7, status: 'pending', color: 'none' },  // E-F (7)
  { id: '3-6', u: 3, v: 6, weight: 8, status: 'pending', color: 'none' },  // D-G (8)
  { id: '2-5', u: 2, v: 5, weight: 9, status: 'pending', color: 'none' },  // C-F (9) - cycle in Kruskal
  { id: '6-7', u: 6, v: 7, weight: 10, status: 'pending', color: 'none' }, // G-H (10)
  { id: '4-7', u: 4, v: 7, weight: 11, status: 'pending', color: 'none' }, // E-H (11) - cycle in Kruskal
  { id: '7-8', u: 7, v: 8, weight: 12, status: 'pending', color: 'none' }, // H-I (12)
  { id: '5-8', u: 5, v: 8, weight: 13, status: 'pending', color: 'none' }, // F-I (13) - cycle in Kruskal
];

export const KruskalSimulator: React.FC = () => {
  const [activeAlgo, setActiveAlgo] = useState<'kruskal' | 'prim' | 'boruvka'>('kruskal');
  const [vertices, setVertices] = useState<Vertex[]>(initialVertices);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [heapQueue, setHeapQueue] = useState<string[]>([]);
  const [activeCheatTab, setActiveCheatTab] = useState<'kruskal' | 'prim' | 'boruvka'>('kruskal');

  const [logs, setLogs] = useState<StepLog[]>([
    {
      title: 'Введение в раскраску (Краскал)',
      description: '«Краскал — это раскраска?». Представь, что все 9 вершин графа — бесцветные. Мы выписали ребра по возрастанию веса. Готовы начинать!',
      type: 'info',
    },
  ]);

  // --- KRUSKAL STEPS ---
  const kruskalSteps = [
    // Step 1: Inspect A-B (2)
    () => {
      setEdges(prev => prev.map(e => e.id === '0-1' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 1: Берем самое дешевое ребро A-B (вес 2)',
        description: 'Оно соединяет две бесцветные вершины A и B. Согласно нашей аналогии, мы красим их в КРАСНЫЙ цвет!',
        type: 'info'
      }, ...prev]);
    },
    // Step 2: Include A-B
    () => {
      setVertices(prev => prev.map(v => v.id === 0 || v.id === 1 ? { ...v, color: 'red' } : v));
      setEdges(prev => prev.map(e => e.id === '0-1' ? { ...e, status: 'included', color: 'red' } : e));
      setLogs(prev => [{
        title: 'Успех: Ребро A-B в остове',
        description: 'Вершины A and B окрашены в красный цвет. Образован красный клан.',
        type: 'success'
      }, ...prev]);
    },
    // Step 3: Inspect D-E (3)
    () => {
      setEdges(prev => prev.map(e => e.id === '3-4' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 2: Берем второе ребро D-E (вес 3)',
        description: 'Оно соединяет две другие бесцветные вершины D и E. По правилу раскраски, мы красим их в СИНИЙ цвет!',
        type: 'info'
      }, ...prev]);
    },
    // Step 4: Include D-E
    () => {
      setVertices(prev => prev.map(v => v.id === 3 || v.id === 4 ? { ...v, color: 'blue' } : v));
      setEdges(prev => prev.map(e => e.id === '3-4' ? { ...e, status: 'included', color: 'blue' } : e));
      setLogs(prev => [{
        title: 'Успех: Ребро D-E в остове',
        description: 'Вершины D и E окрашены в синий цвет. Создан независимый синий клан.',
        type: 'success'
      }, ...prev]);
    },
    // Step 5: Inspect B-C (4)
    () => {
      setEdges(prev => prev.map(e => e.id === '1-2' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 3: Берем ребро B-C (вес 4)',
        description: 'Оно соединяет красную вершину B и бесцветную C. Мы захватываем C в красный клан.',
        type: 'info'
      }, ...prev]);
    },
    // Step 6: Include B-C
    () => {
      setVertices(prev => prev.map(v => v.id === 2 ? { ...v, color: 'red' } : v));
      setEdges(prev => prev.map(e => e.id === '1-2' ? { ...e, status: 'included', color: 'red' } : e));
      setLogs(prev => [{
        title: 'Успех: Ребро B-C в остове',
        description: 'Вершина C перекрашена в красный цвет.',
        type: 'success'
      }, ...prev]);
    },
    // Step 7: Inspect A-D (5)
    () => {
      setEdges(prev => prev.map(e => e.id === '0-3' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 4: Берем ребро A-D (вес 5)',
        description: 'ВНИМАНИЕ! Ребро соединяет КРАСНУЮ вершину A и СИНЮЮ вершину D. Правило: "Если ребро соединяет красную вершину и синюю — мы перекрашиваем всё в один цвет!"',
        type: 'warning'
      }, ...prev]);
    },
    // Step 8: Include A-D (Merge to purple)
    () => {
      setVertices(prev => prev.map(v => v.color === 'blue' || v.color === 'red' ? { ...v, color: 'purple' } : v));
      setEdges(prev => prev.map(e => e.status === 'included' || e.id === '0-3' ? { ...e, status: 'included', color: 'purple' } : e));
      setLogs(prev => [{
        title: 'Слияние кланов: Ребро A-D добавлено',
        description: 'Мы объединили красный и синий кланы в единое мощное фиолетовое супер-множество (СНМ / DSU сработал!).',
        type: 'success'
      }, ...prev]);
    },
    // Step 9: Inspect B-E (6) - Cycle!
    () => {
      setEdges(prev => prev.map(e => e.id === '1-4' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 5: Берем ребро B-E (вес 6)',
        description: 'НО: это ребро соединяет вершины B и E, которые И ТАК уже одного (фиолетового) цвета!',
        type: 'warning'
      }, ...prev]);
    },
    // Step 10: Reject B-E
    () => {
      setEdges(prev => prev.map(e => e.id === '1-4' ? { ...e, status: 'rejected' } : e));
      setLogs(prev => [{
        title: 'Отказ: Цикл обнаружен!',
        description: 'Мы выбрасываем ребро B-E. Иначе получится замкнутый контур одного цвета (цикл).',
        type: 'error'
      }, ...prev]);
    },
    // Step 11: Inspect E-F (7)
    () => {
      setEdges(prev => prev.map(e => e.id === '4-5' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 6: Берем ребро E-F (вес 7)',
        description: 'Оно соединяет фиолетовую вершину E и бесцветную F. Добавляем F в наш остов.',
        type: 'info'
      }, ...prev]);
    },
    // Step 12: Include E-F
    () => {
      setVertices(prev => prev.map(v => v.id === 5 ? { ...v, color: 'purple' } : v));
      setEdges(prev => prev.map(e => e.id === '4-5' ? { ...e, status: 'included', color: 'purple' } : e));
      setLogs(prev => [{
        title: 'Успех: Ребро E-F в остове',
        description: 'Вершина F окрашена в фиолетовый цвет.',
        type: 'success'
      }, ...prev]);
    },
    // Step 13: Inspect D-G (8)
    () => {
      setEdges(prev => prev.map(e => e.id === '3-6' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 7: Берем ребро D-G (вес 8)',
        description: 'Оно соединяет фиолетовую вершину D и бесцветную G.',
        type: 'info'
      }, ...prev]);
    },
    // Step 14: Include D-G
    () => {
      setVertices(prev => prev.map(v => v.id === 6 ? { ...v, color: 'purple' } : v));
      setEdges(prev => prev.map(e => e.id === '3-6' ? { ...e, status: 'included', color: 'purple' } : e));
      setLogs(prev => [{
        title: 'Успех: Ребро D-G в остове',
        description: 'Вершина G окрашена в фиолетовый.',
        type: 'success'
      }, ...prev]);
    },
    // Step 15: Inspect C-F (9) - Cycle!
    () => {
      setEdges(prev => prev.map(e => e.id === '2-5' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 8: Берем ребро C-F (вес 9)',
        description: 'Оно соединяет вершины C и F, которые УЖЕ фиолетовые! Это лишний цикл.',
        type: 'warning'
      }, ...prev]);
    },
    // Step 16: Reject C-F
    () => {
      setEdges(prev => prev.map(e => e.id === '2-5' ? { ...e, status: 'rejected' } : e));
      setLogs(prev => [{
        title: 'Отказ: Цикл обнаружен!',
        description: 'Выбрасываем ребро C-F.',
        type: 'error'
      }, ...prev]);
    },
    // Step 17: Inspect G-H (10)
    () => {
      setEdges(prev => prev.map(e => e.id === '6-7' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 9: Берем ребро G-H (вес 10)',
        description: 'Соединяет фиолетовую G и бесцветную H.',
        type: 'info'
      }, ...prev]);
    },
    // Step 18: Include G-H
    () => {
      setVertices(prev => prev.map(v => v.id === 7 ? { ...v, color: 'purple' } : v));
      setEdges(prev => prev.map(e => e.id === '6-7' ? { ...e, status: 'included', color: 'purple' } : e));
      setLogs(prev => [{
        title: 'Успех: Ребро G-H в остове',
        description: 'Вершина H перекрашена в фиолетовый.',
        type: 'success'
      }, ...prev]);
    },
    // Step 19: Inspect E-H (11) - Cycle!
    () => {
      setEdges(prev => prev.map(e => e.id === '4-7' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 10: Берем ребро E-H (вес 11)',
        description: 'Оба конца E и H уже фиолетовые. СНМ сообщает о цикле.',
        type: 'warning'
      }, ...prev]);
    },
    // Step 20: Reject E-H
    () => {
      setEdges(prev => prev.map(e => e.id === '4-7' ? { ...e, status: 'rejected' } : e));
      setLogs(prev => [{
        title: 'Отказ: Цикл обнаружен!',
        description: 'Выбрасываем ребро E-H.',
        type: 'error'
      }, ...prev]);
    },
    // Step 21: Inspect H-I (12)
    () => {
      setEdges(prev => prev.map(e => e.id === '7-8' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 11: Берем ребро H-I (вес 12)',
        description: 'Соединяет фиолетовую H и последнюю бесцветную I.',
        type: 'info'
      }, ...prev]);
    },
    // Step 22: Include H-I
    () => {
      setVertices(prev => prev.map(v => v.id === 8 ? { ...v, color: 'purple' } : v));
      setEdges(prev => prev.map(e => e.id === '7-8' ? { ...e, status: 'included', color: 'purple' } : e));
      setLogs(prev => [{
        title: '🎉 Успех: MST построено Краскалом!',
        description: 'Все 9 вершин окрашены в единый фиолетовый цвет. Оставшееся ребро F-I (13) отбрасывается. Суммарный вес остова: 2 + 3 + 4 + 5 + 7 + 8 + 10 + 12 = 51.',
        type: 'success'
      }, ...prev]);
    },
  ];

  // --- PRIM STEPS ---
  const primSteps = [
    // Step 1: Start at E
    () => {
      setVertices(prev => prev.map(v => v.id === 4 ? { ...v, color: 'mold' } : v));
      setHeapQueue(['D-E (3)', 'B-E (6)', 'E-F (7)', 'E-H (11)']);
      setEdges(prev => prev.map(e => ['3-4', '1-4', '4-5', '4-7'].includes(e.id) ? { ...e, status: 'in_heap' } : e));
      setLogs(prev => [{
        title: 'Шаг 1: Плесень зарождается в Токио (Вершина E)',
        description: 'Мы выбрали вершину E как стартовую. Плесень окрасила её в изумрудно-зеленый. Все исходящие рёбра отправляются в Приоритетную очередь (Heap): D-E(3), B-E(6), E-F(7), E-H(11).',
        type: 'info'
      }, ...prev]);
    },
    // Step 2: Pop D-E (3)
    () => {
      setEdges(prev => prev.map(e => e.id === '3-4' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 2: Куча выдает самое дешевое ребро D-E (вес 3)',
        description: 'Плесень тянется по ребру D-E к вершине D.',
        type: 'info'
      }, ...prev]);
    },
    // Step 3: Include D-E, add D's edges to heap
    () => {
      setVertices(prev => prev.map(v => v.id === 3 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '3-4' ? { ...e, status: 'included', color: 'mold' } : e.id === '0-3' || e.id === '3-6' ? { ...e, status: 'in_heap' } : e));
      setHeapQueue(['A-D (5)', 'B-E (6)', 'E-F (7)', 'D-G (8)', 'E-H (11)']);
      setLogs(prev => [{
        title: 'Успех: Плесень захватила вершину D',
        description: 'В кучу добавлены новые пути из D: A-D(5) и D-G(8). Куча автоматически всплывает A-D(5) наверх!',
        type: 'success'
      }, ...prev]);
    },
    // Step 4: Pop A-D (5)
    () => {
      setEdges(prev => prev.map(e => e.id === '0-3' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 3: Куча выдает ребро A-D (вес 5)',
        description: 'Плесень расширяется в сторону вершины A.',
        type: 'info'
      }, ...prev]);
    },
    // Step 5: Include A-D, add A's edges to heap
    () => {
      setVertices(prev => prev.map(v => v.id === 0 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '0-3' ? { ...e, status: 'included', color: 'mold' } : e.id === '0-1' ? { ...e, status: 'in_heap' } : e));
      setHeapQueue(['A-B (2)', 'B-E (6)', 'E-F (7)', 'D-G (8)', 'E-H (11)']);
      setLogs(prev => [{
        title: 'Успех: Плесень поглотила вершину A',
        description: 'Новое ребро A-B(2) добавлено в кучу и мгновенно заняло 1-е место!',
        type: 'success'
      }, ...prev]);
    },
    // Step 6: Pop A-B (2)
    () => {
      setEdges(prev => prev.map(e => e.id === '0-1' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 4: Куча выдает ребро A-B (вес 2)',
        description: 'Плесень стремительно бежит к вершине B.',
        type: 'info'
      }, ...prev]);
    },
    // Step 7: Include A-B, add B's edges
    () => {
      setVertices(prev => prev.map(v => v.id === 1 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '0-1' ? { ...e, status: 'included', color: 'mold' } : e.id === '1-2' ? { ...e, status: 'in_heap' } : e));
      setHeapQueue(['B-C (4)', 'B-E (6 - цикл)', 'E-F (7)', 'D-G (8)', 'E-H (11)']);
      setLogs(prev => [{
        title: 'Успех: Вершина B захвачена плесенью',
        description: 'В кучу добавлено B-C(4). Ребро B-E(6) всё ещё лежит в куче, но теперь обе вершины B и E заражены.',
        type: 'success'
      }, ...prev]);
    },
    // Step 8: Pop B-C (4)
    () => {
      setEdges(prev => prev.map(e => e.id === '1-2' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 5: Куча выдает ребро B-C (вес 4)',
        description: 'Плесень тянется к вершине C.',
        type: 'info'
      }, ...prev]);
    },
    // Step 9: Include B-C, add C's edges
    () => {
      setVertices(prev => prev.map(v => v.id === 2 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '1-2' ? { ...e, status: 'included', color: 'mold' } : e.id === '2-5' ? { ...e, status: 'in_heap' } : e));
      setHeapQueue(['B-E (6 - цикл)', 'E-F (7)', 'D-G (8)', 'C-F (9)', 'E-H (11)']);
      setLogs(prev => [{
        title: 'Успех: Вершина C захвачена',
        description: 'Ребро C-F(9) добавлено в кучу.',
        type: 'success'
      }, ...prev]);
    },
    // Step 10: Pop B-E (6) - Cycle!
    () => {
      setEdges(prev => prev.map(e => e.id === '1-4' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 6: Куча выдает ребро B-E (вес 6)',
        description: 'ВНИМАНИЕ! Плесень проверяет вершины B и E. Они ОБЕ уже покрыты плесенью! Это ребро внутри грибницы.',
        type: 'warning'
      }, ...prev]);
    },
    // Step 11: Reject B-E
    () => {
      setEdges(prev => prev.map(e => e.id === '1-4' ? { ...e, status: 'rejected' } : e));
      setHeapQueue(['E-F (7)', 'D-G (8)', 'C-F (9)', 'E-H (11)']);
      setLogs(prev => [{
        title: 'Отказ: Игнорируем внутреннее ребро',
        description: 'Ребро B-E отброшено. Плесень не растет сама в себя.',
        type: 'error'
      }, ...prev]);
    },
    // Step 12: Pop E-F (7)
    () => {
      setEdges(prev => prev.map(e => e.id === '4-5' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 7: Куча выдает ребро E-F (вес 7)',
        description: 'Плесень из центра Токио (E) тянется к F.',
        type: 'info'
      }, ...prev]);
    },
    // Step 13: Include E-F, add F's edges
    () => {
      setVertices(prev => prev.map(v => v.id === 5 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '4-5' ? { ...e, status: 'included', color: 'mold' } : e.id === '5-8' ? { ...e, status: 'in_heap' } : e));
      setHeapQueue(['D-G (8)', 'C-F (9 - цикл)', 'E-H (11)', 'F-I (13)']);
      setLogs(prev => [{
        title: 'Успех: Вершина F захвачена',
        description: 'Ребро F-I(13) добавлено в кучу. Ребро C-F(9) теперь ведет из плесени в плесень.',
        type: 'success'
      }, ...prev]);
    },
    // Step 14: Pop D-G (8)
    () => {
      setEdges(prev => prev.map(e => e.id === '3-6' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 8: Куча выдает ребро D-G (вес 8)',
        description: 'Плесень расширяется вниз к G.',
        type: 'info'
      }, ...prev]);
    },
    // Step 15: Include D-G, add G's edges
    () => {
      setVertices(prev => prev.map(v => v.id === 6 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '3-6' ? { ...e, status: 'included', color: 'mold' } : e.id === '6-7' ? { ...e, status: 'in_heap' } : e));
      setHeapQueue(['C-F (9 - цикл)', 'G-H (10)', 'E-H (11)', 'F-I (13)']);
      setLogs(prev => [{
        title: 'Успех: Вершина G захвачена',
        description: 'В кучу добавлено G-H(10).',
        type: 'success'
      }, ...prev]);
    },
    // Step 16: Pop C-F (9) - Cycle!
    () => {
      setEdges(prev => prev.map(e => e.id === '2-5' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 9: Куча выдает ребро C-F (вес 9)',
        description: 'Вершины C и F уже заражены плесенью.',
        type: 'warning'
      }, ...prev]);
    },
    // Step 17: Reject C-F
    () => {
      setEdges(prev => prev.map(e => e.id === '2-5' ? { ...e, status: 'rejected' } : e));
      setHeapQueue(['G-H (10)', 'E-H (11)', 'F-I (13)']);
      setLogs(prev => [{
        title: 'Отказ: Игнорируем ребро C-F',
        description: 'Выбрасываем из кучи.',
        type: 'error'
      }, ...prev]);
    },
    // Step 18: Pop G-H (10)
    () => {
      setEdges(prev => prev.map(e => e.id === '6-7' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 10: Куча выдает ребро G-H (вес 10)',
        description: 'Плесень ползет к вершине H.',
        type: 'info'
      }, ...prev]);
    },
    // Step 19: Include G-H, add H's edges
    () => {
      setVertices(prev => prev.map(v => v.id === 7 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '6-7' ? { ...e, status: 'included', color: 'mold' } : e.id === '7-8' ? { ...e, status: 'in_heap' } : e));
      setHeapQueue(['E-H (11 - цикл)', 'H-I (12)', 'F-I (13)']);
      setLogs(prev => [{
        title: 'Успех: Вершина H захвачена',
        description: 'В кучу добавлено H-I(12).',
        type: 'success'
      }, ...prev]);
    },
    // Step 20: Pop E-H (11) - Cycle!
    () => {
      setEdges(prev => prev.map(e => e.id === '4-7' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 11: Куча выдает E-H (вес 11)',
        description: 'Обе вершины E и H уже в плесени.',
        type: 'warning'
      }, ...prev]);
    },
    // Step 21: Reject E-H
    () => {
      setEdges(prev => prev.map(e => e.id === '4-7' ? { ...e, status: 'rejected' } : e));
      setHeapQueue(['H-I (12)', 'F-I (13)']);
      setLogs(prev => [{
        title: 'Отказ: Игнорируем E-H',
        description: 'Выбрасываем из кучи.',
        type: 'error'
      }, ...prev]);
    },
    // Step 22: Pop H-I (12)
    () => {
      setEdges(prev => prev.map(e => e.id === '7-8' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Шаг 12: Куча выдает H-I (вес 12)',
        description: 'Плесень тянется к последней чистой вершине I.',
        type: 'info'
      }, ...prev]);
    },
    // Step 23: Include H-I
    () => {
      setVertices(prev => prev.map(v => v.id === 8 ? { ...v, color: 'mold' } : v));
      setEdges(prev => prev.map(e => e.id === '7-8' ? { ...e, status: 'included', color: 'mold' } : e));
      setHeapQueue(['F-I (13 - цикл)']);
      setLogs(prev => [{
        title: '🦠 🎉 Успех: Плесень захватила весь граф (Прима)!',
        description: 'Все 9 вершин поглощены. Итоговый остов абсолютно идентичен остову Краскала (вес 51). Но логика роста была совершенно иной — мы разрастались из одной точки с помощью Приоритетной очереди!',
        type: 'success'
      }, ...prev]);
    },
  ];

  // --- BORUVKA STEPS ---
  const boruvkaSteps = [
    // Step 1: Five-Year Plan 1 (Inspecting outgoing)
    () => {
      // Highlight the cheapest outgoing edges for EACH of the 9 independent components (villages)
      // Node 0(A) -> A-B(2)
      // Node 1(B) -> A-B(2)
      // Node 2(C) -> B-C(4)
      // Node 3(D) -> D-E(3)
      // Node 4(E) -> D-E(3)
      // Node 5(F) -> E-F(7)
      // Node 6(G) -> D-G(8)
      // Node 7(H) -> G-H(10)
      // Node 8(I) -> H-I(12)
      setEdges(prev => prev.map(e => 
        ['0-1', '3-4', '1-2', '4-5', '3-6', '6-7', '7-8'].includes(e.id) ? { ...e, status: 'inspecting' } : e
      ));
      setLogs(prev => [{
        title: 'Первая пятилетка: Каждая деревня выбирает дорогу',
        description: 'Каждая из 9 деревень одновременно смотрит на все дороги, которые из неё выходят, и выбирает самую дешёвую. Например, А выбирает A-B(2), D выбирает D-E(3), а G выбирает D-G(8). Обрати внимание, как 7 ребер подсветились золотым цветом параллельно!',
        type: 'info'
      }, ...prev]);
    },
    // Step 2: Concurrently merge into Kolkhozes (Components)
    () => {
      // Concurrently build chosen roads. Merge into:
      // Component 1: {A, B, C} (colored red)
      // Component 2: {D, E, F, G, H, I} (colored gold/yellow-orange)
      setVertices(prev => prev.map(v => 
        [0, 1, 2].includes(v.id) ? { ...v, color: 'red' } : { ...v, color: 'blue' }
      ));
      setEdges(prev => prev.map(e => {
        if (['0-1', '1-2'].includes(e.id)) {
          return { ...e, status: 'included', color: 'red' };
        }
        if (['3-4', '4-5', '3-6', '6-7', '7-8'].includes(e.id)) {
          return { ...e, status: 'included', color: 'blue' };
        }
        return e;
      }));
      setLogs(prev => [{
        title: 'Слияние: Деревни объединились в колхозы!',
        description: 'Все выбранные дороги построены разом! Теперь у нас есть два крупных хозяйства: Красный колхоз {A, B, C} и Синий колхоз {D, E, F, G, H, I}.',
        type: 'success'
      }, ...prev]);
    },
    // Step 3: Five-Year Plan 2 (Inspecting bridge between Kolkhozes)
    () => {
      // Now both kolkhozes look at all outgoing roads to other kolkhozes.
      // Outgoing roads between {A, B, C} and {D, E, F, G, H, I}:
      // A-D (5), B-E (6), C-F (9).
      // Cheapest is A-D (5).
      setEdges(prev => prev.map(e => e.id === '0-3' ? { ...e, status: 'inspecting' } : e));
      setLogs(prev => [{
        title: 'Вторая пятилетка: Колхозы выбирают мост друг к другу',
        description: 'Теперь Красный и Синий колхозы одновременно ищут самую дешевую дорогу, которая их связывает. Выбор падает на ребро A-D с весом 5. Остальные мосты B-E(6) и C-F(9) отбрасываются как более дорогие.',
        type: 'warning'
      }, ...prev]);
    },
    // Step 4: Concurrently merge into single Kolkhoz
    () => {
      setVertices(prev => prev.map(v => ({ ...v, color: 'purple' })));
      setEdges(prev => prev.map(e => 
        e.status === 'included' || e.id === '0-3' ? { ...e, status: 'included', color: 'purple' } : e
      ));
      setLogs(prev => [{
        title: 'Объединение завершено: Один гигантский агрокомплекс!',
        description: 'Оба колхоза объединились по мосту A-D(5). Все 9 деревень теперь состоят в едином фиолетовом остове.',
        type: 'success'
      }, ...prev]);
    },
    // Step 5: Check remaining edges & mark as rejected
    () => {
      setEdges(prev => prev.map(e => e.status === 'pending' ? { ...e, status: 'rejected' } : e));
      setLogs(prev => [{
        title: '🎉 Успех: MST построен Борувкой за 2 шага (пятилетки)!',
        description: 'Все лишние ребра (B-E, E-H, C-F, F-I) были автоматически отброшены как создающие циклы внутри единого колхоза. Общий вес: 51. Благодаря параллельности, мы потратили всего 2 этапа вместо 12!',
        type: 'success'
      }, ...prev]);
    }
  ];

  const currentSteps = 
    activeAlgo === 'kruskal' ? kruskalSteps : 
    activeAlgo === 'prim' ? primSteps : 
    boruvkaSteps;

  const handleNextStep = () => {
    if (stepIndex < currentSteps.length) {
      currentSteps[stepIndex]();
      setStepIndex(stepIndex + 1);
    }
  };

  const handleReset = (algo: 'kruskal' | 'prim' | 'boruvka') => {
    setActiveAlgo(algo);
    setVertices(initialVertices);
    setEdges(initialEdges);
    setStepIndex(0);
    setHeapQueue([]);
    if (algo === 'kruskal') {
      setLogs([
        {
          title: 'Введение в раскраску (Краскал)',
          description: 'Представь, что все 9 вершин графа — бесцветные. Мы выписали ребра по возрастанию веса. Готовы начинать!',
          type: 'info',
        },
      ]);
    } else if (algo === 'prim') {
      setLogs([
        {
          title: 'Введение в Плесень (Прима)',
          description: 'Логика «Плесени»: выбираем стартовую вершину (Центр Токио - E). Смотрим на исходящие ребра через Приоритетную очередь (Heap) и захватываем соседей!',
          type: 'info',
        },
      ]);
    } else {
      setLogs([
        {
          title: 'Введение в Коллективизацию (Борувка)',
          description: 'Логика «Борувки»: Каждая из 9 деревень параллельно и одновременно ищет свою кратчайшую дорогу к соседней деревне, чтобы объединиться в колхоз.',
          type: 'info',
        },
      ]);
    }
  };

  const getColorClass = (color: string, id: number) => {
    switch (color) {
      case 'red': return 'bg-red-500 border-red-300 text-white shadow-lg shadow-red-500/50';
      case 'blue': return 'bg-blue-500 border-blue-300 text-white shadow-lg shadow-blue-500/50';
      case 'purple': return 'bg-purple-600 border-purple-300 text-white shadow-lg shadow-purple-600/50';
      case 'mold': return 'bg-emerald-500 border-emerald-200 text-slate-950 shadow-lg shadow-emerald-500/50 animate-pulse';
      default: 
        if (activeAlgo === 'prim' && id === 4 && stepIndex === 0) {
          return 'bg-slate-700 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20';
        }
        return 'bg-slate-700 border-slate-500 text-slate-300';
    }
  };

  const getEdgeStroke = (status: string, color: string) => {
    if (status === 'inspecting') return '#f59e0b';
    if (status === 'rejected') return '#ef4444';
    if (status === 'in_heap') return '#0284c7';
    if (status === 'included') {
      if (color === 'red') return '#ef4444';
      if (color === 'blue') return '#3b82f6';
      if (color === 'purple') return '#a855f7';
      if (color === 'mold') return '#10b981';
    }
    return '#475569';
  };

  return (
    <div className="space-y-12">
      
      {/* 3-in-1 MST Simulator Box */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Супер-Интерактив 3 в 1
              </span>
              <h3 className="text-2xl font-bold text-white">Живая симуляция MST (Минимального остова)</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Наблюдай за работой Краскала (Раскраска), Прима (Плесень) и Борувки (Коллективизация) на общем графе из 9 вершин.
            </p>
          </div>

          {/* Algorithm Tabs */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => handleReset('kruskal')}
                className={
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex-1 sm:flex-initial " +
                  (activeAlgo === 'kruskal'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200')
                }
              >
                <GitGraph className="w-3.5 h-3.5" />
                <span>Краскал (Билет 18)</span>
              </button>
              <button
                onClick={() => handleReset('prim')}
                className={
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex-1 sm:flex-initial " +
                  (activeAlgo === 'prim'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200')
                }
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Прима (Билет 19)</span>
              </button>
              <button
                onClick={() => handleReset('boruvka')}
                className={
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex-1 sm:flex-initial " +
                  (activeAlgo === 'boruvka'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200')
                }
              >
                <Users className="w-3.5 h-3.5" />
                <span>Борувка (Билет 20)</span>
              </button>
            </div>

            <button
              onClick={() => handleReset(activeAlgo)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl border border-slate-600 transition-all shadow-md flex-1 sm:flex-initial cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить</span>
            </button>

            <button
              onClick={handleNextStep}
              disabled={stepIndex >= currentSteps.length}
              className={
                "flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex-1 sm:flex-initial cursor-pointer " +
                (stepIndex >= currentSteps.length
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : activeAlgo === 'kruskal'
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                  : activeAlgo === 'prim'
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30")
              }
            >
              <SkipForward className="w-4 h-4" />
              <span>{stepIndex === 0 ? 'Начать' : stepIndex >= currentSteps.length ? 'Готово' : 'Вперед'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Canvas */}
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-center relative min-h-[480px] overflow-hidden">
            
            {/* Legend */}
            <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-lg z-10 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-500" /> Бесцветный
              </div>
              {activeAlgo === 'kruskal' ? (
                <>
                  <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> Клан 1
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-blue-500" /> Клан 2
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-purple-600" /> Итог
                  </div>
                </>
              ) : activeAlgo === 'prim' ? (
                <>
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                    <div className="w-3 h-1 bg-sky-600 rounded" /> В куче (Heap)
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" /> Плесень
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> Колхоз 1
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-blue-500" /> Колхоз 2
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-purple-600" /> Агрокомплекс
                  </div>
                </>
              )}
            </div>

            <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-lg z-10 text-xs font-mono text-slate-300">
              Шаг {stepIndex} / {currentSteps.length}
            </div>

            {/* SVG Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {edges.map(edge => {
                const u = vertices[edge.u];
                const v = vertices[edge.v];
                const strokeColor = getEdgeStroke(edge.status, edge.color);
                const isInspecting = edge.status === 'inspecting';
                const isRejected = edge.status === 'rejected';
                const isInHeap = edge.status === 'in_heap';

                return (
                  <g key={edge.id}>
                    <line
                      x1={u.x + "%"}
                      y1={u.y + "%"}
                      x2={v.x + "%"}
                      y2={v.y + "%"}
                      stroke={strokeColor}
                      strokeWidth={isInspecting ? 4.5 : isInHeap ? 3.5 : 3}
                      strokeDasharray={isRejected ? '4,4' : isInHeap ? '2,2' : 'none'}
                      className={"transition-all duration-500 " + (isInspecting ? 'animate-pulse' : '')}
                    />
                    <text
                      x={(u.x + v.x) / 2 + "%"}
                      y={(u.y + v.y) / 2 + "%"}
                      fill={isInspecting ? '#f59e0b' : isRejected ? '#ef4444' : isInHeap ? '#38bdf8' : edge.status === 'included' ? '#fff' : '#94a3b8'}
                      fontSize="4.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="select-none filter drop-shadow-md"
                      dy="-1.5"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* HTML Overlay for Vertices */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {vertices.map(vertex => (
                <div
                  key={vertex.id}
                  style={{ top: vertex.y + "%", left: vertex.x + "%" }}
                  className={"absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-base border-2 transition-all duration-500 pointer-events-auto shadow-md " + getColorClass(vertex.color, vertex.id)}
                >
                  <span>{vertex.label}</span>
                  {vertex.id === 4 && activeAlgo === 'prim' && (
                    <span className="text-[8px] block -mt-1 opacity-80 leading-none">Токио</span>
                  )}
                </div>
              ))}
            </div>

            {stepIndex >= currentSteps.length && (
              <div className="absolute inset-x-6 bottom-6 bg-slate-900/95 border border-slate-600 p-4 rounded-xl backdrop-blur text-center shadow-xl z-20">
                <p className={"font-bold text-base " + (activeAlgo === 'kruskal' ? 'text-purple-300' : activeAlgo === 'prim' ? 'text-emerald-300' : 'text-rose-300')}>
                  🎉 MST построено с помощью {activeAlgo === 'kruskal' ? 'Краскала' : activeAlgo === 'prim' ? 'Прима' : 'Борувки'}!
                </p>
                <p className="text-slate-300 text-xs mt-1">
                  Общий вес минимального остова: 51. Все 9 вершин соединены оптимально.
                </p>
              </div>
            )}
          </div>

          {/* Logs / Heap */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 flex flex-col h-[480px] overflow-hidden">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-slate-200 text-sm">
                📋 Ход выполнения
              </h4>
            </div>

            {activeAlgo === 'prim' && (
              <div className="p-3 bg-slate-900/60 border-b border-slate-800">
                <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1.5">
                  ⚡ Приоритетная очередь (Min-Heap):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {heapQueue.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Очередь пуста</span>
                  ) : (
                    heapQueue.map((item, idx) => (
                      <span key={idx} className={"px-2 py-1 rounded text-xs font-mono font-bold " + (idx === 0 ? "bg-sky-500 text-slate-950 shadow-md animate-pulse" : "bg-slate-800 text-slate-300 border border-slate-700")}>
                        {item}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    "p-4 rounded-xl border transition-all " +
                    (log.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : log.type === 'warning'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      : log.type === 'error'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300')
                  }
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {log.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {log.type === 'warning' && <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                    {log.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    {log.type === 'info' && <Play className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    <h5 className="font-bold text-sm leading-tight text-white">{log.title}</h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{log.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cheat Sheet: Complexity & Code for all 3 algorithms */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h4 className="text-xl font-bold text-white">Шпаргалка: Сравнение кода и сложности</h4>
          </div>
          
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveCheatTab('kruskal')}
              className={"px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial " + (activeCheatTab === 'kruskal' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200")}
            >
              Краскал (Билет 18)
            </button>
            <button
              onClick={() => setActiveCheatTab('prim')}
              className={"px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial " + (activeCheatTab === 'prim' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200")}
            >
              Прима (Билет 19)
            </button>
            <button
              onClick={() => setActiveCheatTab('boruvka')}
              className={"px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial " + (activeCheatTab === 'boruvka' ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200")}
            >
              Борувка (Билет 20)
            </button>
          </div>
        </div>

        {activeCheatTab === 'kruskal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Сложность времени
                </p>
                <p className="text-2xl font-black text-white font-mono">O(E log E)</p>
                <p className="text-slate-400 text-xs mt-1">Обусловлено сортировкой всех ребер графа перед началом объединения.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-400" /> Сложность памяти
                </p>
                <p className="text-2xl font-black text-white font-mono">O(V + E)</p>
                <p className="text-slate-400 text-xs mt-1">Для хранения массива ребер и структуры DSU (предок-ранг).</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 font-mono text-indigo-300">Суть в одном предложении:</p>
                <p className="text-xs text-slate-300 leading-relaxed">Сортируем все ребра от самого дешевого к дорогому, берем их по очереди и красим вершины в один цвет, бракуя циклы.</p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-full flex flex-col">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" /> Реализация на Python (Кратко)
                </p>
                <pre className="text-xs text-emerald-400 font-mono overflow-x-auto bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 flex-1">
{`# 1. Инициализируем DSU
def find(i):
    if parent[i] == i: return i
    parent[i] = find(parent[i])
    return parent[i]

def union(i, j):
    r_i, r_j = find(i), find(j)
    if r_i != r_j:
        parent[r_i] = r_j
        return True
    return False

# 2. Жадный выбор ребер
edges.sort() # O(E log E)
mst = []
for w, u, v in edges:
    if union(u, v):
        mst.append((u, v, w))`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeCheatTab === 'prim' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Сложность времени
                </p>
                <p className="text-2xl font-black text-white font-mono">O(E log V)</p>
                <p className="text-slate-400 text-xs mt-1">Обусловлено частым выталкиванием ребер из бинарной кучи (priority queue).</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" /> Сложность памяти
                </p>
                <p className="text-2xl font-black text-white font-mono">O(V + E)</p>
                <p className="text-slate-400 text-xs mt-1">Для бинарной кучи и хранения списков смежности графа.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 font-mono text-emerald-300">Суть в одном предложении:</p>
                <p className="text-xs text-slate-300 leading-relaxed">Начинаем с одной вершины и постепенно, как плесень, поглощаем соседние чистые вершины через самое дешевое доступное ребро из кучи.</p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-full flex flex-col">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-400" /> Реализация на Python (Кратко)
                </p>
                <pre className="text-xs text-emerald-400 font-mono overflow-x-auto bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 flex-1">
{`import heapq

def prim(graph, start):
    visited = [False] * len(graph)
    heap = [(0, start, -1)] # (weight, node, parent)
    mst = []
    
    while heap:
        w, u, prev = heapq.heappop(heap)
        if visited[u]: continue
        visited[u] = True
        if prev != -1: mst.append((prev, u, w))
        
        for next_w, v in graph[u]:
            if not visited[v]:
                heapq.heappush(heap, (next_w, v, u))
    return mst`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeCheatTab === 'boruvka' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-400" /> Сложность времени
                </p>
                <p className="text-2xl font-black text-white font-mono">O(E log V)</p>
                <p className="text-slate-400 text-xs mt-1">Обусловлено логарифмическим числом раундов коллективизации (log V пятилеток).</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-rose-400" /> Сложность памяти
                </p>
                <p className="text-2xl font-black text-white font-mono">O(V)</p>
                <p className="text-slate-400 text-xs mt-1">Для DSU и массива поиска самого дешевого ребра для каждого колхоза.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 font-mono text-rose-300">Суть в одном предложении:</p>
                <p className="text-xs text-slate-300 leading-relaxed">Каждая вершина или колхоз ОДНОВРЕМЕННО строит кратчайший мост наружу, организуя массовое распараллеленное слияние.</p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-full flex flex-col">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-rose-400" /> Реализация на Python (Кратко)
                </p>
                <pre className="text-xs text-emerald-400 font-mono overflow-x-auto bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 flex-1">
{`def boruvka(n, edges):
    parent = list(range(n))
    mst = []
    while len(mst) < n - 1:
        # Для каждого колхоза ищем самый дешёвый мост наружу
        cheapest = [-1] * n
        for u, v, w in edges:
            ru, rv = find(u), find(v)
            if ru != rv:
                if cheapest[ru] == -1 or cheapest[ru][2] > w: cheapest[ru] = (u,v,w)
                if cheapest[rv] == -1 or cheapest[rv][2] > w: cheapest[rv] = (u,v,w)
        # Объединяем все колхозы по выбранным мостам
        for bridge in cheapest:
            if bridge != -1 and union(bridge[0], bridge[1]):
                mst.append(bridge)`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
