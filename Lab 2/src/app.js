// src/app.js
import { signIn, signOut, getUser } from './auth';
import { getUserFragments, createFragment, getFragment } from './api';

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
  
  createBtn.onclick = async () => {
    const content = fragmentContent.value.trim();
    if (!content) {
      createStatus.innerHTML = '<p style="color: red;">Please enter some content</p>';
      return;
    }
    
    createStatus.innerHTML = '<p>Creating fragment...</p>';
    try {
      const result = await createFragment(window._user, content);
      createStatus.innerHTML = '<p style="color: green;">Fragment created successfully!</p>';
      fragmentContent.value = '';
      await loadFragments();
    } catch (err) {
      createStatus.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  };

  const user = await getUser();
  window._user = user; 
  console.log('User:', user);

  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username || user.email || 'user';
  loginBtn.disabled = true;

  await loadFragments();
}

async function loadFragments() {
  const fragmentsContainer = document.querySelector('#fragments-container');
  try {
    const fragmentsData = await getUserFragments(window._user);
    if (fragmentsData && fragmentsData.fragments) {
      if (fragmentsData.fragments.length === 0) {
        fragmentsContainer.innerHTML = '<p>No fragments found. Create your first fragment above!</p>';
        return;
      }
      
      fragmentsContainer.innerHTML = '';
      for (const fragmentId of fragmentsData.fragments) {
        try {
          const fragmentData = await getFragment(window._user, fragmentId);
          const fragmentDiv = document.createElement('div');
          fragmentDiv.style.border = '1px solid #ccc';
          fragmentDiv.style.padding = '10px';
          fragmentDiv.style.margin = '10px 0';
          fragmentDiv.innerHTML = `
            <h4>Fragment ID: ${fragmentId}</h4>
            <p><strong>Content:</strong> ${fragmentData.fragment.data}</p>
            <p><strong>Type:</strong> ${fragmentData.fragment.type}</p>
            <p><strong>Size:</strong> ${fragmentData.fragment.size} bytes</p>
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

addEventListener('DOMContentLoaded', init);
