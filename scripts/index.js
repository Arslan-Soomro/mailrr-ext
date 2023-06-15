// Console.log doesn't work here, you can do alert though

/* ---- CONFIGS ---- */
const apiEndpoint = "http://localhost:4000/mailrr";

/* ---- STORAGE UTILITIES ---- */
function setLocally(obj, callback) {
  return chrome.storage.sync.set(obj, callback || (() => null));
}

function getLocally(keys, callback) {
  return chrome.storage.sync.get(keys, callback || (() => null));
}

/* ---- UTILITIES ---- */
async function signin(email, password) {
  return await fetch(`${apiEndpoint}/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
}

/* ---- MAIN ---- */
getLocally(["token"], (data) => {
  if (data.token) {
    document.querySelector("#form-cont").style.display = "none";
    document.querySelector("#login-cont").style.display = "block";
  } else {
    document.querySelector("#form-cont").style.display = "block";
    document.querySelector("#login-cont").style.display = "none";
  }
});

// Submit the form data to server
document.querySelector("#form-cont").addEventListener("submit", async (e) => {
  e.preventDefault();
  let errorEl = document.querySelector("#error");
  errorEl.textContent = "";
  let validationError = null;

  const email = e.target.email.value;
  const password = e.target.password.value;

  if (!email || !password) {
    validationError = "Please fill all the fields";
    errorEl.textContent = validationError;
  } else {
    document.querySelector(".spinner").style.display = "block";
    const response = await signin(email, password);
    const data = await response.json();
    if (data.error) {
      validationError = data.error;
      errorEl.textContent = validationError;
    } else {
      setLocally({ token: data.token }, () => {
        console.log("Token stored in local storage");
      });
    }
    document.querySelector(".spinner").style.display = "none";
  }
});
