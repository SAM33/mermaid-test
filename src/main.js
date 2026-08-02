import mermaid from 'mermaid';
import { jsPDF } from 'jspdf';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import resvgWasmUrl from '@resvg/resvg-wasm/index_bg.wasm?url';
import notoSansTcUrl from '../assets/NotoSansTC-Variable.ttf?url';
import './style.css';

const source = document.querySelector('#source');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const downloadButton = document.querySelector('#download');
const downloadPdfButton = document.querySelector('#download-pdf');
const downloadSvgButton = document.querySelector('#download-svg');
const pasteButton = document.querySelector('#paste');
const renderButton = document.querySelector('#render');
let renderedSvg = '';
let renderTimer;
let wasmInitialization;
let exportFontBuffers;

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  // HTML labels create SVG foreignObject nodes, which browsers cannot safely
  // export to a canvas. Native SVG text keeps PNG/PDF downloads portable.
  htmlLabels: false,
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
});

function extractMermaid(markdown) {
  const match = markdown.match(/```mermaid\s*\r?\n([\s\S]*?)```/i);
  return (match ? match[1] : markdown).trim();
}

async function render() {
  const diagram = extractMermaid(source.value);
  downloadButton.disabled = true;
  downloadPdfButton.disabled = true;
  downloadSvgButton.disabled = true;
  renderedSvg = '';
  preview.replaceChildren();

  if (!diagram) {
    status.textContent = '請輸入 Mermaid 語法。';
    status.className = 'status error';
    return;
  }

  try {
    const id = `mermaid-${Date.now()}`;
    const { svg, bindFunctions } = await mermaid.render(id, diagram);
    renderedSvg = svg;
    preview.innerHTML = svg;
    bindFunctions?.(preview);
    status.textContent = '圖表已更新。';
    status.className = 'status success';
    downloadButton.disabled = false;
    downloadPdfButton.disabled = false;
    downloadSvgButton.disabled = false;
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : '未知錯誤';
    status.textContent = `無法產生圖表：${message}`;
    status.className = 'status error';
  }
}

async function renderPng() {
  if (!renderedSvg) throw new Error('尚未產生圖表');
  wasmInitialization ??= initWasm(fetch(resvgWasmUrl));
  exportFontBuffers ??= fetch(notoSansTcUrl)
    .then((response) => {
      if (!response.ok) throw new Error('中文字型載入失敗');
      return response.arrayBuffer();
    })
    .then((buffer) => [new Uint8Array(buffer)]);
  const [, fontBuffers] = await Promise.all([wasmInitialization, exportFontBuffers]);
  const renderer = new Resvg(renderedSvg, {
    background: '#ffffff',
    fitTo: { mode: 'zoom', value: 2 },
    font: { fontBuffers, defaultFontFamily: 'Noto Sans TC' }
  });
  const image = renderer.render();
  const result = { bytes: image.asPng(), width: image.width, height: image.height };
  image.free();
  renderer.free();
  return result;
}

async function downloadPng() {
  try {
    const { bytes } = await renderPng();
    const link = document.createElement('a');
    link.download = 'mermaid-diagram.png';
    link.href = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } catch (error) {
    status.textContent = `PNG 轉換失敗：${error.message}`;
    status.className = 'status error';
  }
}

async function downloadPdf() {
  try {
    const { bytes, width: imageWidth, height: imageHeight } = await renderPng();
    const landscape = imageWidth > imageHeight;
    const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const ratio = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
    const width = imageWidth * ratio;
    const height = imageHeight * ratio;
    pdf.addImage(bytes, 'PNG', (pdf.internal.pageSize.getWidth() - width) / 2, (pdf.internal.pageSize.getHeight() - height) / 2, width, height);
    pdf.save('mermaid-diagram.pdf');
  } catch (error) {
    status.textContent = `PDF 轉換失敗：${error.message}`;
    status.className = 'status error';
  }
}

function downloadSvg() {
  if (!renderedSvg) return;
  const link = document.createElement('a');
  link.download = 'mermaid-diagram.svg';
  link.href = URL.createObjectURL(new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' }));
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function pasteFromClipboard() {
  try {
    source.value = await navigator.clipboard.readText();
    await render();
    source.focus();
  } catch {
    status.textContent = '無法讀取剪貼簿，請長按輸入框後選擇「貼上」。';
    status.className = 'status error';
    source.focus();
  }
}

source.addEventListener('input', () => {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 250);
});
downloadButton.addEventListener('click', downloadPng);
downloadPdfButton.addEventListener('click', downloadPdf);
downloadSvgButton.addEventListener('click', downloadSvg);
pasteButton.addEventListener('click', pasteFromClipboard);
renderButton.addEventListener('click', render);
render();
