import "./index.css";
import Api from "../scripts/api.js";

import logo from "../images/logo.svg";
import avatar from "../images/Avatar.svg";
import editIcon from "../images/edit-icon.svg";
import plusIcon from "../images/plus-icon.svg";

import {
  enableValidation,
  resetValidation,
  toggleButtonState,
  settings,
} from "../scripts/validation.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "90e2896d-4d8e-487d-a2f4-dcae0000f08c",
    "Content-Type": "application/json",
  },
});

let selectedCardId = null;
let selectedCardElement = null;

const editAvatarBtn = document.querySelector(".profile__avatar-edit-btn");
const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarForm = editAvatarModal.querySelector(".modal__form");
const avatarInput = editAvatarModal.querySelector("#avatar-input");

const deleteCardModal = document.querySelector("#delete-card-modal");
const deleteCardForm = deleteCardModal.querySelector(".modal__form");

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");

const profileNameEl = document.querySelector(".profile__title");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);

const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");

const cardCaptionInput = newPostForm.querySelector("#card-caption-input");
const cardImageUrlInput = newPostForm.querySelector("#card-image-input");

const cardTemplate = document.querySelector("#card-template").content;
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

const addCardSubmitBtn = newPostForm.querySelector(
  settings.submitButtonSelector
);

const deleteCardSubmitBtn = deleteCardForm.querySelector(
  settings.submitButtonSelector
);

const editProfileSubmitBtn = editProfileForm.querySelector(
  settings.submitButtonSelector
);

const editAvatarSubmitBtn = editAvatarForm.querySelector(".modal__submit-btn");

editAvatarSubmitBtn.dataset.originalText = editAvatarSubmitBtn.textContent;

editAvatarBtn.addEventListener("click", () => {
  avatarInput.value = "";

  openModal(editAvatarModal);

  resetValidation(editAvatarForm, [avatarInput], validationConfig);
});

const deleteCancelBtn = deleteCardForm.querySelector(".modal__cancel-btn");

deleteCancelBtn.addEventListener("click", () => {
  closeModal(deleteCardModal);
});

const handleEditAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  renderLoading(true, editAvatarSubmitBtn);

  api
    .editUserAvatar({
      avatar: avatarInput.value,
    })
    .then((userData) => {
      profileAvatar.src = userData.avatar;

      closeModal(editAvatarModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, editAvatarSubmitBtn);
    });
};

const editProfileSubmitBtn =
  editProfileForm.querySelector(".modal__submit-btn");
const addCardSubmitBtn = addCardFormElement.querySelector(".modal__submit-btn");
const deleteCardSubmitBtn = deleteCardForm.querySelector(".modal__submit-btn");

editProfileSubmitBtn.dataset.originalText = editProfileSubmitBtn.textContent;
addCardSubmitBtn.dataset.originalText = addCardSubmitBtn.textContent;
deleteCardSubmitBtn.dataset.originalText = deleteCardSubmitBtn.textContent;

function handleEsc(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");

    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEsc);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEsc);
}

function setModalClose(modal) {
  modal.addEventListener("mousedown", (evt) => {
    if (
      evt.target.classList.contains("modal_is-opened") ||
      evt.target.classList.contains("modal__close-btn")
    ) {
      closeModal(modal);
    }
  });
}

function setLoading(button, isLoading, text = "Saving...") {
  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }

    button.textContent = text;
  } else {
    button.textContent = button.dataset.originalText;
  }
}

function getCardElement(data) {
  const card = cardTemplate.querySelector(".card").cloneNode(true);

  const img = card.querySelector(".card__image");
  const title = card.querySelector(".card__title");
  const likeBtn = card.querySelector(".card__like-btn");
  const deleteBtn = card.querySelector(".card__delete-btn");

  img.src = data.link;
  img.alt = data.name;
  title.textContent = data.name;

  if (data.isLiked) {
    likeBtn.classList.add("card__like-btn_active");
  }

  img.addEventListener("click", () => {
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;

    openModal(previewModal);
  });

  likeBtn.addEventListener("click", () => {
    const isLiked = likeBtn.classList.contains("card__like-btn_active");

    api
      .changeLikeCardStatus(data._id, isLiked)
      .then((updatedCard) => {
        likeBtn.classList.toggle(
          "card__like-btn_active",
          updatedCard.isLiked
        );
      })
      .catch(console.error);
  });

  deleteBtn.addEventListener("click", () => {
    selectedCardId = data._id;
    selectedCardElement = card;

    openModal(deleteCardModal);
  });

  return cardElement;
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  api
    .updateAvatar(avatarInput.value)
    .then((user) => {
      profileAvatar.src = user.avatar;

      closeModal(editAvatarModal);

      avatarInput.value = "";
    })
    .catch(console.error);
}

function handleProfileSubmit(evt) {
  evt.preventDefault();

  setLoading(editProfileSubmitBtn, true);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((user) => {
      profileNameEl.textContent = user.name;
      profileDescriptionEl.textContent = user.about;

      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setLoading(editProfileSubmitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  setLoading(addCardSubmitBtn, true, "Creating...");

  api
    .addCard({
      name: cardCaptionInput.value,
      link: cardImageUrlInput.value,
    })
    .then((card) => {
      cardsList.prepend(getCardElement(card));

      evt.target.reset();

      toggleButtonState(
        [cardCaptionInput, cardImageUrlInput],
        newPostForm.querySelector(settings.submitButtonSelector),
        settings
      );

      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      setLoading(addCardSubmitBtn, false);
    });
}

Promise.all([api.getUserInfo(), api.getInitialCards()])
  .then(([user, cards]) => {
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatar.src = user.avatar;

    editProfileNameInput.value = user.name;
    editProfileDescriptionInput.value = user.about;

    cards.forEach((card) => {
      cardsList.append(getCardElement(card));
    });
  })
  .catch(console.error);

editProfileForm.addEventListener("submit", handleProfileSubmit);
editAvatarForm.addEventListener("submit", handleAvatarSubmit);
newPostForm.addEventListener("submit", handleAddCardSubmit);
deleteCardForm.addEventListener("submit", handleDeleteCardSubmit);

editAvatarBtn.addEventListener("click", () => {
  openModal(editAvatarModal);
});

editProfileBtn.addEventListener("click", () => {
  openModal(editProfileModal);

  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings
  );
});

newPostBtn.addEventListener("click", () => {
  openModal(newPostModal);

  resetValidation(
    newPostForm,
    [cardCaptionInput, cardImageUrlInput],
    settings
  );
});

setModalClose(editAvatarModal);
setModalClose(editProfileModal);
setModalClose(newPostModal);
setModalClose(deleteCardModal);
setModalClose(previewModal);

enableValidation(settings);