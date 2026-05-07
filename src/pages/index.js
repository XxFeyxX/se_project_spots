import "./index.css";

import logo from "../images/logo.svg";
import avatar from "../images/Avatar.svg";
import editIcon from "../images/edit-icon.svg";
import plusIcon from "../images/plus-icon.svg";

import picture1 from "../images/picture-1.svg";
import picture2 from "../images/picture-2.svg";
import picture3 from "../images/picture-3.svg";
import picture4 from "../images/picture-4.svg";
import picture5 from "../images/picture-5.svg";
import picture6 from "../images/picture-6.svg";

import {
  enableValidation,
  validationConfig,
  checkInputValidity,
  resetValidation,
  toggleButtonState,
} from "../scripts/validation.js";

const initialCards = [
  { name: "Val Thorens", link: picture1 },
  { name: "Restaurant terrace", link: picture2 },
  { name: "An outdoor cafe", link: picture3 },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: picture4,
  },
  { name: "Tunnel with morning light", link: picture5 },
  { name: "Mountain house", link: picture6 },
];
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton =
  editProfileModal.querySelector(".modal__close-btn");
const headerLogo = document.querySelector(".header__logo");
const profileAvatar = document.querySelector(".profile__avatar");
const editProfileIcon = document.querySelector(".profile__pencil-icon");
const newPostIcon = document.querySelector(".profile__plus-icon");

headerLogo.src = logo;
profileAvatar.src = avatar;
editProfileIcon.src = editIcon;
newPostIcon.src = plusIcon;

const profileNameEl = document.querySelector(".profile__title");

const profileDescriptionEl = document.querySelector(".profile__description");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);

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

function openModal(newPostModal) {
  newPostModal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEsc);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEsc);
}

const modals = document.querySelectorAll(".modal");

modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === evt.currentTarget) {
      closeModal(modal);
    }
  });
});

function getCardElement(data) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  cardImageEl.addEventListener("click", () => {
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;

    openModal(previewModal);
  });

  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  cardLikeBtnEl.addEventListener("click", () => {
    cardLikeBtnEl.classList.toggle("card__like-btn_active");
  });

  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  cardDeleteBtnEl.addEventListener("click", (evt) => {
    evt.target.closest(".card").remove();
  });

  return cardElement;
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  profileNameEl.textContent = editProfileNameInput.value;
  profileDescriptionEl.textContent = editProfileDescriptionInput.value;
  evt.target.reset();
  closeModal(editProfileModal);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const newCardData = {
    name: cardCaptionInput.value,
    link: cardImageUrlInput.value,
  };

  const cardElement = getCardElement(newCardData);
  cardsList.prepend(cardElement);

  evt.target.reset();
  toggleButtonState(
    [cardCaptionInput, cardImageUrlInput],
    addCardFormElement.querySelector(validationConfig.submitButtonSelector),
    validationConfig,
  );
  closeModal(newPostModal);
}

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
  resetValidation(
    editProfileModal,
    [editProfileNameInput, editProfileDescriptionInput],
    validationConfig,
  );
});

editProfileCloseButton.addEventListener("click", function () {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", () => {
  openModal(newPostModal, cardCaptionInput, cardCaptionInput, validationConfig);
  resetValidation(
    addCardFormElement,
    [cardCaptionInput, cardImageUrlInput],
    validationConfig,
  );
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

editProfileForm.addEventListener("submit", handleProfileFormSubmit);

addCardFormElement.addEventListener("submit", handleAddCardSubmit);

initialCards.forEach(function (item) {
  cardsList.append(getCardElement(item));
});

enableValidation(validationConfig);
