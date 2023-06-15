/* ---- CONFIG ---- */
const sendButtonSelector = ".T-I.J-J5-Ji.aoO.v7.T-I-atl.L3";
const composeAreaSelector = ".Am.Al.editable.LW-avf.tS-tW";
const iconsBarSelector = "tr.btC";
const receipientsSelector = ".afW.WeJhwb .akl";
const subjectSelector = ".aoD.az6 input.aoT";
const mailBoxClassName = "M9";
const apiEndpoint = "http://localhost:4000/mailrr";
let authToken = null;

// TODO Add Login, store token in local storage and retrieve it from there
/* ---- STORAGE UTILITIES ---- */
function setLocally(obj, callback) {
  return chrome.storage.sync.set(obj, callback || (() => null));
}

function getLocally(keys, callback) {
  return chrome.storage.sync.get(keys, callback || (() => null));
}

getLocally(["token"], (data) => {
  authToken = data.token;
});

/* ---- UTILITIES ---- */
async function fetchEmailId(emailData) {
  // get token from local storage
  //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNDFlNzg5NS0zMzFiLTRlZGItYjc0ZS05YWI0ZDZiNzQ4YzkiLCJpYXQiOjE2ODY4MjYzNjcsImV4cCI6MTY4Njk5OTE2N30.h1mCnybZL_R_RJuS23WNyxwebzmUqQ9wgQNFUJ_szjM";

  const token = authToken;

  if (!token) {
    return { error: "please log in first" };
  }

  const response = await fetch(`${apiEndpoint}/savemail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(emailData),
  });

  const data = await response.json();
  return data;
}

function getSenderEmail() {
  const title = document.querySelector("head > title").innerText;
  const senderEmail = title.split("-")[1].trim();
  return senderEmail;
}
/* --- DOM --- */
// Gets all the relevant elements from the mailbox
function getElementsFromBox(mailBoxEl) {
  const iconsBarEl = mailBoxEl.querySelector(iconsBarSelector);
  const sendBtnEl = mailBoxEl.querySelector(sendButtonSelector);
  const composeAreaEl = mailBoxEl.querySelector(composeAreaSelector);
  const recipientsEls = mailBoxEl.querySelectorAll(receipientsSelector);
  const subjectEl = mailBoxEl.querySelector(subjectSelector);

  return {
    iconsBarEl,
    sendBtnEl,
    composeAreaEl,
    recipientsEls,
    subjectEl,
  };
}

// Sends the email with tracking information
async function sendMailWithTracking(mailBoxEl) {
  const { recipientsEls, subjectEl, composeAreaEl, sendBtnEl } =
    getElementsFromBox(mailBoxEl);
  // Prepare data to send
  let recipientsStr = Array.from(recipientsEls)
    .map((el) => el.textContent)
    .join(",");
  let subjectStr = subjectEl?.value;
  let timestamp = new Date().toISOString();
  let senderEmail = getSenderEmail();

  // Prepare Email Data to send to server
  const emailData = {
    recipient: recipientsStr,
    subject: subjectStr,
    date_sent: timestamp,
    sender_email: senderEmail,
  };
  // Send email data and token to server, add email id to email data
  const response = await fetchEmailId(emailData);

  if (response.error) return alert(response.error);

  const objToEncode = {
    // user_id: "user id here", We don't need this for now
    email_id: response.email_id,
  };

  // Encode data to base64
  const base64Str = btoa(JSON.stringify(objToEncode));

  // Create img element
  const divEl = document.createElement("div");
  divEl.setAttribute("style", "width:0;height:0;");
  divEl.setAttribute("id", "mailrr");
  divEl.innerHTML = `<img style="width:0;height:0;" src="${apiEndpoint}/updatemail?data=${base64Str}">`;

  // console.log("BASE64 STRING: ", base64Str);

  // Add img element to compose area
  composeAreaEl.appendChild(divEl);

  // Select send button and click it
  sendBtnEl.click();
}

// Adds the passed in icon with passed in eventhandler into mailbox with
function addIcon(iconsBarEl, onIconClick) {
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B56CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-check"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>`;

  // Construct Div Container
  const tdEl = document.createElement("td");
  tdEl.setAttribute("data-tooltip", "Send Email With Tracking");
  tdEl.setAttribute("style", "margin-left: 5px");

  // Construct Icon Button Container
  const divEl = document.createElement("div");
  divEl.setAttribute("class", "mailrr-send-container");
  divEl.innerHTML = `<button class="mailrr-send-btn">${iconSvg}</button>`;
  divEl.addEventListener("click", onIconClick);

  // Add div into td
  tdEl.appendChild(divEl);

  // Add the icon button into Iconbar after the first child (send button)
  iconsBarEl.children[0].insertAdjacentElement("afterEnd", tdEl);
}

// This function should run on every new mail box that appears
function runOnMailBox(mailBoxEl) {
  // Get all relevant elemetns from mailbox
  /*
  const { iconsBarEl, sendBtnEl, composeAreaEl, recipientsEls, subjectEl } =
    getElementsFromBox(mailBoxEl);
    */
  const { iconsBarEl } = getElementsFromBox(mailBoxEl);
  // Add the icon into mailbox along with its functionality
  addIcon(iconsBarEl, () => sendMailWithTracking(mailBoxEl));
}

/* ---- OBSERVER ---- */
// Observer Function -> Main
// mutations is an array that contains all the changes that occured at a time in DOM
// every element in mutations array is a MutationRecord object that represents a change
let observer = new MutationObserver((mutations) => {
  // Go through each mutation record in the array
  mutations.forEach((mutation) => {
    // discard mutation record that did not add any node, addedNodes is an array of nodes that were added
    if (!mutation.addedNodes) return;
    let node = mutation.target;
    if (node.className && node.className === mailBoxClassName) {
      // The node is the mail box, run the mailbox function in order to add icon and its functionality
      runOnMailBox(node);
    }

    // observer.disconnect();
  });
});

observerConfig = {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
};

// Observe the whole document for changes
observer.observe(document.body, observerConfig);

// stop watching using:
// observer.disconnect();
