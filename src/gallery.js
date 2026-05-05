export function getAdjacentSlideIndex(currentIndex, direction, totalSlides) {
  if (!Number.isInteger(totalSlides) || totalSlides < 1) {
    return 0;
  }

  const normalizedCurrent = ((currentIndex % totalSlides) + totalSlides) % totalSlides;
  const step = direction < 0 ? -1 : 1;

  return (normalizedCurrent + step + totalSlides) % totalSlides;
}

export function normalizeSlides(rawSlides) {
  if (!Array.isArray(rawSlides)) {
    throw new Error('Slides must be an array.');
  }

  const usedIds = new Map();

  return rawSlides.map((slide, index) => {
    const slideNumber = index + 1;

    if (!slide || !hasText(slide.title) || !hasText(slide.image)) {
      throw new Error(`Slide ${slideNumber} must include title and image.`);
    }

    const title = slide.title.trim();
    const id = createUniqueId(title, index, usedIds);

    return {
      id,
      title,
      description: hasText(slide.description) ? slide.description.trim() : '',
      image: slide.image.trim(),
      tag: hasText(slide.tag) ? slide.tag.trim() : '',
      link: hasText(slide.link) ? slide.link.trim() : '',
    };
  });
}

export function getPreferredTheme({ systemPrefersDark }) {
  return systemPrefersDark ? 'dark' : 'light';
}

export function initGallery(root, rawSlides) {
  const slides = normalizeSlides(rawSlides);
  const themeMediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
  const state = {
    activeIndex: 0,
    lastFocused: null,
    closeTimer: 0,
    theme: getPreferredTheme({
      systemPrefersDark: Boolean(themeMediaQuery?.matches),
    }),
  };

  root.replaceChildren();
  root.classList.add('gallery-widget');
  applyTheme(root, state.theme);

  const shell = document.createElement('main');
  shell.className = 'widget-shell';

  const grid = document.createElement('section');
  grid.className = 'slide-grid';
  grid.setAttribute('aria-label', 'Slide gallery');

  slides.forEach((slide, index) => {
    grid.append(createSlideCard(slide, index, openSlide));
  });

  const lightbox = createLightbox();

  shell.append(grid, lightbox.overlay);
  root.append(shell);

  function setTheme(theme) {
    state.theme = theme;
    applyTheme(root, state.theme);
  }

  function handleSystemThemeChange(event) {
    setTheme(event.matches ? 'dark' : 'light');
  }

  function openSlide(index, trigger) {
    state.activeIndex = index;
    state.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.clearTimeout(state.closeTimer);

    setLightboxOrigin(lightbox.overlay, trigger);

    updateLightbox(lightbox, slides[state.activeIndex]);
    lightbox.overlay.classList.remove('is-closing');
    lightbox.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    window.requestAnimationFrame(() => {
      lightbox.overlay.classList.add('is-open');
      lightbox.closeButton.focus({ preventScroll: true });
    });
  }

  function closeSlide() {
    if (!lightbox.overlay.classList.contains('is-open')) {
      return;
    }

    lightbox.overlay.classList.remove('is-open');
    lightbox.overlay.classList.add('is-closing');
    document.body.classList.remove('lightbox-open');

    state.closeTimer = window.setTimeout(() => {
      lightbox.overlay.classList.remove('is-closing');
      lightbox.overlay.setAttribute('aria-hidden', 'true');

      if (state.lastFocused && document.contains(state.lastFocused)) {
        state.lastFocused.focus({ preventScroll: true });
      }
    }, 260);
  }

  function showAdjacentSlide(direction) {
    state.activeIndex = getAdjacentSlideIndex(state.activeIndex, direction, slides.length);
    updateLightbox(lightbox, slides[state.activeIndex]);
  }

  function handleKeydown(event) {
    if (!lightbox.overlay.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeSlide();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showAdjacentSlide(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showAdjacentSlide(1);
    }

    if (event.key === 'Tab') {
      trapFocus(event, lightbox.overlay);
    }
  }

  lightbox.closeButton.addEventListener('click', closeSlide);
  lightbox.image.addEventListener('click', closeSlide);
  lightbox.previousButton.addEventListener('click', () => showAdjacentSlide(-1));
  lightbox.nextButton.addEventListener('click', () => showAdjacentSlide(1));
  lightbox.overlay.addEventListener('click', (event) => {
    if (event.target === lightbox.overlay) {
      closeSlide();
    }
  });
  themeMediaQuery?.addEventListener?.('change', handleSystemThemeChange);
  document.addEventListener('keydown', handleKeydown);

  return () => {
    document.removeEventListener('keydown', handleKeydown);
    themeMediaQuery?.removeEventListener?.('change', handleSystemThemeChange);
    window.clearTimeout(state.closeTimer);
    document.body.classList.remove('lightbox-open');
    root.replaceChildren();
  };
}

function applyTheme(root, theme) {
  root.dataset.theme = theme;
}

function createSlideCard(slide, index, onOpen) {
  const button = document.createElement('button');
  button.className = 'slide-card';
  button.type = 'button';
  button.setAttribute('aria-label', `Open ${slide.title}`);

  const media = document.createElement('span');
  media.className = 'slide-card__media';

  const image = document.createElement('img');
  image.src = slide.image;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';

  const shade = document.createElement('span');
  shade.className = 'slide-card__shade';
  media.append(image, shade);

  const body = document.createElement('span');
  body.className = 'slide-card__body';

  if (slide.tag) {
    const tag = document.createElement('span');
    tag.className = 'slide-card__tag';
    tag.textContent = slide.tag;
    body.append(tag);
  }

  const title = document.createElement('span');
  title.className = 'slide-card__title';
  title.textContent = slide.title;

  const description = document.createElement('span');
  description.className = 'slide-card__description';
  description.textContent = slide.description;

  const cta = document.createElement('span');
  cta.className = 'slide-card__cta';
  cta.textContent = 'View slide';

  body.append(title);

  if (slide.description) {
    body.append(description);
  }

  body.append(cta);
  button.append(media, body);
  button.addEventListener('click', () => onOpen(index, button));

  return button;
}

function createLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'lightbox-title');

  const closeButton = document.createElement('button');
  closeButton.className = 'lightbox__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close slide');

  const previousButton = document.createElement('button');
  previousButton.className = 'lightbox__nav lightbox__nav--previous';
  previousButton.type = 'button';
  previousButton.setAttribute('aria-label', 'Previous slide');

  const nextButton = document.createElement('button');
  nextButton.className = 'lightbox__nav lightbox__nav--next';
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', 'Next slide');

  const panel = document.createElement('article');
  panel.className = 'lightbox__panel';

  const media = document.createElement('div');
  media.className = 'lightbox__media';

  const image = document.createElement('img');
  image.className = 'lightbox__image';
  image.alt = '';
  media.append(image);

  const content = document.createElement('div');
  content.className = 'lightbox__content';

  const tag = document.createElement('p');
  tag.className = 'lightbox__tag';

  const title = document.createElement('h2');
  title.className = 'lightbox__title';
  title.id = 'lightbox-title';

  const description = document.createElement('p');
  description.className = 'lightbox__description';
  description.id = 'lightbox-description';

  const link = document.createElement('a');
  link.className = 'lightbox__link';
  link.target = '_blank';
  link.rel = 'noreferrer noopener';
  link.textContent = 'Open link';

  content.append(tag, title, description, link);
  panel.append(media, content);
  overlay.append(closeButton, previousButton, panel, nextButton);

  return {
    overlay,
    closeButton,
    previousButton,
    nextButton,
    image,
    tag,
    title,
    description,
    link,
  };
}

function updateLightbox(lightbox, slide) {
  lightbox.image.src = slide.image;
  lightbox.title.textContent = slide.title;
  lightbox.description.hidden = !slide.description;
  lightbox.description.textContent = slide.description;

  if (slide.description) {
    lightbox.overlay.setAttribute('aria-describedby', 'lightbox-description');
  } else {
    lightbox.overlay.removeAttribute('aria-describedby');
  }

  lightbox.tag.hidden = !slide.tag;
  lightbox.tag.textContent = slide.tag;

  lightbox.link.hidden = !slide.link;
  if (slide.link) {
    lightbox.link.href = slide.link;
  } else {
    lightbox.link.removeAttribute('href');
  }
}

function setLightboxOrigin(overlay, trigger) {
  if (!trigger || typeof trigger.getBoundingClientRect !== 'function') {
    overlay.style.setProperty('--origin-x', '50%');
    overlay.style.setProperty('--origin-y', '50%');
    return;
  }

  const rect = trigger.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  overlay.style.setProperty('--origin-x', `${originX}px`);
  overlay.style.setProperty('--origin-y', `${originY}px`);
}

function trapFocus(event, container) {
  const focusable = [...container.querySelectorAll(
    'a[href]:not([hidden]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element instanceof HTMLElement && !element.hidden);

  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function createUniqueId(title, index, usedIds) {
  const baseId = slugify(title) || `slide-${index + 1}`;
  const count = usedIds.get(baseId) || 0;
  usedIds.set(baseId, count + 1);

  return count === 0 ? baseId : `${baseId}-${count + 1}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
