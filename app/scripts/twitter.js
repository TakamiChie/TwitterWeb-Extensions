const POLLING = 1000;
const MILLISECOND = 1000;
const SCENES = {
  TIMELINE: {
    name: "timeline",
    time: 30000,
  },
  MENTION: {
    name: "mention",
    time: 1500,
  },
  NOTIFICATION: {
    name: "notification",
    time: 1500,
  },
  SEARCH: {
    name: "search",
    time: 30000,
  },
  HASHTAG: {
    name: "hashtag",
    time: 20000,
  },
  UNDEF: {
    name: "undefined",
    time: 60000,
  }
}
var sceneVal = SCENES;

/**
 * シーン検出を行う
 * @param {string} url URL
 */
function sceneCheck(url){
  let c = url.split(/[\/?]/);
  switch (c[3]) {
    case undefined:
    case "":
      return sceneVal.TIMELINE
      break;
    case "i":
      if(c[4] == "notifications"){
        return sceneVal.NOTIFICATION;
      }else{
        return sceneVal.UNDEF;
      }
      break;
    case "mentions":
      return sceneVal.MENTION;
      break;
    case "search":
      return sceneVal.SEARCH;
      break;
    case "hashtag":
      return sceneVal.HASHTAG;
      break;
    default:
      return sceneVal.UNDEF;
      break;
  }
}

/**
 * 現在の日付を示すミリ秒単位の値を取得する
 */
function getMS(){ return new Date().getTime(); }
/**
 * シーンごとのリロード残り時間を取得する
 * @param {SCENES} scene シーンを示す値
 */
function getRestReload(scene){
  let at = getMS() - lastReload;
  return scene.time - at;
}
/**
 * ミリ秒を秒に変換する
 * @param {number} ms ミリ秒
 */
function getS(ms){ return Math.trunc(Math.max(0, ms) / MILLISECOND); }

let lastReload = getMS();

/**
 * ページのリロード用タイマーをセットする
 * @param {SCENES} scene シーンを示す値
 */
function setReloadTimer(scene){
  let span = document.createElement("span");
  span.id = "reloadTimer";
  span.textContent = getS(getRestReload(scene));
  document.querySelector(".js-new-tweets-bar").parentNode.appendChild(span);
}

/**
 * AdaptiveFiltersBarの表示をトグルする
 */
function toggleAFB(){
  let afb = document.querySelector(".AdaptiveFiltersBar");
  afb.style.display = afb.style.display == "none" ? "block": "none";
}

/**
 * 毎秒のページチェック処理
 */
function pageCheck(){
  let scene = sceneCheck(location.href);
  if(document.readyState != "interactive"){
    if(document.querySelectorAll(".js-new-tweets-bar").length > 0){
      if(document.getElementById("reloadTimer") == undefined){
        setReloadTimer(scene);
        // なぜかちょっと下にスクロールする問題対応
        if(window.scrollY < 50) {
          window.scroll(0, 0); 
        }
      }
    }else{
      // ツイートバーが消えてるので、RTを消去
      let rt = document.getElementById("reloadTimer");
      if(rt){
        rt.parentNode.removeChild(rt);
      }
    }
  }
  // リロード待ち
  let rest = getRestReload(scene);
  let rt = document.getElementById("reloadTimer");
  if(rt){
    if(rest <= 0 && document.body.scrollTop + window.scrollY == 0){
      // リロードOK
      document.querySelector(".js-new-tweets-bar").click();
      rt.parentNode.removeChild(rt);
      lastReload = getMS();
    }else{
      rt.textContent = getS(rest);
    }
  }
  // AdaptiveFiltersBarを消去可能にする
  if(document.getElementsByClassName("SearchNavigation-canopy").length > 0){
    let snc = document.querySelector(".SearchNavigation-canopy")
    if(!snc.dataset.toggle){
      snc.dataset.toggle = true;
      snc.addEventListener("click", toggleAFB);
    }
  }
  //
  window.setTimeout(pageCheck, POLLING);
}

// 設定読み込み
chrome.storage.sync.get({
  "reload_timeline": SCENES.TIMELINE.time,
  "reload_mention": SCENES.MENTION.time,
  "reload_search": SCENES.SEARCH.time
}, (items) => {
  sceneVal.TIMELINE.time = 
    parseInt(items.reload_timeline);
  sceneVal.MENTION.time = sceneVal.NOTIFICATION.time = 
    parseInt(items.reload_mention);
  sceneVal.SEARCH.time = sceneVal.HASHTAG.time = 
    parseInt(items.reload_search);
});
//
pageCheck();
