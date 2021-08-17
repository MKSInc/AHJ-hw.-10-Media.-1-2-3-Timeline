import postHTML from './post.html';

export default class Post {
  constructor({ type, content, coords } = {}) {
    this.element = null;
    this.els = {
      body: null,
      coords: null,
      date: null,
    };

    this.init(type, content, coords);
  }

  init(type, content, coords) {
    let tempWrapEl = document.createElement('div');
    tempWrapEl.insertAdjacentHTML('afterbegin', postHTML);

    this.element = tempWrapEl.querySelector('.post');
    tempWrapEl = null;

    this.els.body = this.element.querySelector('.post__body');
    this.els.coords = this.element.querySelector('.post__coords');
    this.els.date = this.element.querySelector('.post__date');
    this.setCoords(coords);
    this.setDate();

    const create = {
      text: this.createTextPost.bind(this),
    };

    create[type](content);
  }

  setCoords(coords) {
    if (coords && 'latitude' in coords) {
      this.els.coords.textContent = `[${coords.latitude}, ${coords.longitude}]`;
      return;
    }

    this.els.coords.classList.add('_hidden');
  }

  setDate() {
    const created = new Date();
    const date = created.toLocaleDateString('ru');
    const time = created.toLocaleTimeString('ru', { hour: 'numeric', minute: 'numeric' });
    this.els.date.textContent = `${date} ${time}`;
  }

  createTextPost(content) {
    const postTextEl = document.createElement('p');
    postTextEl.classList.add('post__text');
    postTextEl.textContent = content;

    this.els.body.append(postTextEl);
  }
}
