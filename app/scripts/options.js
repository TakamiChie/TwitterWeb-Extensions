// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

function rangeChanged(e){
  saveOption(e.target);
}

function rangeInputed(e){
  updateLabel(e.target);
}

function updateLabel(obj){
  document.getElementById(obj.id + "_number").textContent = 
    obj.value / 1000;
}

function saveOption(obj){
  let data = {};
  data["reload_" + obj.id] = obj.value;
  chrome.storage.sync.set(data, () => {
  });
}

function init(){
  let tl = document.getElementById("timeline");
  let mention = document.getElementById("mention");
  let search = document.getElementById("search");
  let a = [tl, mention, search];
  a.forEach((value) => {
    value.addEventListener("input", rangeInputed);
    value.addEventListener("change", rangeChanged);
    updateLabel(value);
  });

  // 設定読み込み
  chrome.storage.sync.get({
    "reload_timeline": 30000,
    "reload_mention": 1000,
    "reload_search": 20000
  }, (items) => {
    tl.value = items.reload_timeline;
    mention.value = items.reload_mention;
    search.value = items.reload_search;
    updateLabel(tl);
    updateLabel(mention);
    updateLabel(search);
  });
}
document.addEventListener('DOMContentLoaded', init);