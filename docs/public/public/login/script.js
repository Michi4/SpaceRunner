const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const submitButton = document.getElementById("signup-btn");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordStrength = document.getElementById("password-strength");
const passwordMatch = document.getElementById("password-match");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

function validateForm(event) {
  event.preventDefault();

  const usernameValue = usernameInput.value.trim();
  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value;
  const confirmPasswordValue = confirmPasswordInput.value;

  if (usernameValue === "") {
    showError(usernameInput, "Username is required");
  } else {
    showSuccess(usernameInput);
  }

  if (emailValue === "") {
    showError(emailInput, "Email is required");
  } else if (!isValidEmail(emailValue)) {
    showError(emailInput, "Email is not valid");
  } else {
    showSuccess(emailInput);
  }

  if (passwordValue === "") {
    showError(passwordInput, "Password is required");
  } else if (!passwordRegex.test(passwordValue)) {
    showError(passwordInput, "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number");
  } else {
    showSuccess(passwordInput);
  }

  if (confirmPasswordValue === "") {
    showError(confirmPasswordInput, "Please confirm your password");
  } else if (passwordValue !== confirmPasswordValue) {
    showError(confirmPasswordInput, "Passwords do not match");
  } else {
    showSuccess(confirmPasswordInput);
  }

  // Submit the form if all fields are valid
  if (document.querySelectorAll(".form-control.success").length === 4) {
    submitButton.disabled = true;
    submitButton.classList.add("disabled");
    submitButton.textContent = "Submitting...";
    document.forms[0].submit();
  }
}

function showError(input, message) {
  const formControl = input.parentElement;
  const errorText = formControl.querySelector(".error-text");

  formControl.classList.remove("success");
  formControl.classList.add("error");
  errorText.textContent = message;
}

function showSuccess(input) {
  const formControl = input.parentElement;

  formControl.classList.remove("error");
  formControl.classList.add("success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkPasswordStrength() {
    const password = passwordInput.value;
    let strength = 0;
  
    if (password.length >= 12) {
      strength += 1;
    }
  
    if (password.match(/[a-z]/)) {
      strength += 1;
    }
  
    if (password.match(/[A-Z]/)) {
      strength += 1;
    }
  
    if (password.match(/[0-9]/)) {
      strength += 1;
    }
  
    if (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)) {
      strength += 1;
    }
  
    switch (strength) {
      case 0:
      case 1:
      case 2:
        passwordStrength.textContent = "Weak";
        passwordStrength.style.color = "#d8000c";
        break;
      case 3:
        passwordStrength.textContent = "Moderate";
        passwordStrength.style.color = "#f0ad4e";
        break;
      case 4:
        passwordStrength.textContent = "Strong";
        passwordStrength.style.color = "#4f8a10";
        break;
      case 5:
        passwordStrength.textContent = "Very Strong";
        passwordStrength.style.color = "#4f8a10";
        break;
      default:
        break;
    }
  }
  