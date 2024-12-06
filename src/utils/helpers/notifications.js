import Swal from "sweetalert2";

function notifications(title, text, icon) {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    customClass: {
      title: "swal2-title",
      popup: "swal2-popup",
      confirmButton: "swal2-confirm",
    },
    timer: 10000,
    timerProgressBar: true,
    background: "white",
    willOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.fontFamily = "'Pixelify Sans', sans-serif";
        popup.style.borderRadius = "0px";

        const title = popup.querySelector(".swal2-title");
        const content = popup.querySelector(".swal2-content");
        const confirmButton = popup.querySelector(".swal2-confirm");

        if (title) title.style.fontFamily = "'Pixelify Sans', sans-serif";
        if (content) content.style.fontFamily = "'Pixelify Sans', sans-serif";
        if (confirmButton) {
          confirmButton.style.fontFamily = "'Pixelify Sans', sans-serif";
          confirmButton.style.borderRadius = "0px";
        }
      }
    },
  });
}

export function showDisconnectedNotification() {
  const title = "Отключено!";
  const text = "Соединение с сервером потеряно, или переподключение.";
  const icon = "warning";
  notifications(title, text, icon);
}

export function showAuthenticationRequiredNotification() {
  const title = "Требуется авторизация!";
  const text =
    "Вам нужно войти в систему, чтобы размещать пиксели. Если вы уже вошли, пожалуйста, авторизуйтесь повторно.";
  const icon = "info";
  notifications(title, text, icon);
}

export function showConnectionRestoredNotification() {
  const title = "Соединение восстановлено!";
  const text = "Соединение с сервером успешно восстановлено.";
  const icon = "success";
  notifications(title, text, icon);
}

export function showOutOfPixelsNotification() {
  const title = "Закончились пиксели!";
  const text = "Подождите, ваш баланс равен нулю.";
  const icon = "warning";
  notifications(title, text, icon);
}

export function showDonationAlert() {
  const title = "Введите корректную сумму для оплаты.";
  const text = "Сумма должна быть больше 0р";
  const icon = "warning";
  notifications(title, text, icon);
}

export function showDonationSucces() {
  const title = "Успешная оплата";
  const text = "Оплата прошла успешно!";
  const icon = "success";
  notifications(title, text, icon);
}

export function showDonationError() {
  const title = "Оплата не удалась. Попробуйте снова.";
  const text = "При попытке оплаты произошла ошибка, попробуйте снова, если оплата прошла обратитесь в поддержку ";
  const icon = "error";
  notifications(title, text, icon);
}

export function showDonationMakeError() {
  const title = "Ошибка при создании платежа.";
  const text = "Ошибка при создании платежа. Попробуйте снова или через минуту.";
  const icon = "error";
  notifications(title, text, icon);
}

