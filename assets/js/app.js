!function(t){var e={};function n(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(r,i,function(e){return t[e]}.bind(null,i));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";window.dd=console.log.bind(console),window.scrollToTop=function(){$("html, body").scrollTop(0)},$(function(){$(".hdr-toggle").click(function(){$("#wrap").toggleClass("wrap-side")}),$(".side-close").click(function(){$("#wrap").removeClass("wrap-side")}),$("a:not([title])").each(function(){$(this).attr("title",this.innerText)}),$(".ctn-category").each(function(){var t=$(this),e=t.find("small").detach();this.innerHTML='<span class="ctn-category-text"><span>'+this.innerText.split("/").join("</span>/<span>")+"</span></span>",t.append(e),t.css("font-size",t.css("letter-spacing"))}),$(".item").each(function(){var t=$(this),e=t.find(".item-thumbnail"),n=t.find(".item-title a").attr("href");$.ajax({url:n,type:"get",dataType:"html",async:!1,crossDomain:"true",error:function(){e.css("background-image","linear-gradient(#000, #000)")},xhr:function(){var t=new window.XMLHttpRequest;return t.addEventListener("progress",function(t){if(t.lengthComputable){var n=t.loaded/t.total;e.css("background-image","linear-gradient(#000, #000 "+n+"%, #FFF "+(n+.1)+"%, #FFF)")}},!1),t},success:function(t){var n=$(t).find(".article-ctn img").first().attr("src");n&&e.css("background-image","url("+n+")"),dd(e.css("background-image"))}})})})}]);
//# sourceMappingURL=app.js.map