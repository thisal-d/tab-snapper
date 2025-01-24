const siteNameEl = document.getElementById("site-name-box") ;
const siteUrlEl = document.getElementById("site-url-box") ;
const ulEl = document.getElementById("site-list") ;
const saveBtnEl = document.getElementById("save-button");
const TabsaveBtnEl = document.getElementById("tab-save-button");
const clearBtnEl = document.getElementById("clear-button");

let saveSiteNames = JSON.parse(localStorage.getItem("site-names")) ;
let saveSiteUrls = JSON.parse(localStorage.getItem("site-urls")) ;
let saveSiteIcons= JSON.parse(localStorage.getItem("site-icons"))
if (saveSiteIcons===null){
    saveSiteNames = [] ;
    saveSiteUrls = [] ;
    saveSiteIcons = [] ;
}

console.log("sites:",saveSiteNames.length)
console.log("urls:",saveSiteUrls.length)
console.log("icons:",saveSiteIcons.length)

let newSiteName = "" ;
let newSiteUrl = "" ;
let newSiteIcon = "" ;
let index = 0 ;

function formatName(name){
    let formatedName = name ;
    if (formatedName.substring(0,4)==="www."){
        formatedName = formatedName.substring(4,formatedName.length);
    }
    return formatedName;
}

function formatUrl(url){
    let formatedUrl = url;
    while (formatedUrl[formatedUrl.length-1] ==="/"){
        formatedUrl = formatedUrl.substring(0,formatedUrl.length-1);
    }
    return formatedUrl;
}

function getFaviconUrl(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();
  if (xhr.status === 200) {
    const html = xhr.responseText;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const faviconElement = doc.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
    if (faviconElement) {
      return faviconElement.getAttribute('href');
    } else {
      return null;
    }
  } else {
    return null;
  }
}

async function saveImageToLocalStorage(url) {
  if (url == null){
    saveSiteIcons.push(null) 
    localStorage.setItem("site-icons", JSON.stringify(saveSiteIcons));
  }
  else{
      try{
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = function() {
            saveSiteIcons.push(reader.result) 
              localStorage.setItem("site-icons", JSON.stringify(saveSiteIcons));
          }
      }
      catch(error){
        saveSiteIcons.push(null) 
          localStorage.setItem("site-icons", JSON.stringify(saveSiteIcons));
      }
      
  }
 
}

saveBtnEl.addEventListener("click",function(){
    newSiteName = siteNameEl.value ;
    newSiteUrl = formatUrl(siteUrlEl.value) ;
    if (newSiteUrl!=""){
        if (newSiteName===""){
            newSiteName = newSiteUrl ;
        }
        saveSiteNames.push(newSiteName) ;
        saveSiteUrls.push(newSiteUrl) ;
        saveImageToLocalStorage(getFaviconUrl(newSiteUrl)) ;
        saveAddedSite()
        renderAddedSites();
    }
});

function saveAddedSite(){
    localStorage.setItem("site-names",JSON.stringify(saveSiteNames));
    localStorage.setItem("site-urls",JSON.stringify(saveSiteUrls)) ;
    siteNameEl.value = "" ;
    siteUrlEl.value = "" ;
}

function renderAddedSites(){
    let listItem = ""
    console.log(saveSiteIcons.length)
    for(i=index ;i<saveSiteNames.length ;i++){ 
      if (saveSiteIcons[i]==null){
        listItem += `
                  <tr class="out">
                    <td>
                    </td>`        
      }
      else{
        listItem += `
                  <tr class="out">
                    <td>
                        <img src="${saveSiteIcons[i]}" class="site-ico">
                    </td>`
      }
       

        listItem += `
                <td>
                    <label class="site-names">${saveSiteNames[i]}</li>
                </td> 
                <td>
                    <label class="site-url">
                        :
                    </label>
                </td> 
                <td>
                    <label class="site-url">
                        <a href="${saveSiteUrls[i]}" target="_blank" class="site-url">
                            ${saveSiteUrls[i]}
                        </a>
                    </label>
                </td> 
                <td>
                    <button id="delete-button${i}" value="${i}" class="delete-button">
                        <img class="delete-button-image">
                    </button>
                </td>
            </tr>
            `
        index ++ ;
    }
    ulEl.innerHTML += listItem ;

    //create function to remove elment in list
    for(let i=0 ;i<saveSiteNames.length ;i++){
        let buttonId = "delete-button"+i ;
        let button = document.getElementById(buttonId)  ;
        button.addEventListener("click",function() {
            let saveSiteNamesTemp = saveSiteNames ;
            let saveSiteUrlsTemp = saveSiteUrls ; 
            let saveSiteIconsTemp = saveSiteIcons ;
            saveSiteNames = [];
            saveSiteUrls = [];
            saveSiteIcons = [];
            for (let i=0 ;i<saveSiteNamesTemp.length ;i++){
                if(i!=button.value){
                    saveSiteNames.push(saveSiteNamesTemp[i])
                    saveSiteUrls.push(saveSiteUrlsTemp[i])
                    saveSiteIcons.push(saveSiteIconsTemp[i])
                }
            }
            ulEl.innerHTML = "" ; 
            index=0;
            renderAddedSites() ;
            saveAddedSite() ;
        })
    }
}

TabsaveBtnEl.addEventListener("click",function(){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let activeTabUrl = tabs[0].url ;
        newSiteUrl = formatUrl(activeTabUrl);
        saveSiteUrls.push(newSiteUrl) ;
        newSiteName = formatName(newSiteUrl.split("/")[2]) ;
        saveSiteNames.push(newSiteName) ;
        saveImageToLocalStorage(getFaviconUrl(newSiteUrl)) ;
        saveAddedSite();
        renderAddedSites();
    });
});

clearBtnEl.addEventListener("click",function(){
    localStorage.clear() ;
    index = 0;
    saveSiteUrls = [] ;
    saveSiteNames = [] ;
    saveSiteIcons = [] ;
    saveAddedSite();
    ulEl.innerHTML = "";
})

renderAddedSites();