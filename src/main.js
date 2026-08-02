import mermaid from 'mermaid';
import { jsPDF } from 'jspdf';
import './style.css';

const source = document.querySelector('#source');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const downloadButton = document.querySelector('#download');
const downloadPdfButton = document.querySelector('#download-pdf');
const pasteButton = document.querySelector('#paste');
const renderButton = document.querySelector('#render');
let renderedSvg = '';
let renderTimer;

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
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : '未知錯誤';
    status.textContent = `無法產生圖表：${message}`;
    status.className = 'status error';
  }
}

function svgToCanvas() {
  if (!renderedSvg) return Promise.reject(new Error('尚未產生圖表'));
  const svgElement = preview.querySelector('svg');
  const width = Math.ceil(svgElement?.viewBox.baseVal.width || svgElement?.getBoundingClientRect().width || 1200);
  const height = Math.ceil(svgElement?.viewBox.baseVal.height || svgElement?.getBoundingClientRect().height || 800);
  const scale = 2;
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext('2d');
    context.scale(scale, scale);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片轉換失敗'));
    };
    image.src = url;
  });
}

async function downloadPng() {
  try {
    const canvas = await svgToCanvas();
    const link = document.createElement('a');
    link.download = 'mermaid-diagram.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    status.textContent = `PNG 轉換失敗：${error.message}`;
    status.className = 'status error';
  }
}

async function downloadPdf() {
  try {
    const canvas = await svgToCanvas();
    const landscape = canvas.width > canvas.height;
    const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (pdf.internal.pageSize.getWidth() - width) / 2, (pdf.internal.pageSize.getHeight() - height) / 2, width, height);
    pdf.save('mermaid-diagram.pdf');
  } catch (error) {
    status.textContent = `PDF 轉換失敗：${error.message}`;
    status.className = 'status error';
  }
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
pasteButton.addEventListener('click', pasteFromClipboard);
renderButton.addEventListener('click', render);
render();
