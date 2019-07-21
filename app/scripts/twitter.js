const POLLING = 1000;
const SCROLL_CHECK_FIRST = 1000;
const SCROLL_CHECK_SECOND = 500;
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
    case "home":
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

let scene;

function setScene(){
  scene = sceneCheck(location.href);
  console.log(`This is ${scene.name} page reload time ${scene.time}`);
}
function time(){
  if(scrollY > 0){
    // scrollYが0以外の時は次のタイミングを待つ
    setTimeout(time, POLLING);
  }else{
    console.log("reload");
    // リロード処理
    let scrolling = () => {
      setTimeout(() => {
        if(scrollY > 0){
          scrollTo(scrollX, 0);
          console.log("scrolling");
          setTimeout(scrolling, SCROLL_CHECK_SECOND);
        }else{
          setTimeout(time, scene.time);
        }
      }, SCROLL_CHECK_SECOND);
    }
    switch(scene.name){
      case SCENES.TIMELINE.name:
        document.querySelector("nav > a[href='/home']").click();
        setTimeout(scrolling, SCROLL_CHECK_FIRST);
        break;
      case SCENES.MENTION.name:
      case SCENES.NOTIFICATION.name:
        document.querySelector("nav > a[href='/notifications']").click();
        setTimeout(scrolling, SCROLL_CHECK_FIRST);
        break;
      case SCENES.HASHTAG.name:
      case SCENES.SEARCH.name:
        scrollTo(scrollX, SCROLL_CHECK_SECOND);
        setTimeout(() => {
          let href = "";
          if(location.search.match("live")){
            href = "click&f=live"
          }else{
            href = "click"
          }
          let elem = document.querySelector(`main nav a[href$='${href}']`);
          if(elem != null) {
            elem.click();
            setTimeout(scrolling, SCROLL_CHECK_FIRST);
          }
        }, SCROLL_CHECK_FIRST);
    }
  }
}

setTimeout(() => {
  setScene();
  setTimeout(time, scene.time);
}, 1000);

window.addEventListener('popstate', () => {
  setScene();
});
