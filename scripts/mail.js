const sendButtonSelector = ".T-I.J-J5-Ji.aoO.v7.T-I-atl.L3";
const composeAreaSelector = ".Am.Al.editable.LW-avf.tS-tW";
const iconsBarSelector = "tr.btC";
const receipientsSelector = ".afW.WeJhwb .akl";
const subjectSelector = ".aoD.az6 input.aoT";
const mailBoxClassName = "M9";
const apiEndpoint = "http://localhost:3000/api/v1/mail";

// Gets all the relevant elements from the mailbox
function getElementsFromBox(mailBoxEl) {
  const iconsBarEl = mailBoxEl.querySelector(iconsBarSelector);
  const sendBtnEl = mailBoxEl.querySelector(sendButtonSelector);
  const composeAreaEl = mailBoxEl.querySelector(composeAreaSelector);
  const receipientsEls = mailBoxEl.querySelectorAll(receipientsSelector);
  const subjectEl = mailBoxEl.querySelector(subjectSelector);

  return {
    iconsBarEl,
    sendBtnEl,
    composeAreaEl,
    receipientsEls,
    subjectEl,
  };
}

// Sends the email with tracking information
function sendMailWithTracking({
  receipientsEls,
  subjectEl,
  composeAreaEl,
  sendBtnEl,
}) {
  // Prepare data to send
  let receipientsStr = Array.from(receipientsEls).map(
    (el) => el.innerText + ","
  );
  let subjectStr = subjectEl?.value;
  let timestamp = new Date().toISOString();

  // Encode Data
  const objToEncode = {
    receipents: receipientsStr,
    subject: subjectStr,
    timestamp: timestamp,
  };
  const base64Str = btoa(JSON.stringify(objToEncode)); // decode = JSON.parse(atob(encoded))

  // Create img element
  const imgEl = document.createElement("img");
  imgEl.setAttribute("src", `${apiEndpoint}?data=${base64Str}`);
  imgEl.setAttribute("style", "display: none;width:0;height:0;");

  // Add img element to compose area
  composeAreaEl.appendChild(imgEl);

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
  const { iconsBarEl, sendBtnEl, composeAreaEl, receipientsEls, subjectEl } =
    getElementsFromBox(mailBoxEl);
  // Add the icon into mailbox along with its functionality
  addIcon(iconsBarEl, () =>
    sendMailWithTracking({
      receipientsEls,
      subjectEl,
      composeAreaEl,
      sendBtnEl,
    })
  );
}

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
