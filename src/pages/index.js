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
} from "../scripts/validation.js";

let selectedCardId = null;
let selectedCardElement = null;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "90e2896d-4d8e-487d-a2f4-dcae0000f08c",
    "Content-Type": "application/json",
  },
});

const editAvatarBtn = document.querySelector(".profile__avatar-edit-btn");
const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarCloseBtn = editAvatarModal.querySelector(".modal__close-btn");
const editAvatarForm = editAvatarModal.querySelector(".modal__form");
const avatarInput = editAvatarModal.querySelector("#avatar-input");

const deleteCardModal = document.querySelector("#delete-card-modal");
const deleteCardCloseBtn = deleteCardModal.querySelector(".modal__close-btn");
const deleteCardForm = deleteCardModal.querySelector(".modal__form");

const validationConfig = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error_visible",
};

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton =
  editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");

const profileNameEl = document.querySelector(".profile__title");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);

const headerLogo = document.querySelector(".header__logo");
const editProfileIcon = document.querySelector(".profile__pencil-icon");
const newPostIcon = document.querySelector(".profile__plus-icon");

headerLogo.src = logo;
profileAvatar.src = avatar;
editProfileIcon.src = editIcon;
newPostIcon.src = plusIcon;

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const addCardFormElement = newPostModal.querySelector(".modal__form");

const cardCaptionInput = addCardFormElement.querySelector(
  "#card-caption-input",
);
const cardImageUrlInput = addCardFormElement.querySelector("#card-image-input");

const cardTemplate = document.querySelector("#card-template").content;
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview",
);

const handleEsc = (evt) => {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");

    if (openedModal) {
      closeModal(openedModal);
    }
  }
};

const editProfileSubmitBtn =
  editProfileForm.querySelector(".modal__submit-btn");
const addCardSubmitBtn = addCardFormElement.querySelector(".modal__submit-btn");
const deleteCardSubmitBtn = deleteCardForm.querySelector(".modal__submit-btn");

editProfileSubmitBtn.dataset.originalText = editProfileSubmitBtn.textContent;
addCardSubmitBtn.dataset.originalText = addCardSubmitBtn.textContent;
deleteCardSubmitBtn.dataset.originalText = deleteCardSubmitBtn.textContent;

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEsc);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEsc);
}

function renderLoading(isLoading, button, loadingText = "Saving...") {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = button.dataset.originalText;
  }
}

const modals = document.querySelectorAll(".modal");

modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === evt.currentTarget) {
      closeModal(modal);
    }
  });
});

deleteCardCloseBtn.addEventListener("click", () => {
  closeModal(deleteCardModal);
});

function getCardElement(data) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);

  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  cardImageEl.addEventListener("click", () => {
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;

    openModal(previewModal);
  });

  cardLikeBtnEl.addEventListener("click", () => {
    const isLiked = cardLikeBtnEl.classList.contains("card__like-btn_active");

    api
      .changeLikeCardStatus(data._id, isLiked)
      .then((updatedCard) => {
        cardLikeBtnEl.classList.toggle(
          "card__like-btn_active",
          updatedCard.isLiked,
        );
      })
      .catch(console.error);
  });

  cardDeleteBtnEl.addEventListener("click", () => {
    selectedCardId = data._id;
    selectedCardElement = cardElement;

    openModal(deleteCardModal);
  });

  deleteCardForm.addEventListener("submit", (evt) => {
    evt.preventDefault();

    api
      .deleteCard(selectedCardId)
      .then(() => {
        cardElement.remove();
        closeModal(deleteCardModal);

        selectedCardId = null;
        selectedCardElement = null;
      })
      .catch(console.error);
  });

  return cardElement;
}

api
  .getUserInfo()
  .then((userData) => {
    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatar.src = userData.avatar;

    editProfileNameInput.value = userData.name;
    editProfileDescriptionInput.value = userData.about;
  })
  .catch(console.error);

api
  .getInitialCards()
  .then((cards) => {
    cards.forEach((cardData) => {
      const cardElement = getCardElement(cardData);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

function handleProfileFormSubmit(evt) {
  evt.preventDefault();

  renderLoading(true, editProfileSubmitBtn);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((userData) => {
      profileNameEl.textContent = userData.name;
      profileDescriptionEl.textContent = userData.about;

      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, editProfileSubmitBtn);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  renderLoading(true, addCardSubmitBtn, "Creating...");

  const newCardData = {
    name: cardCaptionInput.value,
    link: cardImageUrlInput.value,
  };

  api
    .addCard(newCardData)
    .then((cardDataFromServer) => {
      const cardElement = getCardElement(cardDataFromServer);
      cardsList.prepend(cardElement);

      evt.target.reset();

      toggleButtonState(
        [cardCaptionInput, cardImageUrlInput],
        addCardFormElement.querySelector(validationConfig.submitButtonSelector),
        validationConfig,
      );

      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, addCardSubmitBtn);
    });
}

deleteCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  renderLoading(true, deleteCardSubmitBtn, "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCardElement.remove();
      closeModal(deleteCardModal);

      selectedCardId = null;
      selectedCardElement = null;
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, deleteCardSubmitBtn);
    });
});

editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  openModal(editProfileModal);

  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    validationConfig,
  );
});

editProfileCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", () => {
  openModal(newPostModal);

  resetValidation(
    addCardFormElement,
    [cardCaptionInput, cardImageUrlInput],
    validationConfig,
  );
});

newPostCloseBtn.addEventListener("click", () => {
  closeModal(newPostModal);
});

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

editProfileForm.addEventListener("submit", handleProfileFormSubmit);
addCardFormElement.addEventListener("submit", handleAddCardSubmit);

enableValidation(validationConfig);
