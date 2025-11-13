// src/app.js
import { signIn, signOut, getUser } from './auth';
import { getUserFragments, createFragment, getFragment, getFragmentAsHtml } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const createBtn = document.querySelector('#create-btn');
  const fragmentContent = document.querySelector('#fragment-content');
  const createStatus = document.querySelector('#create-status');
  const fragmentsContainer = document.querySelector('#fragments-container');

  loginBtn.onclick = () => signIn();
  logoutBtn.onclick = () => signOut();
  
  const fragmentType = document.querySelector('#fragment-type');
  
  createBtn.onclick = async () => {
    const content = fragmentContent.value.trim();
    const contentType = fragmentType.value;
    
    if (!content) {
      createStatus.innerHTML = '<p style="color: red;">Please enter some content</p>';
      return;
    }
    
    createStatus.innerHTML = '<p>Creating fragment...</p>';
    try {
      const result = await createFragment(window._user, content, contentType);
      const location = result.location || `http://localhost:8080/v1/fragments/${result.fragment.id}`;
      createStatus.innerHTML = `
        <p style="color: green;">Fragment created successfully!</p>
        <p><strong>Fragment ID:</strong> ${result.fragment.id}</p>
        <p><strong>Location Header:</strong> <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px;">${location}</code></p>
        <p style="font-size: 0.9em; color: #666;">Check browser Network tab (F12) to see the Location header in the response</p>
      `;
      fragmentContent.value = '';
      await loadFragments();
    } catch (err) {
      createStatus.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  };

  const user = await getUser();
  window._user = user; 
  console.log('User object:', user);
  console.log('User email:', user?.email);
  console.log('User username:', user?.username);

  if (!user) return;

  userSection.hidden = false;
  // Display email if available, otherwise fall back to username
  const displayName = user.email || user.username || 'user';
  console.log('Display name:', displayName);
  userSection.querySelector('.username').innerText = displayName;
  loginBtn.disabled = true;

  await loadFragments();
}

async function loadFragments() {
  const fragmentsContainer = document.querySelector('#fragments-container');
  try {
    // Get fragments with expanded metadata
    const fragmentsData = await getUserFragments(window._user, true);
    if (fragmentsData && fragmentsData.fragments) {
      if (fragmentsData.fragments.length === 0) {
        fragmentsContainer.innerHTML = '<p>No fragments found. Create your first fragment above!</p>';
        return;
      }
      
      fragmentsContainer.innerHTML = '';
      for (const fragment of fragmentsData.fragments) {
        try {
          // Get fragment data (raw text)
          const fragmentData = await getFragment(window._user, fragment.id);
          const fragmentDiv = document.createElement('div');
          fragmentDiv.style.border = '1px solid #ccc';
          fragmentDiv.style.padding = '15px';
          fragmentDiv.style.margin = '10px 0';
          fragmentDiv.style.borderRadius = '5px';
          
          // Format content based on type
          let contentDisplay = fragmentData;
          if (fragment.type === 'application/json') {
            try {
              contentDisplay = JSON.stringify(JSON.parse(fragmentData), null, 2);
            } catch {
              contentDisplay = fragmentData;
            }
          }
          
          fragmentDiv.innerHTML = `
            <h4>Fragment ID: ${fragment.id}</h4>
            <p><strong>Type:</strong> ${fragment.type}</p>
            <p><strong>Size:</strong> ${fragment.size} bytes</p>
            <p><strong>Created:</strong> ${new Date(fragment.created).toLocaleString()}</p>
            <p><strong>Content:</strong></p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto;">${escapeHtml(contentDisplay)}</pre>
            ${fragment.type === 'text/markdown' ? `<button onclick="window.viewAsHtml('${fragment.id}')">View as HTML</button>` : ''}
          `;
          fragmentsContainer.appendChild(fragmentDiv);
        } catch (err) {
          console.error('Error loading fragment:', err);
        }
      }
    }
  } catch (err) {
    fragmentsContainer.innerHTML = '<p style="color: red;">Error loading fragments</p>';
    console.error('Error loading fragments:', err);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// View Markdown as HTML
window.viewAsHtml = async function(fragmentId) {
  try {
    const htmlData = await getFragmentAsHtml(window._user, fragmentId);
    const newWindow = window.open();
    newWindow.document.write(htmlData);
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

addEventListener('DOMContentLoaded', init);
