import Post from '../post/Post';
import ModalCoords from '../modal/coords/ModalCoords';

export default class Timeline {
  constructor() {
    this.element = null; // !!! возможно не нужен

    this.els = {
      body: null,
      input: null,
      mediaDuration: null,
      forms: {
        text: null,
        media: null,
      },
      btns: {
        audio: null,
        video: null,
        send: null,
        cancel: null,
      },
    };

    this.modals = {
      coords: null,
      mediaTrouble: null,
    };

    this.postMedia = undefined; // принимает значение 'audio' или 'video'
    this.init();
  }

  init() {
    this.element = document.querySelector('.timeline');
    this.els.body = this.element.querySelector('.timeline__body');

    this.els.forms.text = this.element.querySelector('.user-panel__form-text');
    this.els.forms.text.addEventListener('submit', this.onFormTextSubmit.bind(this));

    this.els.input = this.element.querySelector('.user-panel__input');
    this.els.input.addEventListener('keydown', this.onInputKeypress.bind(this));
    this.els.input.focus();

    this.els.mediaDuration = this.element.querySelector('.form-media__duration');

    this.els.btns.audio = this.element.querySelector('.form-media__btn-audio');
    this.els.btns.video = this.element.querySelector('.form-media__btn-video');
    this.els.btns.send = this.element.querySelector('.form-media__btn-send');
    this.els.btns.cancel = this.element.querySelector('.form-media__btn-cancel');

    // Передаем дополнительный параметр для модального окна - элемент input Timeline'a,
    // что бы при любом закрытии окна, оно само устанавливало в этот input фокус.
    this.modals.coords = new ModalCoords({ params: { timelineInputEl: this.els.input } });
  }

  // eslint-disable-next-line class-methods-use-this
  async getCoordsAuto() {
    // Геолокация поддерживается браузером. Запрашиваем координиаты
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            coords: position.coords,
          });
        },
        (error) => {
          resolve({
            success: false,
            errCode: error,
          });
        },
      );
    });
  }

  async getCoordsManual(errCode) {
    const modalTexts = {
      0: 'К сожалению, ваш браузер не поддерживает определение место положения, пожалуйста, воспользуйтесь другим браузером, либо введите координаты вручную.',
      1: 'К сожалению, нам не удалось определить ваше место положение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную.',
      2: 'К сожалению, нам не удалось определить ваше место положение, пожалуйста, проверьте ваше интернет соединение, либо введите координаты вручную.',
      3: null,
    };

    modalTexts['3'] = modalTexts['2'];

    let modalText = 'К сожалению, нам не удалось определить ваше место положение, пожалуйста, введите координаты вручную.';

    if (errCode in modalTexts) modalText = modalTexts[errCode];

    this.modals.coords.show(modalText);
    const result = await this.modals.coords.getData();
    this.modals.coords.hide();
    return result;
  }

  async getCoords() {
    let result = {
      errCode: {
        code: 0, // Код ошибки на случай, если браузер не поддерживает geolocation.
      },
    };

    if (navigator.geolocation) {
      result = await this.getCoordsAuto();
      if (result.success) return result;
    }

    // Предлагаем пользователю ввести координаты вручную.
    result = await this.getCoordsManual(result.errCode.code);
    return result;
  }

  async onFormTextSubmit(event) {
    event.preventDefault();
    const result = await this.getCoords();

    if (!result.success && !result.publishWithoutCoords) return;

    const postData = {
      type: 'text',
      content: this.els.input.value,
    };

    if (result.success) postData.coords = result.coords;

    const post = new Post(postData);
    this.els.body.prepend(post.element);

    this.els.input.value = '';
  }

  onInputKeypress(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (this.els.input.value === '') return;

    // submit формы через this.els.forms.text.submit() не отлавливается в addEventListener.
    this.els.forms.text.dispatchEvent(new Event('submit'));
  }
}
