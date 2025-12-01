// src/app.js
import { signIn, signOut, getUser } from './auth';
import {
  getUserFragments,
  createFragment,
  getFragment,
  updateFragment,
  deleteFragment,
  searchFragments,
  getFragmentTags,
  addFragmentTags,
  autoTagFragment,
  getShareInfo,
  shareFragment,
  getSharedFragments,
  getFragmentVersions,
  extractText,
  detectLabels,
  getAnalytics,
  getFragmentAnalytics,
} from './api';

let selectedFragment = null;

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  loginBtn.onclick = () => signIn();
  logoutBtn.onclick = () => signOut();

  const user = await getUser();
  window._user = user;

  if (!user) return;

  userSection.hidden = false;
  const displayName = user.email || user.username || 'user';
  userSection.querySelector('.username').innerText = displayName;
  loginBtn.disabled = true;

  setupTabs();
  setupCoreFeatures();
  setupSearchTab();
  setupTagsTab();
  setupSharingTab();
  setupVersionsTab();
  setupAITab();
  setupAnalyticsTab();

  await loadFragments();
}

// ============================================
// TAB NAVIGATION
// ============================================

function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach((btn) => {
    btn.onclick = () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      document.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
    };
  });
}

// ============================================
// CORE FEATURES
// ============================================

function setupCoreFeatures() {
  const createBtn = document.querySelector('#create-btn');
  const fragmentContent = document.querySelector('#fragment-content');
  const fragmentType = document.querySelector('#fragment-type');
  const imageUpload = document.querySelector('#image-upload');
  const createStatus = document.querySelector('#create-status');
  const updateBtn = document.querySelector('#update-btn');
  const deleteBtn = document.querySelector('#delete-btn');
  const updateContent = document.querySelector('#update-content');
  const updateStatus = document.querySelector('#update-status');
  const refreshBtn = document.querySelector('#refresh-btn');
  const loadDataBtn = document.querySelector('#load-data-btn');
  const convertExt = document.querySelector('#convert-ext');

  createBtn.onclick = async () => {
    createStatus.innerHTML = '<p>Creating...</p>';
    try {
      // Check if image is uploaded
      if (imageUpload.files.length > 0) {
        const file = imageUpload.files[0];
        const result = await createFragment(window._user, file, file.type);
        createStatus.innerHTML = `<div class="status success">Image fragment created: ${result.fragment.id}</div>`;
        imageUpload.value = '';
      } else {
        const content = fragmentContent.value.trim();
        if (!content) {
          createStatus.innerHTML = '<div class="status error">Please enter content or upload an image</div>';
          return;
        }
        const result = await createFragment(window._user, content, fragmentType.value);
        createStatus.innerHTML = `<div class="status success">Fragment created: ${result.fragment.id}</div>`;
        fragmentContent.value = '';
      }
      await loadFragments();
    } catch (err) {
      createStatus.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  updateBtn.onclick = async () => {
    if (!selectedFragment) return;
    updateStatus.innerHTML = '<p>Updating...</p>';
    try {
      const content = updateContent.value;
      await updateFragment(window._user, selectedFragment.id, content, selectedFragment.type);
      updateStatus.innerHTML = '<div class="status success">Fragment updated!</div>';
      updateContent.value = '';
      await loadFragments();
    } catch (err) {
      updateStatus.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  deleteBtn.onclick = async () => {
    if (!selectedFragment) return;
    if (!confirm('Are you sure you want to delete this fragment?')) return;
    updateStatus.innerHTML = '<p>Deleting...</p>';
    try {
      await deleteFragment(window._user, selectedFragment.id);
      updateStatus.innerHTML = '<div class="status success">Fragment deleted!</div>';
      selectFragment(null);
      await loadFragments();
    } catch (err) {
      updateStatus.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  refreshBtn.onclick = loadFragments;

  loadDataBtn.onclick = async () => {
    if (!selectedFragment) return;
    const container = document.querySelector('#fragment-data-container');
    container.innerHTML = '<p>Loading...</p>';
    try {
      const ext = convertExt.value;
      const result = await getFragment(window._user, selectedFragment.id, ext);
      if (result.type === 'image') {
        container.innerHTML = `<img src="${result.data}" style="max-width: 100%; border-radius: 8px;" />`;
      } else {
        container.innerHTML = `<pre>${escapeHtml(result.data)}</pre>`;
      }
    } catch (err) {
      container.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };
}

async function loadFragments() {
  const container = document.querySelector('#fragments-container');
  try {
    const data = await getUserFragments(window._user, true);
    if (!data.fragments || data.fragments.length === 0) {
      container.innerHTML = '<p>No fragments yet. Create your first one!</p>';
      return;
    }

    container.innerHTML = '';
    data.fragments.forEach((f) => {
      const div = document.createElement('div');
      div.className = 'fragment-item';
      if (selectedFragment && selectedFragment.id === f.id) {
        div.className += ' selected';
      }
      div.innerHTML = `
        <div class="fragment-id">${f.id}</div>
        <span class="fragment-type">${f.type}</span>
        <div class="fragment-size">${f.size} bytes • ${new Date(f.created).toLocaleDateString()}</div>
      `;
      div.onclick = () => selectFragment(f);
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = `<div class="status error">Error loading fragments: ${err.message}</div>`;
  }
}

function selectFragment(fragment) {
  selectedFragment = fragment;

  // Update all tabs that show selected fragment
  const selectedId = fragment ? fragment.id : 'None';
  const selectedType = fragment ? fragment.type : '-';

  document.querySelector('#selected-fragment-id').textContent = selectedId;
  document.querySelector('#selected-fragment-type').textContent = selectedType;
  document.querySelector('#tags-fragment-id').textContent = selectedId;
  document.querySelector('#share-fragment-id').textContent = selectedId;
  document.querySelector('#versions-fragment-id').textContent = selectedId;
  document.querySelector('#analytics-fragment-id').textContent = selectedId;

  const isImage = fragment && fragment.type.startsWith('image/');
  document.querySelector('#textract-fragment-id').textContent = isImage
    ? selectedId
    : 'Select an image fragment';

  // Enable/disable buttons
  const hasSelection = !!fragment;
  document.querySelector('#update-btn').disabled = !hasSelection;
  document.querySelector('#delete-btn').disabled = !hasSelection;
  document.querySelector('#load-data-btn').disabled = !hasSelection;
  document.querySelector('#add-tags-btn').disabled = !hasSelection;
  document.querySelector('#refresh-tags-btn').disabled = !hasSelection;
  document.querySelector('#share-btn').disabled = !hasSelection;
  document.querySelector('#view-shares-btn').disabled = !hasSelection;
  document.querySelector('#load-versions-btn').disabled = !hasSelection;
  document.querySelector('#load-fragment-analytics-btn').disabled = !hasSelection;
  document.querySelector('#auto-tag-btn').disabled = !isImage;
  document.querySelector('#extract-text-btn').disabled = !isImage;
  document.querySelector('#detect-labels-btn').disabled = !isImage;

  // Update visual selection
  document.querySelectorAll('.fragment-item').forEach((item) => {
    item.classList.remove('selected');
    if (fragment && item.querySelector('.fragment-id').textContent === fragment.id) {
      item.classList.add('selected');
    }
  });
}

// ============================================
// SEARCH TAB
// ============================================

function setupSearchTab() {
  const searchBtn = document.querySelector('#search-btn');
  const resultsContainer = document.querySelector('#search-results');

  searchBtn.onclick = async () => {
    resultsContainer.innerHTML = '<p>Searching...</p>';
    try {
      const query = {
        type: document.querySelector('#search-type').value,
        tags: document.querySelector('#search-tags').value,
        minSize: document.querySelector('#search-min-size').value,
        maxSize: document.querySelector('#search-max-size').value,
      };
      const data = await searchFragments(window._user, query);
      if (!data.fragments || data.fragments.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
      }
      resultsContainer.innerHTML = `<p>Found ${data.count} fragments:</p>`;
      data.fragments.forEach((f) => {
        const div = document.createElement('div');
        div.className = 'fragment-item';
        div.innerHTML = `
          <div class="fragment-id">${f.id}</div>
          <span class="fragment-type">${f.type}</span>
          <div class="fragment-size">${f.size} bytes</div>
          ${f.tags?.length ? `<div>${f.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
        `;
        resultsContainer.appendChild(div);
      });
    } catch (err) {
      resultsContainer.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };
}

// ============================================
// TAGS TAB
// ============================================

function setupTagsTab() {
  const addTagsBtn = document.querySelector('#add-tags-btn');
  const refreshTagsBtn = document.querySelector('#refresh-tags-btn');
  const autoTagBtn = document.querySelector('#auto-tag-btn');
  const tagsStatus = document.querySelector('#tags-status');

  refreshTagsBtn.onclick = async () => {
    if (!selectedFragment) return;
    try {
      const data = await getFragmentTags(window._user, selectedFragment.id);
      const currentTags = document.querySelector('#current-tags');
      if (data.tags && data.tags.length > 0) {
        currentTags.innerHTML = data.tags.map((t) => `<span class="tag">${t}</span>`).join(' ');
      } else {
        currentTags.innerHTML = '<em>No tags</em>';
      }
    } catch (err) {
      tagsStatus.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  addTagsBtn.onclick = async () => {
    if (!selectedFragment) return;
    const tagsInput = document.querySelector('#new-tags').value;
    if (!tagsInput.trim()) return;
    const tags = tagsInput.split(',').map((t) => t.trim());
    tagsStatus.innerHTML = '<p>Adding tags...</p>';
    try {
      await addFragmentTags(window._user, selectedFragment.id, tags);
      tagsStatus.innerHTML = '<div class="status success">Tags added!</div>';
      document.querySelector('#new-tags').value = '';
      refreshTagsBtn.click();
    } catch (err) {
      tagsStatus.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  autoTagBtn.onclick = async () => {
    if (!selectedFragment) return;
    const resultsContainer = document.querySelector('#auto-tag-results');
    resultsContainer.innerHTML = '<p>Auto-tagging with AI...</p>';
    try {
      const data = await autoTagFragment(window._user, selectedFragment.id);
      resultsContainer.innerHTML = `
        <div class="status success">
          Added ${data.addedTags?.length || 0} tags: ${data.addedTags?.join(', ') || 'none'}
        </div>
      `;
      refreshTagsBtn.click();
    } catch (err) {
      resultsContainer.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };
}

// ============================================
// SHARING TAB
// ============================================

function setupSharingTab() {
  const shareBtn = document.querySelector('#share-btn');
  const viewSharesBtn = document.querySelector('#view-shares-btn');
  const loadSharedBtn = document.querySelector('#load-shared-btn');
  const shareStatus = document.querySelector('#share-status');

  shareBtn.onclick = async () => {
    if (!selectedFragment) return;
    const email = document.querySelector('#share-email').value;
    if (!email) {
      shareStatus.innerHTML = '<div class="status error">Please enter an email</div>';
      return;
    }
    shareStatus.innerHTML = '<p>Sharing...</p>';
    try {
      const data = await shareFragment(window._user, selectedFragment.id, email);
      shareStatus.innerHTML = `<div class="status success">${data.message}</div>`;
      document.querySelector('#share-email').value = '';
    } catch (err) {
      shareStatus.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  viewSharesBtn.onclick = async () => {
    if (!selectedFragment) return;
    shareStatus.innerHTML = '<p>Loading shares...</p>';
    try {
      const data = await getShareInfo(window._user, selectedFragment.id);
      shareStatus.innerHTML = `
        <div class="status success">
          Shared with ${data.sharedWith?.length || 0} users
          ${data.sharedWith?.length ? `<br>IDs: ${data.sharedWith.join(', ')}` : ''}
        </div>
      `;
    } catch (err) {
      shareStatus.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  loadSharedBtn.onclick = async () => {
    const container = document.querySelector('#shared-fragments');
    container.innerHTML = '<p>Loading...</p>';
    try {
      const data = await getSharedFragments(window._user);
      if (!data.fragments || data.fragments.length === 0) {
        container.innerHTML = '<p>No fragments shared with you yet.</p>';
        return;
      }
      container.innerHTML = `<p>Found ${data.fragments.length} shared fragments</p>`;
    } catch (err) {
      container.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };
}

// ============================================
// VERSIONS TAB
// ============================================

function setupVersionsTab() {
  const loadVersionsBtn = document.querySelector('#load-versions-btn');
  const versionsList = document.querySelector('#versions-list');

  loadVersionsBtn.onclick = async () => {
    if (!selectedFragment) return;
    versionsList.innerHTML = '<p>Loading versions...</p>';
    try {
      const data = await getFragmentVersions(window._user, selectedFragment.id);
      if (!data.versions || data.versions.length === 0) {
        versionsList.innerHTML = '<p>No version history available.</p>';
        return;
      }
      versionsList.innerHTML = `
        <p>Current Version: ${data.currentVersion}</p>
        ${data.versions
          .map(
            (v) => `
          <div class="fragment-item">
            <strong>Version ${v.version}</strong> ${v.current ? '(current)' : ''}
            <div class="fragment-size">${v.size} bytes • ${new Date(v.updated).toLocaleDateString()}</div>
          </div>
        `
          )
          .join('')}
      `;
    } catch (err) {
      versionsList.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };
}

// ============================================
// AI FEATURES TAB
// ============================================

function setupAITab() {
  const extractTextBtn = document.querySelector('#extract-text-btn');
  const detectLabelsBtn = document.querySelector('#detect-labels-btn');
  const textractResults = document.querySelector('#textract-results');
  const rekognitionResults = document.querySelector('#rekognition-results');

  extractTextBtn.onclick = async () => {
    if (!selectedFragment) return;
    textractResults.innerHTML = '<p>Extracting text with Amazon Textract...</p>';
    try {
      const saveAsFragment = document.querySelector('#save-extracted').checked;
      const data = await extractText(window._user, selectedFragment.id, saveAsFragment);
      textractResults.innerHTML = `
        <div class="status success">
          Extracted ${data.wordCount} words from ${data.blockCount} text blocks
          ${data.newFragmentId ? `<br>Saved as new fragment: ${data.newFragmentId}` : ''}
        </div>
        <pre>${escapeHtml(data.extractedText || 'No text found')}</pre>
      `;
      if (data.newFragmentId) await loadFragments();
    } catch (err) {
      textractResults.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  detectLabelsBtn.onclick = async () => {
    if (!selectedFragment) return;
    rekognitionResults.innerHTML = '<p>Detecting labels with Amazon Rekognition...</p>';
    try {
      const autoTag = document.querySelector('#auto-tag-labels').checked;
      const data = await detectLabels(window._user, selectedFragment.id, autoTag);
      rekognitionResults.innerHTML = `
        <div class="status success">
          Detected ${data.labelCount} labels
          ${autoTag ? '<br>Labels added as tags!' : ''}
        </div>
        <div style="margin-top: 10px;">
          ${data.labels
            ?.map(
              (l) => `
            <span class="tag" style="background: hsl(${Math.round(l.confidence * 1.2)}, 70%, 50%)">
              ${l.name} (${l.confidence.toFixed(1)}%)
            </span>
          `
            )
            .join(' ')}
        </div>
      `;
    } catch (err) {
      rekognitionResults.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };
}

// ============================================
// ANALYTICS TAB
// ============================================

function setupAnalyticsTab() {
  const loadAnalyticsBtn = document.querySelector('#load-analytics-btn');
  const loadFragmentAnalyticsBtn = document.querySelector('#load-fragment-analytics-btn');
  const analyticsSummary = document.querySelector('#analytics-summary');
  const fragmentAnalytics = document.querySelector('#fragment-analytics');

  loadAnalyticsBtn.onclick = async () => {
    analyticsSummary.innerHTML = '<p>Loading analytics...</p>';
    try {
      const data = await getAnalytics(window._user);
      const s = data.analytics?.summary || {};
      analyticsSummary.innerHTML = `
        <div class="card analytics-card">
          <div class="analytics-value">${s.totalFragments || 0}</div>
          <div class="analytics-label">Total Fragments</div>
        </div>
        <div class="card analytics-card">
          <div class="analytics-value">${formatBytes(s.totalSize || 0)}</div>
          <div class="analytics-label">Total Size</div>
        </div>
        <div class="card analytics-card">
          <div class="analytics-value">${s.totalAccessCount || 0}</div>
          <div class="analytics-label">Total Access</div>
        </div>
        <div class="card analytics-card">
          <div class="analytics-value">${formatBytes(s.averageSize || 0)}</div>
          <div class="analytics-label">Avg Size</div>
        </div>
      `;
    } catch (err) {
      analyticsSummary.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };

  loadFragmentAnalyticsBtn.onclick = async () => {
    if (!selectedFragment) return;
    fragmentAnalytics.innerHTML = '<p>Loading...</p>';
    try {
      const data = await getFragmentAnalytics(window._user, selectedFragment.id);
      const a = data.analytics || {};
      fragmentAnalytics.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>Type:</strong> ${a.type}</div>
          <div><strong>Size:</strong> ${a.size} bytes</div>
          <div><strong>Version:</strong> ${a.version}</div>
          <div><strong>Access Count:</strong> ${a.accessCount}</div>
          <div><strong>Tags:</strong> ${a.tagCount}</div>
          <div><strong>Shared:</strong> ${a.sharedCount}</div>
          <div><strong>Created:</strong> ${new Date(a.created).toLocaleDateString()}</div>
          <div><strong>Updated:</strong> ${new Date(a.updated).toLocaleDateString()}</div>
        </div>
      `;
    } catch (err) {
      fragmentAnalytics.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  };
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

addEventListener('DOMContentLoaded', init);
