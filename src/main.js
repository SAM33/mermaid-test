import mermaid from 'mermaid';
import './style.css';

const source = document.querySelector('#source');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const downloadButton = document.querySelector('#download');
let renderedSvg = '';
let renderTimer;

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
});

function extractMermaid(markdown) {
  const match = markdown.match(/```mermaid\s*\r?\n([\s\S]*?)```/i);
  return (match ? match[1] : markdown).trim();
}

async function render() {
  const diagram = extractMermaid(source.value);
  downloadButton.disabled = true;
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
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : '未知錯誤';
    status.textContent = `無法產生圖表：${message}`;
    status.className = 'status error';
  }
}

async function downloadPng() {
  if (!renderedSvg) return;
  const svgElement = preview.querySelector('svg');
  const width = Math.ceil(svgElement?.viewBox.baseVal.width || svgElement?.getBoundingClientRect().width || 1200);
  const height = Math.ceil(svgElement?.viewBox.baseVal.height || svgElement?.getBoundingClientRect().height || 800);
  const scale = 2;
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
    const link = document.createElement('a');
    link.download = 'mermaid-diagram.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    status.textContent = 'PNG 轉換失敗，請再試一次。';
    status.className = 'status error';
  };
  image.src = url;
}

source.addEventListener('input', () => {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 250);
});
downloadButton.addEventListener('click', downloadPng);
render();
