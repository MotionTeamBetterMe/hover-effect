import './styles.css';
import { initGallery } from './gallery.js';
import { slides } from './slides.js';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('Missing #app root element.');
}

initGallery(app, slides);
