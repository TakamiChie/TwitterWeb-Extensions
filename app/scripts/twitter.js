const STARTWAIT = 5000;
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

/**
 * シーン検出を行う
 * @param {string} url URL
 */
function sceneCheck(url){
  let c = url.split(/[\/?]/);
  console.log(c);
  switch (c[3]) {
    case undefined:
    case "":
      return SCENES.TIMELINE
      break;
    case "i":
      if(c[4] == "notifications"){
        return SCENES.NOTIFICATION;
      }else{
        return SCENES.UNDEF;
      }
      break;
    case "mentions":
      return SCENES.MENTION;
      break;
    case "search":
      return SCENES.SEARCH;
      break;
    case "hashtag":
      return SCENES.HASHTAG;
      break;
    default:
      return SCENES.UNDEF;
      break;
  }
}

function refresh(){
  let scene = sceneCheck(location.href);
  console.log(`This Scene is ${scene.name}`);
  console.log(`Wait Time of ${scene.time}`);
  if(document.readyState != "interactive"){
    if(document.body.scrollTop + window.scrollY == 0){
      if(document.querySelectorAll(".js-new-tweets-bar").length > 0){
        document.querySelector(".js-new-tweets-bar").click();
      }
    }
  }
  window.setTimeout(refresh, scene.time);
}

window.setTimeout(refresh, STARTWAIT);


