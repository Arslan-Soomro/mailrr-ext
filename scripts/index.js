// Console.log doesn't work here, you can do alert though
/* ---- STORAGE UTILITIES ---- */
function setLocally(obj, callback) {
    return chrome.storage.sync.set(obj, callback || (() => null));
  }
  
  function getLocally(keys, callback) {
    return chrome.storage.sync.get(keys, callback || (() => null));
  }