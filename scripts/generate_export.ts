import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { chapters } from '../src/data/content';

async function main() {
  console.log('--- Generating Full Code Export (TXT & PDF) ---');

  // 1. Prepare target directories
  const exportDir = path.resolve(process.cwd(), 'export');
  const publicExportDir = path.resolve(process.cwd(), 'public', 'export');
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
  if (!fs.existsSync(publicExportDir)) fs.mkdirSync(publicExportDir, { recursive: true });

  const txtPath = path.join(exportDir, 'full_code_all_pages.txt');
  const pdfPath = path.join(exportDir, 'full_code_all_pages.pdf');

  // 2. Gather all files in the project
  const sourceFiles: { path: string; relativePath: string; category: string }[] = [];

  const addFile = (relPath: string, category: string) => {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      sourceFiles.push({ path: fullPath, relativePath: relPath, category });
    }
  };

  // Main app
  addFile('src/App.tsx', 'Главное приложение (App Shell)');
  addFile('src/main.tsx', 'Точка входа (Main Entry)');
  addFile('src/index.css', 'Стили и Tailwind (Styles)');
  addFile('src/types.ts', 'Типы данных (Types)');
  addFile('index.html', 'HTML Шаблон (Index HTML)');
  addFile('package.json', 'Конфигурация проекта (Package)');

  // Data & Tickets
  addFile('src/data/content.ts', 'Контент: Сборка и Реестр глав');
  addFile('src/data/tickets/ticket1_5.ts', 'Билеты 1-5: Структуры данных и префиксы');
  addFile('src/data/tickets/ticket6_13.ts', 'Билеты 6-13: Графы, DFS/BFS, Эйлер, Мосты, Точки сочленения');
  addFile('src/data/tickets/ticket14_20.ts', 'Билеты 14-20: Кратчайшие пути и Остовные деревья');
  addFile('src/data/tickets/ticket21_24.ts', 'Билеты 21-24: Строковые алгоритмы и Сложность');
  addFile('src/data/graphContent.ts', 'Дополнительный граф-контент');
  addFile('src/data/additionalTickets.ts', 'Консолидированные билеты');
  addFile('src/data/quizzes.ts', 'Экспресс-тесты и квизы');

  // Components
  const componentsDir = path.resolve(process.cwd(), 'src/components');
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    for (const f of files) {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        addFile(`src/components/${f}`, 'Интерактивные визуализаторы и компоненты');
      }
    }
  }

  // Nested visualizers
  const nestedVizDir = path.resolve(process.cwd(), 'src/components/visualizers');
  if (fs.existsSync(nestedVizDir)) {
    const files = fs.readdirSync(nestedVizDir);
    for (const f of files) {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        addFile(`src/components/visualizers/${f}`, 'Интерактивные визуализаторы (Дополнительные)');
      }
    }
  }

  // 3. Build Full TXT Representation
  let fullTxt = '';
  const hr = '='.repeat(80);
  const subhr = '-'.repeat(80);

  fullTxt += `${hr}\n`;
  fullTxt += `       УНИВЕРСАЛЬНОЕ ПОСОБИЕ ПО АЛГОРИТМАМ И СТРУКТУРАМ ДАННЫХ\n`;
  fullTxt += `         ПОЛНЫЙ ИСХОДНЫЙ КОД И ВСЕ СТРАНИЦЫ / ОБЪЕКТЫ / ЭЛЕМЕНТЫ\n`;
  fullTxt += `                 ЭКСПОРТ ДЛЯ ПОДГОТОВКИ К ЭКЗАМЕНАМ\n`;
  fullTxt += `${hr}\n\n`;
  fullTxt += `Дата генерации: ${new Date().toLocaleString('ru-RU')}\n`;
  fullTxt += `Всего глав в пособии: ${chapters.length}\n`;
  fullTxt += `Всего файлов исходного кода: ${sourceFiles.length}\n\n`;

  fullTxt += `${hr}\n`;
  fullTxt += `                          ОГЛАВЛЕНИЕ (ГЛАВЫ И ТЕМЫ)\n`;
  fullTxt += `${hr}\n`;
  chapters.forEach((c, idx) => {
    fullTxt += `  ${(idx + 1).toString().padStart(2, ' ')}. [ID: ${c.id}] ${c.title}\n`;
  });
  fullTxt += `\n`;

  fullTxt += `${hr}\n`;
  fullTxt += `                          РЕЕСТР ИСХОДНЫХ ФАЙЛОВ\n`;
  fullTxt += `${hr}\n`;
  sourceFiles.forEach((sf, idx) => {
    fullTxt += `  ${(idx + 1).toString().padStart(2, ' ')}. [${sf.category}] ${sf.relativePath}\n`;
  });
  fullTxt += `\n\n`;

  // SECTION 1: CHAPTERS HTML CODE AND TEXT
  fullTxt += `${hr}\n`;
  fullTxt += `РАЗДЕЛ I. ПОЛНОЕ СОДЕРЖИМОЕ ВСЕХ ГЛАВ И БИЛЕТОВ (HTML & СТРУКТУРЫ)\n`;
  fullTxt += `${hr}\n\n`;

  chapters.forEach((c, idx) => {
    fullTxt += `${subhr}\n`;
    fullTxt += `ГЛАВА ${idx + 1}: ${c.title.toUpperCase()}\n`;
    fullTxt += `ID: ${c.id} | ТИП: ${c.type} | КАТЕГОРИЯ: ${c.category || 'Общее'}\n`;
    fullTxt += `ОПИСАНИЕ: ${c.description || 'Не указано'}\n`;
    fullTxt += `${subhr}\n\n`;

    fullTxt += `--- [ИСХОДНЫЙ HTML КОД ГЛАВЫ (DANGEROUSLY SET INNER HTML)] ---\n`;
    fullTxt += `${c.content}\n\n`;
    fullTxt += `\n`;
  });

  // SECTION 2: ALL COMPONENT & SOURCE FILES CODE
  fullTxt += `${hr}\n`;
  fullTxt += `РАЗДЕЛ II. ИСХОДНЫЙ КОД ВСЕХ КОМПОНЕНТОВ, СИМУЛЯТОРОВ И МОДУЛЕЙ\n`;
  fullTxt += `${hr}\n\n`;

  sourceFiles.forEach((sf, idx) => {
    const fileContent = fs.readFileSync(sf.path, 'utf8');
    fullTxt += `${subhr}\n`;
    fullTxt += `ФАЙЛ ${idx + 1}/${sourceFiles.length}: ${sf.relativePath}\n`;
    fullTxt += `КАТЕГОРИЯ: ${sf.category}\n`;
    fullTxt += `РАЗМЕР: ${fileContent.length} байт | СТРОК: ${fileContent.split('\n').length}\n`;
    fullTxt += `${subhr}\n\n`;
    fullTxt += fileContent;
    fullTxt += `\n\n\n`;
  });

  // Write TXT files
  fs.writeFileSync(txtPath, fullTxt, 'utf8');
  fs.writeFileSync(path.join(publicExportDir, 'full_code_all_pages.txt'), fullTxt, 'utf8');
  fs.writeFileSync(path.resolve(process.cwd(), 'full_code_all_pages.txt'), fullTxt, 'utf8');
  console.log(`TXT Export saved to:\n  - ${txtPath}\n  - Size: ${(fullTxt.length / 1024).toFixed(1)} KB`);

  // 4. Build Professional PDF Document
  console.log('Generating PDF...');
  const fontRegular = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf';
  const fontBold = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';
  const fontItalic = '/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf';
  const fontMono = '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf';
  const fontMonoBold = '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf';

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    bufferPages: true,
    autoFirstPage: true
  });

  const pdfWriteStream = fs.createWriteStream(pdfPath);
  doc.pipe(pdfWriteStream);

  doc.registerFont('Sans', fontRegular);
  doc.registerFont('SansBold', fontBold);
  doc.registerFont('SansItalic', fontItalic);
  doc.registerFont('Mono', fontMono);
  doc.registerFont('MonoBold', fontMonoBold);

  const pageWidth = doc.page.width - 80;

  // Helper for Section Titles
  const printSectionHeader = (title: string, subtitle?: string) => {
    doc.addPage();
    doc.rect(40, doc.y, pageWidth, 38).fill('#1e293b');
    doc.fillColor('#38bdf8').font('SansBold').fontSize(15).text(title, 50, doc.y - 32, { width: pageWidth - 20 });
    doc.moveDown(1.5);
    if (subtitle) {
      doc.fillColor('#64748b').font('SansItalic').fontSize(10).text(subtitle, 45);
      doc.moveDown(0.5);
    }
  };

  // Helper for File Code Header
  const printFileHeader = (relPath: string, category: string, linesCount: number) => {
    if (doc.y > doc.page.height - 120) doc.addPage();
    doc.rect(40, doc.y, pageWidth, 24).fill('#0f172a');
    doc.fillColor('#a855f7').font('SansBold').fontSize(10).text(`ФАЙЛ: ${relPath}`, 48, doc.y - 18);
    doc.fillColor('#94a3b8').font('Sans').fontSize(8).text(`[${category} | ${linesCount} строк]`, pageWidth - 80, doc.y - 18, { align: 'right' });
    doc.moveDown(1);
  };

  // --- COVER PAGE ---
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#020617'); // Dark slate-950

  doc.moveDown(4);
  doc.fillColor('#38bdf8').font('SansBold').fontSize(26).text('УНИВЕРСАЛЬНОЕ ПОСОБИЕ', { align: 'center' });
  doc.moveDown(0.3);
  doc.fillColor('#818cf8').font('SansBold').fontSize(20).text('АЛГОРИТМЫ И СТРУКТУРЫ ДАННЫХ', { align: 'center' });
  doc.moveDown(0.8);
  doc.fillColor('#94a3b8').font('Sans').fontSize(12).text('Полный сборник исходного кода, HTML-билетов, визуализаторов и тестов', { align: 'center' });

  doc.moveDown(3);
  // Info Box
  const infoBoxY = doc.y;
  doc.rect(60, infoBoxY, doc.page.width - 120, 150).fillAndStroke('#0f172a', '#334155');
  doc.fillColor('#f8fafc').font('SansBold').fontSize(13).text('ПАРАМЕТРЫ ЭКСПОРТА:', 80, infoBoxY + 16);
  doc.font('Sans').fontSize(10).fillColor('#cbd5e1');
  doc.text(`• Всего обучающих билетов/глав: ${chapters.length}`, 80, infoBoxY + 40);
  doc.text(`• Всего модулей и файлов исходного кода: ${sourceFiles.length}`, 80, infoBoxY + 58);
  doc.text(`• Интерактивные симуляторы: Дейкстра, Краскал, Бор, Ахо-Корасик, Splay, Дерево отрезков, Эйлер и др.`, 80, infoBoxY + 76, { width: doc.page.width - 160 });
  doc.text(`• Дата генерации: ${new Date().toLocaleString('ru-RU')}`, 80, infoBoxY + 110);

  doc.moveDown(8);
  doc.fillColor('#64748b').font('SansItalic').fontSize(10).text('Remix Remix: ExamPrep Reader • Экспорт полной базы приложения', { align: 'center' });

  // --- TABLE OF CONTENTS ---
  doc.addPage();
  doc.fillColor('#0f172a'); // reset fill
  doc.fillColor('#0284c7').font('SansBold').fontSize(18).text('ОГЛАВЛЕНИЕ И СТРУКТУРА');
  doc.moveDown(0.5);
  doc.fillColor('#64748b').font('Sans').fontSize(10).text('Все темы, алгоритмы и исходные файлы, включенные в данный документ:');
  doc.moveDown(1);

  doc.fillColor('#1e293b').font('SansBold').fontSize(12).text('Раздел I. Учебные билеты и интерактивные главы:');
  doc.moveDown(0.4);

  chapters.forEach((c, idx) => {
    if (doc.y > doc.page.height - 50) doc.addPage();
    doc.fillColor('#0369a1').font('SansBold').fontSize(9).text(`${(idx + 1).toString().padStart(2, '0')}.`, 45, doc.y, { continued: true });
    doc.fillColor('#334155').font('Sans').fontSize(9).text(`  ${c.title}  `, { continued: true });
    doc.fillColor('#94a3b8').font('Mono').fontSize(7.5).text(`[ID: ${c.id}]`);
    doc.moveDown(0.2);
  });

  doc.moveDown(1);
  doc.fillColor('#1e293b').font('SansBold').fontSize(12).text('Раздел II. Компоненты и модули приложения:');
  doc.moveDown(0.4);

  sourceFiles.forEach((sf, idx) => {
    if (doc.y > doc.page.height - 50) doc.addPage();
    doc.fillColor('#7c3aed').font('SansBold').fontSize(8.5).text(`${(idx + 1).toString().padStart(2, '0')}.`, 45, doc.y, { continued: true });
    doc.fillColor('#334155').font('Sans').fontSize(8.5).text(`  ${sf.relativePath}  `, { continued: true });
    doc.fillColor('#64748b').font('SansItalic').fontSize(7.5).text(`(${sf.category})`);
    doc.moveDown(0.15);
  });

  // --- SECTION I: CHAPTERS ---
  chapters.forEach((c, idx) => {
    printSectionHeader(`ГЛАВА ${idx + 1}: ${c.title}`, `ID: ${c.id} | Категория: ${c.category || 'Базовый курс'} | Тип: ${c.type}`);

    if (c.description) {
      doc.fillColor('#1e293b').font('SansBold').fontSize(10).text('Краткое содержание: ', 45, doc.y, { continued: true });
      doc.fillColor('#475569').font('Sans').fontSize(10).text(c.description);
      doc.moveDown(0.8);
    }

    doc.fillColor('#0284c7').font('SansBold').fontSize(10).text('HTML-КОД И ВЕРСТКА СТРАНИЦЫ:');
    doc.moveDown(0.3);

    // Code container
    const lines = c.content.split('\n');
    doc.font('Mono').fontSize(7.5);

    for (let i = 0; i < lines.length; i++) {
      if (doc.y > doc.page.height - 50) {
        doc.addPage();
        doc.fillColor('#64748b').font('SansItalic').fontSize(7).text(`[Глава ${idx + 1}: ${c.title} — продолжение]`, 45, doc.y);
        doc.moveDown(0.4);
        doc.font('Mono').fontSize(7.5);
      }
      const line = lines[i];
      const lineNum = (i + 1).toString().padStart(4, ' ') + ' | ';
      doc.fillColor('#94a3b8').text(lineNum, 45, doc.y, { continued: true });
      doc.fillColor('#1e293b').text(line || ' ');
    }
    doc.moveDown(1.5);
  });

  // --- SECTION II: CODEBASE ---
  sourceFiles.forEach((sf) => {
    const fileContent = fs.readFileSync(sf.path, 'utf8');
    const lines = fileContent.split('\n');

    printFileHeader(sf.relativePath, sf.category, lines.length);

    doc.font('Mono').fontSize(7);
    for (let i = 0; i < lines.length; i++) {
      if (doc.y > doc.page.height - 45) {
        doc.addPage();
        doc.fillColor('#94a3b8').font('SansItalic').fontSize(7).text(`[Файл: ${sf.relativePath} — продолжение]`, 45, doc.y);
        doc.moveDown(0.3);
        doc.font('Mono').fontSize(7);
      }
      const line = lines[i];
      const lineNum = (i + 1).toString().padStart(4, ' ') + ' | ';
      doc.fillColor('#94a3b8').text(lineNum, 45, doc.y, { continued: true });
      doc.fillColor('#0f172a').text(line || ' ');
    }
    doc.moveDown(1.2);
  });

  // --- FOOTERS WITH PAGE NUMBERS ---
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#94a3b8').font('Sans').fontSize(8).text(
      `Универсальное пособие • Страница ${i + 1} из ${range.count}`,
      40,
      doc.page.height - 30,
      { align: 'center', width: pageWidth }
    );
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    pdfWriteStream.on('finish', () => {
      console.log('PDF generation finished.');
      // Copy to root and public folders
      fs.copyFileSync(pdfPath, path.resolve(process.cwd(), 'full_code_all_pages.pdf'));
      fs.copyFileSync(pdfPath, path.join(publicExportDir, 'full_code_all_pages.pdf'));
      resolve();
    });
    pdfWriteStream.on('error', reject);
  });

  const stats = fs.statSync(pdfPath);
  console.log(`PDF Export successfully created:\n  - Path: ${pdfPath}\n  - Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log('--- Export Finished Successfully ---');
}

main().catch(err => {
  console.error('Export Error:', err);
  process.exit(1);
});
