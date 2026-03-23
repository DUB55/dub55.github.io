import { APP_CONFIG } from './config.js';
import {
  createEncryptedSharePayload,
  createQuickLink,
  unpackEncryptedShare,
  unpackQuickLink,
} from './share-crypto.js';

function refreshIcons() {
  try {
    window.lucide?.createIcons();
  } catch (error) {
    console.error(error);
  }
}

function escapeHTML(value) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/'/g, '&#39;');
}

function formatTime(value) {
  return new Date(value).toLocaleString();
}

let projects = JSON.parse(localStorage.getItem('dub5-projects') || '[]');
let currentProjectId = null;
let sessionId = '';
let chatHist = [];
let notes = [];
let files = [];
let snapshots = [];
let activeFile = 'index.html';
let streaming = false;
let ctrl = null;
let currentRunTouchedFiles = [];

function withDefaults(project) {
  return {
    id: project.id,
    name: project.name || 'Untitled project',
    sessionId: project.sessionId || `dub5-${Math.random().toString(36).slice(2, 10)}`,
    html: project.html || '',
    files: Array.isArray(project.files) && project.files.length ? project.files : [{ name: 'index.html', content: project.html || '' }],
    chat: Array.isArray(project.chat) ? project.chat : [],
    notes: Array.isArray(project.notes) ? project.notes : [],
    snapshots: Array.isArray(project.snapshots) ? project.snapshots : [],
    updatedAt: project.updatedAt || Date.now(),
    lastOpened: project.lastOpened || Date.now(),
  };
}

projects = projects.map(withDefaults);

function persistProjects() {
  localStorage.setItem('dub5-projects', JSON.stringify(projects));
}

function updateRunState(label) {
  document.getElementById('run-state').textContent = label;
}

function updateChangeSummary(text) {
  document.getElementById('change-summary').textContent = text;
}

function getIndexHTML() {
  return files.find((file) => file.name === 'index.html')?.content || '';
}

function getFileContent(name) {
  return files.find((file) => file.name === name)?.content || '';
}

function showPreviewEmpty() {
  document.getElementById('prev-empty').style.display = 'flex';
  document.getElementById('pframe').style.display = 'none';
}

function hidePreviewEmpty() {
  document.getElementById('prev-empty').style.display = 'none';
  document.getElementById('pframe').style.display = 'block';
}

function renderPrev(html) {
  if (!html) {
    showPreviewEmpty();
    return;
  }
  hidePreviewEmpty();
  document.getElementById('pframe').srcdoc = html;
}

function renderNotes() {
  const box = document.getElementById('hist-list');
  if (!notes.length) {
    box.textContent = 'No notes yet.';
    return;
  }
  box.innerHTML = notes
    .map(
      (note) => `
      <div style="border-bottom:1px dashed #1f1f1f;padding:8px 0">
        <div style="font-family:var(--mono);font-size:12px;color:#9ca3af">${escapeHTML(note.at)}</div>
        <div style="white-space:pre-wrap;color:#fff;font-size:12.5px;margin-top:4px">${escapeHTML(note.text)}</div>
      </div>`
    )
    .join('');
}

function renderSnapshots() {
  const box = document.getElementById('snapshot-list');
  if (!snapshots.length) {
    box.textContent = 'No snapshots yet.';
    return;
  }
  box.innerHTML = snapshots
    .map(
      (snapshot, index) => `
      <div class="snapshot-item">
        <div class="snapshot-meta">
          <div class="snapshot-title">${escapeHTML(snapshot.label || `Snapshot ${snapshots.length - index}`)}</div>
          <div class="snapshot-sub">${escapeHTML(formatTime(snapshot.at))}</div>
        </div>
        <button class="btn" onclick="restoreSnapshot(${index})">Restore</button>
      </div>`
    )
    .join('');
}

function renderRecentProjects() {
  const strip = document.getElementById('recent-strip');
  const recent = [...projects].sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0)).slice(0, 4);
  strip.innerHTML = recent
    .map((project) => `<button class="recent-pill" onclick="openProject('${project.id}')">${escapeHTML(project.name)}</button>`)
    .join('');
}

function saveCurrentProject() {
  if (!currentProjectId) return;
  const idx = projects.findIndex((project) => project.id === currentProjectId);
  const project = withDefaults({
    id: currentProjectId,
    name: (document.getElementById('proj-name')?.value || 'Untitled project').trim() || 'Untitled project',
    sessionId,
    html: getIndexHTML(),
    files,
    chat: chatHist,
    notes,
    snapshots,
    updatedAt: Date.now(),
    lastOpened: Date.now(),
  });
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  persistProjects();
  renderProjects();
  renderRecentProjects();
}

function renderProjects() {
  const grid = document.getElementById('proj-grid');
  const empty = document.getElementById('proj-empty');
  if (!projects.length) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';
  const ordered = [...projects].sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0));
  grid.innerHTML = ordered
    .map((project) => {
      const thumb = project.html
        ? `<iframe sandbox="allow-scripts" srcdoc="${escapeAttr(project.html)}"></iframe>`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--t3);font-size:12px;gap:8px"><svg data-lucide="file" width="16" height="16"></svg>No preview</div>`;
      return `
        <div class="proj-card" onclick="openProject('${project.id}')">
          <div class="proj-thumb">${thumb}</div>
          <div class="proj-meta">
            <div class="proj-name" title="${escapeHTML(project.name)}">${escapeHTML(project.name)}</div>
            <div class="proj-sub">Last opened: ${escapeHTML(formatTime(project.lastOpened || project.updatedAt || Date.now()))}</div>
            <div class="proj-stats">
              <span>Updated ${escapeHTML(formatTime(project.updatedAt || Date.now()))}</span>
              <span>${project.files.length} files</span>
            </div>
            <div class="proj-actions" onclick="event.stopPropagation()">
              <button class="proj-act" onclick="openProject('${project.id}')"><svg data-lucide="play" width="14" height="14"></svg>Open</button>
              <button class="proj-act" onclick="duplicateProjectById('${project.id}')"><svg data-lucide="copy" width="14" height="14"></svg>Duplicate</button>
              <button class="proj-act" onclick="exportProjectById('${project.id}')"><svg data-lucide="download" width="14" height="14"></svg>Export</button>
              <button class="proj-act danger" onclick="deleteProject('${project.id}')"><svg data-lucide="trash-2" width="14" height="14"></svg>Delete</button>
            </div>
          </div>
        </div>`;
    })
    .join('');
  refreshIcons();
}

function loadProjectIntoEditor(project) {
  currentProjectId = project.id;
  sessionId = project.sessionId;
  chatHist = [...project.chat];
  notes = [...project.notes];
  files = project.files.map((file) => ({ ...file }));
  snapshots = [...project.snapshots];
  activeFile = files.find((file) => file.name === 'index.html') ? 'index.html' : files[0]?.name || 'index.html';
  document.getElementById('proj-name').value = project.name;
  document.getElementById('code-editor').value = getFileContent(activeFile);
  document.getElementById('editor-info').textContent = activeFile;
  renderChatFromHistory(chatHist);
  renderFileTree();
  renderNotes();
  renderSnapshots();
  renderPrev(getIndexHTML());
  updateRunState('Ready');
  updateChangeSummary('No generation changes yet.');
}

function showScreen(name) {
  ['landing', 'projects', 'app'].forEach((screenName) => {
    const element = document.getElementById(`s-${screenName}`);
    if (!element) return;
    if (screenName === name) {
      element.style.display = 'flex';
      requestAnimationFrame(() => element.classList.add('visible'));
    } else {
      element.classList.remove('visible');
      element.style.display = 'none';
    }
  });
  if (name === 'landing') renderRecentProjects();
  refreshIcons();
}

function startApp(blank = false) {
  const prompt = (document.getElementById('land-ta').value || '').trim();
  sessionId = `dub5-${Math.random().toString(36).slice(2, 10)}`;
  currentProjectId = `proj-${Date.now()}`;
  chatHist = [];
  notes = [];
  snapshots = [];
  files = [{ name: 'index.html', content: '' }];
  activeFile = 'index.html';
  document.getElementById('proj-name').value = 'Untitled project';
  document.getElementById('msgs').innerHTML = '';
  document.getElementById('code-editor').value = '';
  document.getElementById('editor-info').textContent = activeFile;
  renderFileTree();
  renderNotes();
  renderSnapshots();
  showPreviewEmpty();
  saveCurrentProject();
  showScreen('app');
  switchTab('preview');
  if (!blank && prompt) {
    setTimeout(() => {
      document.getElementById('pinput').value = prompt;
      send();
    }, 250);
  }
}

function newProject() {
  startApp(true);
}

function showProjects() {
  saveCurrentProject();
  renderProjects();
  showScreen('projects');
}

function openProject(id) {
  const project = projects.find((entry) => entry.id === id);
  if (!project) return;
  project.lastOpened = Date.now();
  persistProjects();
  loadProjectIntoEditor(project);
  showScreen('app');
  switchTab('preview');
}

function setP(element) {
  const textarea = document.getElementById('land-ta');
  textarea.value = `Build a ${String(element.textContent || '').trim().toLowerCase()}`;
  textarea.focus();
}

function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function exportProjectData(project) {
  const fileName = `${project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_.]/g, '') || 'dub5-project'}.json`;
  downloadBlob(fileName, new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }));
}

function exportProjectById(id) {
  const project = projects.find((entry) => entry.id === id);
  if (!project) return;
  exportProjectData(project);
  toast('Project exported');
}

function exportCurrentProject() {
  const project = projects.find((entry) => entry.id === currentProjectId);
  if (!project) return;
  exportProjectData(project);
  toast('Project exported');
}

function duplicateProjectData(project) {
  return withDefaults({
    ...structuredClone(project),
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${project.name} Copy`,
    updatedAt: Date.now(),
    lastOpened: Date.now(),
  });
}

function duplicateProjectById(id) {
  const project = projects.find((entry) => entry.id === id);
  if (!project) return;
  projects.unshift(duplicateProjectData(project));
  persistProjects();
  renderProjects();
  renderRecentProjects();
  toast('Project duplicated');
}

function duplicateCurrentProject() {
  const project = projects.find((entry) => entry.id === currentProjectId);
  if (!project) return;
  duplicateProjectById(project.id);
}

async function deleteProject(id) {
  if (!(await confirmBox('Delete this project? This cannot be undone.'))) return;
  projects = projects.filter((entry) => entry.id !== id);
  if (currentProjectId === id) currentProjectId = null;
  persistProjects();
  renderProjects();
  renderRecentProjects();
  toast('Deleted');
}

function triggerImport() {
  document.getElementById('import-project-input').click();
}

function addUserMsg(text) {
  const wrap = document.getElementById('msgs');
  const msg = document.createElement('div');
  msg.className = 'msg user';
  msg.innerHTML = '<div class="bubble"></div>';
  msg.querySelector('.bubble').textContent = text;
  wrap.appendChild(msg);
  wrap.scrollTop = wrap.scrollHeight;
}

function ensureAiMsg() {
  const wrap = document.getElementById('msgs');
  const msg = document.createElement('div');
  msg.className = 'msg ai';
  msg.innerHTML = '<div class="ai-line md"></div>';
  wrap.appendChild(msg);
  wrap.scrollTop = wrap.scrollHeight;
  return msg.querySelector('.ai-line');
}

function addTyping() {
  const wrap = document.getElementById('msgs');
  const node = document.createElement('div');
  node.id = '_typing';
  node.className = 'typing';
  node.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  wrap.appendChild(node);
  wrap.scrollTop = wrap.scrollHeight;
}

function rmTyping() {
  document.getElementById('_typing')?.remove();
}

function addFileStatus(filename) {
  const wrap = document.getElementById('msgs');
  const el = document.createElement('div');
  el.className = 'file-status';
  el.dataset.file = filename;
  el.innerHTML = `
    <div class="file-status-left">
      <svg data-lucide="file-code" width="14" height="14"></svg>
      <div class="file-status-name" title="${escapeHTML(filename)}">${escapeHTML(filename)}</div>
    </div>
    <div class="file-status-state"><div class="spinner"></div><span>Writing...</span></div>`;
  el.addEventListener('click', () => {
    switchTab('code');
    openFile(filename);
  });
  wrap.appendChild(el);
  wrap.scrollTop = wrap.scrollHeight;
  refreshIcons();
  return el;
}

function setFileStatusDone(el) {
  if (!el) return;
  el.querySelector('.file-status-state').innerHTML =
    '<span class="check"><svg data-lucide="check" width="14" height="14"></svg></span><span>Saved</span>';
  refreshIcons();
}

function renderMarkdown(md) {
  if (!md) return '';
  const blocks = [];
  let source = md.replace(/\r\n/g, '\n').replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const index = blocks.length;
    blocks.push({ lang: lang || '', code });
    return `\u0000CODE_${index}\u0000`;
  });
  source = escapeHTML(source).replace(/\u0000CODE_(\d+)\u0000/g, (_, index) => {
    const block = blocks[Number(index)];
    return `<pre><code class="lang-${escapeHTML(block.lang)}">${escapeHTML(block.code)}</code></pre>`;
  });
  const lines = source.split('\n');
  const out = [];
  let inUL = false;
  let inOL = false;
  const closeLists = () => {
    if (inUL) {
      out.push('</ul>');
      inUL = false;
    }
    if (inOL) {
      out.push('</ol>');
      inOL = false;
    }
  };
  lines.forEach((line) => {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeLists();
      out.push(`<h${heading[1].length}>${heading[2]}</h${heading[1].length}>`);
      return;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      if (inOL) {
        out.push('</ol>');
        inOL = false;
      }
      if (!inUL) {
        out.push('<ul>');
        inUL = true;
      }
      out.push(`<li>${line.replace(/^\s*[-*+]\s+/, '')}</li>`);
      return;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (inUL) {
        out.push('</ul>');
        inUL = false;
      }
      if (!inOL) {
        out.push('<ol>');
        inOL = true;
      }
      out.push(`<li>${line.replace(/^\s*\d+\.\s+/, '')}</li>`);
      return;
    }
    closeLists();
    if (!line.trim()) return;
    if (line.startsWith('&gt;')) {
      out.push(`<blockquote>${line.replace(/^&gt;\s?/, '')}</blockquote>`);
      return;
    }
    out.push(`<p>${line}</p>`);
  });
  closeLists();
  return out
    .join('\n')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => `<a href="${url}" target="_blank" rel="noreferrer noopener">${text}</a>`)
    .replace(/\*\*([^\*\n]+)\*\*/g, '<strong>$1</strong>');
}

function renderChatFromHistory(history) {
  const msgs = document.getElementById('msgs');
  msgs.innerHTML = '';
  history.forEach((entry) => {
    if (entry.role === 'user') addUserMsg(entry.content);
    if (entry.role === 'assistant') {
      const el = ensureAiMsg();
      el.innerHTML = renderMarkdown(entry.content);
    }
  });
}

function setSendBtn(state) {
  const btn = document.getElementById('send-btn');
  btn.innerHTML = '';
  if (state === 'stop') {
    btn.title = 'Stop';
    btn.insertAdjacentHTML('afterbegin', '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>');
    return;
  }
  btn.title = 'Send';
  btn.insertAdjacentHTML('afterbegin', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5,12 12,5 19,12"></polyline></svg>');
}

function beginRe() {
  return /(?:^|\n)\s*(?:---\s*)?BEGIN\s+FILE\s*:\s*([^\n-]+?)\s*(?:---)?\s*(?:\n|$)/i;
}

function endRe() {
  return /(?:^|\n)\s*(?:---\s*)?END\s+FILE\s*:\s*([^\n-]+?)\s*(?:---)?\s*(?:\n|$)/i;
}

function writeFile(name, content, source = 'manual') {
  const safeName = (name || 'index.html').trim() || 'index.html';
  let file = files.find((entry) => entry.name === safeName);
  if (!file) {
    file = { name: safeName, content: '' };
    files.push(file);
    renderFileTree();
  }
  file.content = content ?? '';
  if (activeFile === safeName) {
    const editor = document.getElementById('code-editor');
    if (editor.value !== file.content) editor.value = file.content;
    maybeRenderMd();
  }
  if (safeName === 'index.html') renderPrev(file.content);
  if (source === 'ai' && !currentRunTouchedFiles.includes(safeName)) currentRunTouchedFiles.push(safeName);
  saveCurrentProject();
  toast(`Saved ${safeName}`);
}

function renderFileTree() {
  const tree = document.getElementById('file-tree');
  tree.innerHTML = files
    .map((file) => {
      const isIndex = file.name === 'index.html';
      return `
      <div class="file-row ${file.name === activeFile ? 'active' : ''}" onclick="openFile('${escapeAttr(file.name)}')">
        <div class="file-left">
          <svg data-lucide="${file.name.endsWith('.html') ? 'file-code' : file.name.endsWith('.md') ? 'file-text' : 'file'}"></svg>
          <div class="file-name" title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</div>
        </div>
        <div style="display:flex;gap:4px" onclick="event.stopPropagation()">
          ${isIndex ? '' : `<button class="file-mini" title="Rename" onclick="uiRenameFile('${escapeAttr(file.name)}')"><svg data-lucide="edit-3"></svg></button>
          <button class="file-mini" title="Delete" onclick="uiDeleteFile('${escapeAttr(file.name)}')"><svg data-lucide="trash-2"></svg></button>`}
        </div>
      </div>`;
    })
    .join('');
  refreshIcons();
}

function openFile(name) {
  if (!files.some((file) => file.name === name)) return;
  activeFile = name;
  document.getElementById('editor-info').textContent = name;
  document.getElementById('code-editor').value = getFileContent(name);
  renderFileTree();
  maybeRenderMd();
}

function maybeRenderMd() {
  const isMarkdown = activeFile.toLowerCase().endsWith('.md');
  const preview = document.getElementById('md-preview');
  const editor = document.getElementById('code-editor');
  const toggle = document.getElementById('md-toggle');
  toggle.style.display = isMarkdown ? 'inline-flex' : 'none';
  if (!isMarkdown) {
    preview.style.display = 'none';
    editor.style.display = 'block';
    return;
  }
  if (preview.style.display === 'block') preview.innerHTML = renderMarkdown(getFileContent(activeFile));
}

function toggleMdPreview() {
  const preview = document.getElementById('md-preview');
  const editor = document.getElementById('code-editor');
  if (preview.style.display === 'block') {
    preview.style.display = 'none';
    editor.style.display = 'block';
    return;
  }
  preview.innerHTML = renderMarkdown(getFileContent(activeFile));
  preview.style.display = 'block';
  editor.style.display = 'none';
}

function refreshPrev() {
  renderPrev(getIndexHTML());
}

function openTab() {
  const html = getIndexHTML();
  if (!html) return toast('Nothing to preview');
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function dlHTML() {
  const html = getIndexHTML();
  if (!html) return toast('Nothing to download');
  const name = (document.getElementById('proj-name').value || 'dub5-page').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_.]/g, '');
  downloadBlob(`${name}.html`, new Blob([html], { type: 'text/html' }));
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((node) => node.classList.toggle('active', node.dataset.tab === tab));
  document.getElementById('pane-preview').style.display = tab === 'preview' ? 'flex' : 'none';
  document.getElementById('pane-code').classList.toggle('on', tab === 'code');
  ['history', 'deploy'].forEach((panel) => document.getElementById(`pane-${panel}`).classList.toggle('on', tab === panel));
  refreshIcons();
}

function dialog(title, msg, { input = false, okText = 'OK', cancelText = 'Cancel', value = '' } = {}) {
  return new Promise((resolve) => {
    const bg = document.getElementById('dialog-bg');
    const titleNode = document.getElementById('dialog-title');
    const msgNode = document.getElementById('dialog-msg');
    const extra = document.getElementById('dialog-extra');
    const ok = document.getElementById('dialog-ok');
    const cancel = document.getElementById('dialog-cancel');
    titleNode.textContent = title;
    msgNode.textContent = msg;
    extra.innerHTML = '';
    let inputNode = null;
    if (input) {
      inputNode = document.createElement('input');
      inputNode.type = 'text';
      inputNode.value = value;
      extra.appendChild(inputNode);
      setTimeout(() => inputNode.focus(), 10);
    }
    ok.textContent = okText;
    cancel.textContent = cancelText;
    const close = () => {
      bg.classList.remove('on');
      ok.onclick = null;
      cancel.onclick = null;
    };
    ok.onclick = () => {
      close();
      resolve(input ? inputNode.value : true);
    };
    cancel.onclick = () => {
      close();
      resolve(null);
    };
    bg.classList.add('on');
  });
}

function infoBox(title, msg) {
  return dialog(title, msg, { okText: 'OK', cancelText: 'Close' });
}

function confirmBox(msg) {
  return dialog('Confirm', msg, { okText: 'Yes', cancelText: 'No' }).then((value) => value !== null);
}

function promptBox(msg, value = '') {
  return dialog('Input', msg, { input: true, okText: 'Save', cancelText: 'Cancel', value });
}

async function uiNewFile() {
  const name = await promptBox('New file name (for example, about.html)');
  if (name === null) return;
  const clean = name.trim();
  if (!clean) return toast('Name required');
  if (files.some((file) => file.name === clean)) return toast('File exists');
  files.push({ name: clean, content: '' });
  activeFile = clean;
  renderFileTree();
  openFile(clean);
  saveCurrentProject();
}

async function uiRenameFile(oldName) {
  const next = await promptBox('Rename file', oldName);
  if (next === null) return;
  const name = next.trim();
  if (!name || name === oldName) return;
  if (name === 'index.html') return toast('Cannot rename to index.html');
  if (files.some((file) => file.name === name)) return toast('File exists');
  const file = files.find((entry) => entry.name === oldName);
  if (!file) return;
  file.name = name;
  if (activeFile === oldName) activeFile = name;
  renderFileTree();
  openFile(activeFile);
  saveCurrentProject();
}

async function uiDeleteFile(name) {
  if (name === 'index.html') return toast('Cannot delete index.html');
  if (!(await confirmBox(`Delete ${name}?`))) return;
  files = files.filter((file) => file.name !== name);
  if (activeFile === name) activeFile = 'index.html';
  renderFileTree();
  openFile(activeFile);
  saveCurrentProject();
}

function createSnapshot(label) {
  const html = getIndexHTML();
  if (!html) return toast('Nothing to snapshot yet');
  snapshots.unshift({
    at: Date.now(),
    label: label || `Preview snapshot ${new Date().toLocaleTimeString()}`,
    html,
    files: files.map((file) => ({ ...file })),
  });
  snapshots = snapshots.slice(0, 10);
  renderSnapshots();
  saveCurrentProject();
  toast('Snapshot saved');
}

function restoreSnapshot(index) {
  const snapshot = snapshots[index];
  if (!snapshot) return;
  files = snapshot.files.map((file) => ({ ...file }));
  activeFile = files.find((file) => file.name === activeFile)?.name || 'index.html';
  renderFileTree();
  openFile(activeFile);
  renderPrev(getIndexHTML());
  saveCurrentProject();
  updateChangeSummary(`Restored snapshot from ${formatTime(snapshot.at)}.`);
  toast('Snapshot restored');
}

function restoreLatestSnapshot() {
  if (!snapshots.length) return toast('No snapshot available');
  restoreSnapshot(0);
}

function addHistoryNote() {
  const textarea = document.getElementById('hist-note');
  const text = (textarea.value || '').trim();
  if (!text) return;
  notes.unshift({ text, at: new Date().toLocaleString() });
  textarea.value = '';
  renderNotes();
  saveCurrentProject();
  toast('Note saved');
}

function clearHistoryNotes() {
  confirmBox('Clear all notes?').then((answer) => {
    if (!answer) return;
    notes = [];
    renderNotes();
    saveCurrentProject();
  });
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function copyEl(id) {
  const element = document.getElementById(id);
  if (!element?.value) return toast('Nothing to copy');
  navigator.clipboard.writeText(element.value).then(() => toast('Copied'));
}

function openShare() {
  document.getElementById('share-bg').classList.add('on');
  refreshIcons();
}

function closeShare() {
  document.getElementById('share-bg').classList.remove('on');
}

async function shareQuickLink() {
  document.getElementById('share-a-url').value = await createQuickLink(files);
  toast('Link ready');
}

async function shareGitHub() {
  const status = (value) => {
    document.getElementById('gh-status').textContent = value;
  };
  try {
    if (/github\.io$/i.test(window.location.hostname) && APP_CONFIG.publishEndpoint.startsWith(window.location.origin)) {
      throw new Error('Set window.AETHER_CONFIG.publishEndpoint to your deployed Vercel proxy before using secure GitHub publish from GitHub Pages.');
    }
    status('Packing');
    const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(files);
    const projectId = currentProjectId || `proj-${Date.now()}`;
    status('Publishing');
    const response = await fetch(APP_CONFIG.publishEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        pathHint: `projects/${projectId}.json`,
        encryptedPayload,
        message: `DUB5: publish ${projectId}`,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.rawUrl) {
      throw new Error(data.error || `Publish failed (${response.status})`);
    }
    document.getElementById('share-g-url').value = `${location.origin}${location.pathname}?src=${encodeURIComponent(data.rawUrl)}#key=${keyB64}`;
    status('Done');
    toast('GitHub link ready');
  } catch (error) {
    console.error(error);
    status('Error');
    await infoBox('Publish failed', error.message || 'Could not publish the encrypted project.');
  }
}

async function viewerAuto() {
  if (location.hash.startsWith('#v1:')) {
    try {
      const pkg = await unpackQuickLink(location.hash.slice(4));
      files = Object.entries(pkg.files).map(([name, content]) => ({ name, content }));
      activeFile = files.find((file) => file.name === 'index.html') ? 'index.html' : files[0]?.name || 'index.html';
      renderFileTree();
      openFile(activeFile);
      renderPrev(getIndexHTML());
      showScreen('app');
      switchTab('preview');
    } catch (error) {
      console.error(error);
      toast('Failed to open quick link');
    }
  }
  const search = new URLSearchParams(location.search);
  if (search.has('src') && location.hash.includes('key=')) {
    try {
      const response = await fetch(search.get('src'), { cache: 'no-store' });
      const payload = await response.json();
      const keyB64 = location.hash.split('key=')[1].split('&')[0];
      const pkg = await unpackEncryptedShare(payload, keyB64);
      files = Object.entries(pkg.files).map(([name, content]) => ({ name, content }));
      activeFile = files.find((file) => file.name === 'index.html') ? 'index.html' : files[0]?.name || 'index.html';
      renderFileTree();
      openFile(activeFile);
      renderPrev(getIndexHTML());
      showScreen('app');
      switchTab('preview');
    } catch (error) {
      console.error(error);
      toast('Failed to open shared link');
    }
  }
}

async function send() {
  const input = document.getElementById('pinput');
  const userText = (input.value || '').trim();
  if (!userText || streaming) return;
  input.value = '';
  addUserMsg(userText);
  chatHist.push({ role: 'user', content: userText });
  saveCurrentProject();
  addTyping();
  currentRunTouchedFiles = [];
  streaming = true;
  ctrl = new AbortController();
  setSendBtn('stop');
  updateRunState('Generating');
  updateChangeSummary('Working on your request...');

  let visibleText = '';
  let aiEl = null;
  let inFile = false;
  let curFile = '';
  let fileBuffer = '';
  let statusEl = null;

  try {
    const response = await fetch(APP_CONFIG.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: userText,
        personality: 'coder',
        model: 'gpt-4o',
        thinking_mode: 'balanced',
        session_id: sessionId,
        history: chatHist.slice(0, -1).slice(-APP_CONFIG.maxHistoryMessages).map((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
      }),
      signal: ctrl.signal,
    });
    if (!response.ok) throw new Error(`AI request failed (${response.status})`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sse = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      sse += decoder.decode(value, { stream: true });
      const events = sse.split('\n\n');
      sse = events.pop() || '';
      for (const event of events) {
        for (const rawLine of event.split('\n')) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          let delta = '';
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'metadata' || parsed.type === 'ping' || parsed.type === 'error') continue;
            delta = parsed.content ?? parsed.choices?.[0]?.delta?.content ?? parsed.text ?? parsed.delta ?? parsed.message ?? '';
          } catch {
            delta = data;
          }
          if (!delta) continue;
          let chunk = delta;
          while (chunk.length) {
            if (!inFile) {
              const begin = chunk.match(beginRe());
              if (!begin) {
                visibleText += chunk;
                chunk = '';
                break;
              }
              const idx = begin.index ?? 0;
              visibleText += chunk.slice(0, idx);
              curFile = (begin[1] || '').trim() || 'index.html';
              inFile = true;
              fileBuffer = '';
              statusEl = addFileStatus(curFile);
              chunk = chunk.slice(idx + begin[0].length);
            } else {
              const end = chunk.match(endRe());
              if (!end) {
                fileBuffer += chunk;
                chunk = '';
                break;
              }
              const idx = end.index ?? 0;
              fileBuffer += chunk.slice(0, idx);
              writeFile((end[1] || '').trim() || curFile, fileBuffer, 'ai');
              setFileStatusDone(statusEl);
              inFile = false;
              curFile = '';
              fileBuffer = '';
              statusEl = null;
              chunk = chunk.slice(idx + end[0].length);
            }
          }
          if (visibleText.trim()) {
            if (!aiEl) {
              rmTyping();
              aiEl = ensureAiMsg();
            }
            aiEl.innerHTML = renderMarkdown(visibleText);
          }
        }
      }
    }
    rmTyping();
    chatHist.push({ role: 'assistant', content: visibleText.trim() || '' });
    if (currentRunTouchedFiles.length) {
      updateChangeSummary(`Updated ${currentRunTouchedFiles.join(', ')}.`);
      createSnapshot(`AI run - ${new Date().toLocaleTimeString()}`);
    } else {
      updateChangeSummary('Generation completed without file updates.');
    }
    updateRunState('Ready');
    saveCurrentProject();
  } catch (error) {
    rmTyping();
    if (error.name !== 'AbortError') {
      const ai = ensureAiMsg();
      ai.textContent = `Warning: ${error.message}`;
      chatHist.push({ role: 'assistant', content: `Warning: ${error.message}` });
      updateRunState('Error');
      updateChangeSummary(error.message);
      saveCurrentProject();
    } else {
      updateRunState('Stopped');
      updateChangeSummary('Generation stopped.');
    }
  } finally {
    streaming = false;
    ctrl = null;
    setSendBtn('send');
  }
}

function abortStream() {
  ctrl?.abort();
}

function onSendBtn() {
  if (streaming) abortStream();
  else send();
}

function handleImportChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  file.text()
    .then((text) => JSON.parse(text))
    .then((data) => {
      const imported = withDefaults({
        ...data,
        id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: data.name || file.name.replace(/\.json$/i, ''),
        updatedAt: Date.now(),
        lastOpened: Date.now(),
      });
      projects.unshift(imported);
      persistProjects();
      renderProjects();
      renderRecentProjects();
      toast('Project imported');
    })
    .catch((error) => {
      console.error(error);
      infoBox('Import failed', 'That JSON file does not look like a DUB5 project export.');
    })
    .finally(() => {
      event.target.value = '';
    });
}

function bindEvents() {
  document.getElementById('land-ta').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      startApp();
    }
  });
  document.getElementById('pinput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  });
  const editor = document.getElementById('code-editor');
  let editTimer = null;
  editor.addEventListener('input', () => {
    clearTimeout(editTimer);
    editTimer = setTimeout(() => writeFile(activeFile, editor.value ?? ''), 220);
  });
  const nameInput = document.getElementById('proj-name');
  let nameTimer = null;
  nameInput.addEventListener('input', () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(saveCurrentProject, 250);
  });
  nameInput.addEventListener('blur', saveCurrentProject);
  document.getElementById('import-project-input').addEventListener('change', handleImportChange);
}

Object.assign(window, {
  addHistoryNote,
  clearHistoryNotes,
  closeShare,
  copyEl,
  createSnapshot,
  deleteProject,
  dlHTML,
  duplicateCurrentProject,
  duplicateProjectById,
  exportCurrentProject,
  exportProjectById,
  newProject,
  onSendBtn,
  openFile,
  openProject,
  openShare,
  openTab,
  refreshPrev,
  restoreLatestSnapshot,
  restoreSnapshot,
  send,
  setP,
  shareGitHub,
  shareQuickLink,
  showProjects,
  showScreen,
  startApp,
  switchTab,
  toggleMdPreview,
  triggerImport,
  uiDeleteFile,
  uiNewFile,
  uiRenameFile,
});

bindEvents();
setSendBtn('send');
renderProjects();
renderRecentProjects();
renderNotes();
renderSnapshots();
refreshIcons();
viewerAuto();
