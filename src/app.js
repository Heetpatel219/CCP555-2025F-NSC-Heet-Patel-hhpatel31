// src/app.js
import { signIn, signOut, getUser } from './auth';
import { getUserFragments } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  loginBtn.onclick = () => signIn();
  logoutBtn.onclick = () => signOut();

  const user = await getUser();
  window._user = user; console.log('User:', user);

  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username || user.email || 'user';
  loginBtn.disabled = true;

  await getUserFragments(user);
}

addEventListener('DOMContentLoaded', init);
