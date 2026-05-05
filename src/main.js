import './styles.css';
import { initGallery } from './gallery.js';
import { slides } from './slides.js';
import { getSlidesSignature, loadSlides } from './slides-loader.js';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('Missing #app root element.');
}

const refreshMs = 60_000;
let cleanupGallery;
let currentSlidesSignature = '';

async function renderLatestSlides() {
  let nextSlides = slides;

  try {
    nextSlides = await loadSlides();
  } catch (error) {
    console.warn(error);
  }

  const nextSignature = getSlidesSignature(nextSlides);

  if (nextSignature === currentSlidesSignature) {
    return;
  }

  cleanupGallery?.();
  cleanupGallery = initGallery(app, nextSlides);
  currentSlidesSignature = nextSignature;
}

renderLatestSlides();
window.setInterval(renderLatestSlides, refreshMs);
