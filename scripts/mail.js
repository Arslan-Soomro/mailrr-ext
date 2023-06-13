console.log("Mail.js Has been loaded!");

const sendButtonSelector = ".T-I.J-J5-Ji.aoO.v7.T-I-atl.L3";
const composeAreaSelector = ".Am.Al.editable.LW-avf.tS-tW";
const iconsBarSelector = "tr.btC";
const receipientsSelector = ".afW.WeJhwb .akl";
const subjectSelector = ".aoD.az6 input.aoT";
const apiEndpoint = "http://localhost:3000/api/v1/mail";

// Waits for element with given selector to come into existence
function waitForElem(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function sendMailWithTracking() {
    
    // Prepare data to send
    let receipientsStr = Array.from(document.querySelectorAll(receipientsSelector)).map((el) => el.innerText + ",");;
    let subjectStr = document.querySelector(subjectSelector)?.value;
    let timestamp = new Date().toISOString();

    // Encode Data
    const objToEncode = { receipents: receipientsStr, subject: subjectStr, timestamp: timestamp };
    const base64Str = btoa(JSON.stringify(objToEncode)); // decode = JSON.parse(atob(encoded))
    
    // Create img element and add it to compose area
    const imgEl = document.createElement("img");
    imgEl.setAttribute("src", `${apiEndpoint}?data=${base64Str}`);
    imgEl.setAttribute("style", "display: none;width:0;height:0;");
    
    document.querySelector(composeAreaSelector).appendChild(imgEl);
}

function addIcon(iconsBarEl) {
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B56CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-check"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>`;
  
  // Construct Div Container
  const tdEl = document.createElement("td");
  tdEl.setAttribute("data-tooltip", "Send Email With Tracking");
  tdEl.setAttribute("style", "margin-left: 5px")

  // Construct Icon Button Container
  const divEl = document.createElement("div");
  divEl.setAttribute("class", "mailrr-send-container");
  divEl.innerHTML = `<button class="mailrr-send-btn">${iconSvg}</button>`
  divEl.addEventListener("click", sendMailWithTracking);

  // Add div into td
  tdEl.appendChild(divEl);
  
  // Add the icon button into Iconbar after the first child (send button)
  iconsBarEl.children[0].insertAdjacentElement("afterEnd", tdEl);
}

function sendEmail(sendBtnEl) {
  const clickEvent = new MouseEvent("click");
  // Add Tracking Thing
  sendBtnEl.dispatchEvent(clickEvent);
}

waitForElem(iconsBarSelector).then((iconsBarEl) => {
  console.log("IconsBar has loaded!", iconsBarEl);
  addIcon(iconsBarEl);
});

// Selects send button
waitForElem(".T-I.J-J5-Ji.aoO.v7.T-I-atl.L3").then((el) => {
  return;
  console.log("Send Button has been loaded!");
  sendEmail(el);
});
