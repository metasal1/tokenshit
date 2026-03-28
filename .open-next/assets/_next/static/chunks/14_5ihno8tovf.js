(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,22315,(e,t,r)=>{e.e,t.exports=function(){"use strict";var e="millisecond",t="second",r="minute",i="hour",a="week",n="month",s="quarter",o="year",l="date",c="Invalid Date",u=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,d=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,p=function(e,t,r){var i=String(e);return!i||i.length>=t?e:""+Array(t+1-i.length).join(r)+e},h="en",m={};m[h]={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],r=e%100;return"["+e+(t[(r-20)%10]||t[r]||t[0])+"]"}};var f="$isDayjsObject",g=function(e){return e instanceof v||!(!e||!e[f])},y=function e(t,r,i){var a;if(!t)return h;if("string"==typeof t){var n=t.toLowerCase();m[n]&&(a=n),r&&(m[n]=r,a=n);var s=t.split("-");if(!a&&s.length>1)return e(s[0])}else{var o=t.name;m[o]=t,a=o}return!i&&a&&(h=a),a||!i&&h},w=function(e,t){if(g(e))return e.clone();var r="object"==typeof t?t:{};return r.date=e,r.args=arguments,new v(r)},b={s:p,z:function(e){var t=-e.utcOffset(),r=Math.abs(t);return(t<=0?"+":"-")+p(Math.floor(r/60),2,"0")+":"+p(r%60,2,"0")},m:function e(t,r){if(t.date()<r.date())return-e(r,t);var i=12*(r.year()-t.year())+(r.month()-t.month()),a=t.clone().add(i,n),s=r-a<0,o=t.clone().add(i+(s?-1:1),n);return+(-(i+(r-a)/(s?a-o:o-a))||0)},a:function(e){return e<0?Math.ceil(e)||0:Math.floor(e)},p:function(c){return({M:n,y:o,w:a,d:"day",D:l,h:i,m:r,s:t,ms:e,Q:s})[c]||String(c||"").toLowerCase().replace(/s$/,"")},u:function(e){return void 0===e}};b.l=y,b.i=g,b.w=function(e,t){return w(e,{locale:t.$L,utc:t.$u,x:t.$x,$offset:t.$offset})};var v=function(){function p(e){this.$L=y(e.locale,null,!0),this.parse(e),this.$x=this.$x||e.x||{},this[f]=!0}var h=p.prototype;return h.parse=function(e){this.$d=function(e){var t=e.date,r=e.utc;if(null===t)return new Date(NaN);if(b.u(t))return new Date;if(t instanceof Date)return new Date(t);if("string"==typeof t&&!/Z$/i.test(t)){var i=t.match(u);if(i){var a=i[2]-1||0,n=(i[7]||"0").substring(0,3);return r?new Date(Date.UTC(i[1],a,i[3]||1,i[4]||0,i[5]||0,i[6]||0,n)):new Date(i[1],a,i[3]||1,i[4]||0,i[5]||0,i[6]||0,n)}}return new Date(t)}(e),this.init()},h.init=function(){var e=this.$d;this.$y=e.getFullYear(),this.$M=e.getMonth(),this.$D=e.getDate(),this.$W=e.getDay(),this.$H=e.getHours(),this.$m=e.getMinutes(),this.$s=e.getSeconds(),this.$ms=e.getMilliseconds()},h.$utils=function(){return b},h.isValid=function(){return this.$d.toString()!==c},h.isSame=function(e,t){var r=w(e);return this.startOf(t)<=r&&r<=this.endOf(t)},h.isAfter=function(e,t){return w(e)<this.startOf(t)},h.isBefore=function(e,t){return this.endOf(t)<w(e)},h.$g=function(e,t,r){return b.u(e)?this[t]:this.set(r,e)},h.unix=function(){return Math.floor(this.valueOf()/1e3)},h.valueOf=function(){return this.$d.getTime()},h.startOf=function(e,s){var c=this,u=!!b.u(s)||s,d=b.p(e),p=function(e,t){var r=b.w(c.$u?Date.UTC(c.$y,t,e):new Date(c.$y,t,e),c);return u?r:r.endOf("day")},h=function(e,t){return b.w(c.toDate()[e].apply(c.toDate("s"),(u?[0,0,0,0]:[23,59,59,999]).slice(t)),c)},m=this.$W,f=this.$M,g=this.$D,y="set"+(this.$u?"UTC":"");switch(d){case o:return u?p(1,0):p(31,11);case n:return u?p(1,f):p(0,f+1);case a:var w=this.$locale().weekStart||0,v=(m<w?m+7:m)-w;return p(u?g-v:g+(6-v),f);case"day":case l:return h(y+"Hours",0);case i:return h(y+"Minutes",1);case r:return h(y+"Seconds",2);case t:return h(y+"Milliseconds",3);default:return this.clone()}},h.endOf=function(e){return this.startOf(e,!1)},h.$set=function(a,s){var c,u=b.p(a),d="set"+(this.$u?"UTC":""),p=((c={}).day=d+"Date",c[l]=d+"Date",c[n]=d+"Month",c[o]=d+"FullYear",c[i]=d+"Hours",c[r]=d+"Minutes",c[t]=d+"Seconds",c[e]=d+"Milliseconds",c)[u],h="day"===u?this.$D+(s-this.$W):s;if(u===n||u===o){var m=this.clone().set(l,1);m.$d[p](h),m.init(),this.$d=m.set(l,Math.min(this.$D,m.daysInMonth())).$d}else p&&this.$d[p](h);return this.init(),this},h.set=function(e,t){return this.clone().$set(e,t)},h.get=function(e){return this[b.p(e)]()},h.add=function(e,s){var l,c=this;e=Number(e);var u=b.p(s),d=function(t){var r=w(c);return b.w(r.date(r.date()+Math.round(t*e)),c)};if(u===n)return this.set(n,this.$M+e);if(u===o)return this.set(o,this.$y+e);if("day"===u)return d(1);if(u===a)return d(7);var p=((l={})[r]=6e4,l[i]=36e5,l[t]=1e3,l)[u]||1,h=this.$d.getTime()+e*p;return b.w(h,this)},h.subtract=function(e,t){return this.add(-1*e,t)},h.format=function(e){var t=this,r=this.$locale();if(!this.isValid())return r.invalidDate||c;var i=e||"YYYY-MM-DDTHH:mm:ssZ",a=b.z(this),n=this.$H,s=this.$m,o=this.$M,l=r.weekdays,u=r.months,p=r.meridiem,h=function(e,r,a,n){return e&&(e[r]||e(t,i))||a[r].slice(0,n)},m=function(e){return b.s(n%12||12,e,"0")},f=p||function(e,t,r){var i=e<12?"AM":"PM";return r?i.toLowerCase():i};return i.replace(d,function(e,i){return i||function(e){switch(e){case"YY":return String(t.$y).slice(-2);case"YYYY":return b.s(t.$y,4,"0");case"M":return o+1;case"MM":return b.s(o+1,2,"0");case"MMM":return h(r.monthsShort,o,u,3);case"MMMM":return h(u,o);case"D":return t.$D;case"DD":return b.s(t.$D,2,"0");case"d":return String(t.$W);case"dd":return h(r.weekdaysMin,t.$W,l,2);case"ddd":return h(r.weekdaysShort,t.$W,l,3);case"dddd":return l[t.$W];case"H":return String(n);case"HH":return b.s(n,2,"0");case"h":return m(1);case"hh":return m(2);case"a":return f(n,s,!0);case"A":return f(n,s,!1);case"m":return String(s);case"mm":return b.s(s,2,"0");case"s":return String(t.$s);case"ss":return b.s(t.$s,2,"0");case"SSS":return b.s(t.$ms,3,"0");case"Z":return a}return null}(e)||a.replace(":","")})},h.utcOffset=function(){return-(15*Math.round(this.$d.getTimezoneOffset()/15))},h.diff=function(e,l,c){var u,d=this,p=b.p(l),h=w(e),m=(h.utcOffset()-this.utcOffset())*6e4,f=this-h,g=function(){return b.m(d,h)};switch(p){case o:u=g()/12;break;case n:u=g();break;case s:u=g()/3;break;case a:u=(f-m)/6048e5;break;case"day":u=(f-m)/864e5;break;case i:u=f/36e5;break;case r:u=f/6e4;break;case t:u=f/1e3;break;default:u=f}return c?u:b.a(u)},h.daysInMonth=function(){return this.endOf(n).$D},h.$locale=function(){return m[this.$L]},h.locale=function(e,t){if(!e)return this.$L;var r=this.clone(),i=y(e,t,!0);return i&&(r.$L=i),r},h.clone=function(){return b.w(this.$d,this)},h.toDate=function(){return new Date(this.valueOf())},h.toJSON=function(){return this.isValid()?this.toISOString():null},h.toISOString=function(){return this.$d.toISOString()},h.toString=function(){return this.$d.toUTCString()},p}(),x=v.prototype;return w.prototype=x,[["$ms",e],["$s",t],["$m",r],["$H",i],["$W","day"],["$M",n],["$y",o],["$D",l]].forEach(function(e){x[e[1]]=function(t){return this.$g(t,e[0],e[1])}}),w.extend=function(e,t){return e.$i||(e(t,v,w),e.$i=!0),w},w.locale=y,w.isDayjs=g,w.unix=function(e){return w(1e3*e)},w.en=m[h],w.Ls=m,w.p={},w}()},96931,(e,t,r)=>{e.e,t.exports={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],r=e%100;return"["+e+(t[(r-20)%10]||t[r]||t[0])+"]"}}},72856,(e,t,r)=>{e.e,t.exports=function(e,t,r){e=e||{};var i=t.prototype,a={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function n(e,t,r,a){return i.fromToBase(e,t,r,a)}r.en.relativeTime=a,i.fromToBase=function(t,i,n,s,o){for(var l,c,u,d=n.$locale().relativeTime||a,p=e.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],h=p.length,m=0;m<h;m+=1){var f=p[m];f.d&&(l=s?r(t).diff(n,f.d,!0):n.diff(t,f.d,!0));var g=(e.rounding||Math.round)(Math.abs(l));if(u=l>0,g<=f.r||!f.r){g<=1&&m>0&&(f=p[m-1]);var y=d[f.l];o&&(g=o(""+g)),c="string"==typeof y?y.replace("%d",g):y(g,i,f.l,u);break}}if(i)return c;var w=u?d.future:d.past;return"function"==typeof w?w(c):w.replace("%s",c)},i.to=function(e,t){return n(e,t,this,!0)},i.from=function(e,t){return n(e,t,this)};var s=function(e){return e.$u?r.utc():r()};i.toNow=function(e){return this.to(s(this),e)},i.fromNow=function(e){return this.from(s(this),e)}}},83840,(e,t,r)=>{e.e,t.exports=function(e,t,r){r.updateLocale=function(e,t){var i=r.Ls[e];if(i)return(t?Object.keys(t):[]).forEach(function(e){i[e]=t[e]}),i}}},89676,e=>{"use strict";e.i(12207);var t,r,i=e.i(8285),a=e.i(54479);e.i(74576);var n=e.i(20119),s=e.i(56350),o=e.i(22315),l=e.i(96931),c=e.i(72856),u=e.i(83840);o.default.extend(c.default),o.default.extend(u.default);let d={...l.default,name:"en-web3-modal",relativeTime:{future:"in %s",past:"%s ago",s:"%d sec",m:"1 min",mm:"%d min",h:"1 hr",hh:"%d hrs",d:"1 d",dd:"%d d",M:"1 mo",MM:"%d mo",y:"1 yr",yy:"%d yr"}},p=["January","February","March","April","May","June","July","August","September","October","November","December"];o.default.locale("en-web3-modal",d);var h=e.i(60398),m=e.i(27302),f=e.i(53157),g=e.i(82283),y=e.i(21728),w=e.i(26618),b=e.i(64126);e.i(4041);var v=e.i(12699);let x=["receive","deposit","borrow","claim"],$=["withdraw","repay","burn"],k={getTransactionGroupTitle(e,t){let r=((e=new Date().toISOString())=>(0,o.default)(e).year())(),i=p[t];return e===r?i:`${i} ${e}`},getTransactionImages(e){let[t]=e;return e?.length>1?e.map(e=>this.getTransactionImage(e)):[this.getTransactionImage(t)]},getTransactionImage:e=>({type:k.getTransactionTransferTokenType(e),url:k.getTransactionImageURL(e)}),getTransactionImageURL(e){let t,r=!!e?.nft_info,i=!!e?.fungible_info;return e&&r?t=e?.nft_info?.content?.preview?.url:e&&i&&(t=e?.fungible_info?.icon?.url),t},getTransactionTransferTokenType:e=>e?.fungible_info?"FUNGIBLE":e?.nft_info?"NFT":void 0,getTransactionDescriptions(e,t){let r=e?.metadata?.operationType,i=t||e?.transfers,a=i&&i.length>0,n=i&&i.length>1,s=a&&i.every(e=>!!e?.fungible_info),[o,l]=i||[],c=this.getTransferDescription(o),u=this.getTransferDescription(l);if(!a)return("send"===r||"receive"===r)&&s?[c=v.UiHelperUtil.getTruncateString({string:e?.metadata.sentFrom,charsStart:4,charsEnd:6,truncate:"middle"}),v.UiHelperUtil.getTruncateString({string:e?.metadata.sentTo,charsStart:4,charsEnd:6,truncate:"middle"})]:[e.metadata.status];if(n)return i?.map(e=>this.getTransferDescription(e));let d="";return x.includes(r)?d="+":$.includes(r)&&(d="-"),[c=d.concat(c)]},getTransferDescription(e){let t="";return e&&(e?.nft_info?t=e?.nft_info?.name||"-":e?.fungible_info&&(t=this.getFungibleTransferDescription(e)||"-")),t},getFungibleTransferDescription(e){return e?[this.getQuantityFixedValue(e?.quantity.numeric),e?.fungible_info?.symbol].join(" ").trim():null},mergeTransfers(e){if(e?.length<=1)return e;let t=this.filterGasFeeTransfers(e).reduce((e,t)=>{let r=t?.fungible_info?.name,i=e.find(({fungible_info:e,direction:i})=>r&&r===e?.name&&i===t.direction);if(i){let e=Number(i.quantity.numeric)+Number(t.quantity.numeric);i.quantity.numeric=e.toString(),i.value=(i.value||0)+(t.value||0)}else e.push(t);return e},[]),r=t;return t.length>2&&(r=t.sort((e,t)=>(t.value||0)-(e.value||0)).slice(0,2)),r=r.sort((e,t)=>"out"===e.direction&&"in"===t.direction?-1:+("in"===e.direction&&"out"===t.direction))},filterGasFeeTransfers(e){let t=e?.reduce((e,t)=>{let r=t?.fungible_info?.name;return r&&(e[r]||(e[r]=[]),e[r].push(t)),e},{}),r=[];return Object.values(t??{}).forEach(e=>{if(1===e.length){let t=e[0];t&&r.push(t)}else{let t=e.filter(e=>"in"===e.direction),i=e.filter(e=>"out"===e.direction);if(1===t.length&&1===i.length){let a=t[0],n=i[0],s=!1;if(a&&n){let e=Number(a.quantity.numeric),t=Number(n.quantity.numeric);t<.1*e?(r.push(a),s=!0):e<.1*t&&(r.push(n),s=!0)}s||r.push(...e)}else{let t=this.filterGasFeesFromTokenGroup(e);r.push(...t)}}}),e?.forEach(e=>{e?.fungible_info?.name||r.push(e)}),r},filterGasFeesFromTokenGroup(e){if(e.length<=1)return e;let t=e?.map(e=>Number(e.quantity.numeric)),r=Math.max(...t);if(Math.min(...t)<.01*r)return e?.filter(e=>Number(e.quantity.numeric)>=.01*r);let i=e?.filter(e=>"in"===e.direction),a=e?.filter(e=>"out"===e.direction);if(1===i.length&&1===a.length){let e=i[0],t=a[0];if(e&&t){let r=Number(e.quantity.numeric),i=Number(t.quantity.numeric);if(i<.1*r)return[e];if(r<.1*i)return[t]}}return e},getQuantityFixedValue:e=>e?parseFloat(e).toFixed(3):null};var T=e.i(45975);e.i(62238),e.i(46650),e.i(10380),e.i(49536);var S=i;e.i(34051);var C=e.i(29389);e.i(39009);var D=e.i(59088);(t=r||(r={})).approve="approved",t.bought="bought",t.borrow="borrowed",t.burn="burnt",t.cancel="canceled",t.claim="claimed",t.deploy="deployed",t.deposit="deposited",t.execute="executed",t.mint="minted",t.receive="received",t.repay="repaid",t.send="sent",t.sell="sold",t.stake="staked",t.trade="swapped",t.unstake="unstaked",t.withdraw="withdrawn";var A=i;e.i(52634),e.i(64380),e.i(12190);var E=e.i(62611);let I=E.css`
  :host > wui-flex {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 40px;
    height: 40px;
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-no-images='true']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[3]} !important;
  }

  :host > wui-flex wui-image {
    display: block;
  }

  :host > wui-flex,
  :host > wui-flex wui-image,
  .swap-images-container,
  .swap-images-container.nft,
  wui-image.nft {
    border-top-left-radius: var(--local-left-border-radius);
    border-top-right-radius: var(--local-right-border-radius);
    border-bottom-left-radius: var(--local-left-border-radius);
    border-bottom-right-radius: var(--local-right-border-radius);
  }

  .swap-images-container {
    position: relative;
    width: 40px;
    height: 40px;
    overflow: hidden;
  }

  .swap-images-container wui-image:first-child {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 0;
    left: 0%;
    clip-path: inset(0px calc(50% + 2px) 0px 0%);
  }

  .swap-images-container wui-image:last-child {
    clip-path: inset(0px 0px 0px calc(50% + 2px));
  }

  .swap-fallback-container {
    position: absolute;
    inset: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .swap-fallback-container.first {
    clip-path: inset(0px calc(50% + 2px) 0px 0%);
  }

  .swap-fallback-container.last {
    clip-path: inset(0px 0px 0px calc(50% + 2px));
  }

  wui-flex.status-box {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(20%, 20%);
    border-radius: ${({borderRadius:e})=>e[4]};
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.theme.backgroundPrimary};
    overflow: hidden;
    width: 16px;
    height: 16px;
  }
`;var P=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let U=class extends A.LitElement{constructor(){super(...arguments),this.images=[],this.secondImage={type:void 0,url:""},this.failedImageUrls=new Set}handleImageError(e){return t=>{t.stopPropagation(),this.failedImageUrls.add(e),this.requestUpdate()}}render(){let[e,t]=this.images;this.images.length||(this.dataset.noImages="true");let r=e?.type==="NFT",i=t?.url?"NFT"===t.type:r;return this.style.cssText=`
    --local-left-border-radius: ${r?"var(--apkt-borderRadius-3)":"var(--apkt-borderRadius-5)"};
    --local-right-border-radius: ${i?"var(--apkt-borderRadius-3)":"var(--apkt-borderRadius-5)"};
    `,a.html`<wui-flex> ${this.templateVisual()} ${this.templateIcon()} </wui-flex>`}templateVisual(){let[e,t]=this.images;return 2===this.images.length&&(e?.url||t?.url)?this.renderSwapImages(e,t):e?.url&&!this.failedImageUrls.has(e.url)?this.renderSingleImage(e):e?.type==="NFT"?this.renderPlaceholderIcon("nftPlaceholder"):this.renderPlaceholderIcon("coinPlaceholder")}renderSwapImages(e,t){return a.html`<div class="swap-images-container">
      ${e?.url?this.renderImageOrFallback(e,"first",!0):null}
      ${t?.url?this.renderImageOrFallback(t,"last",!0):null}
    </div>`}renderSingleImage(e){return this.renderImageOrFallback(e,void 0,!1)}renderImageOrFallback(e,t,r=!1){return e.url?this.failedImageUrls.has(e.url)?r&&t?this.renderFallbackIconInContainer(t):this.renderFallbackIcon():a.html`<wui-image
      src=${e.url}
      alt="Transaction image"
      @onLoadError=${this.handleImageError(e.url)}
    ></wui-image>`:null}renderFallbackIconInContainer(e){return a.html`<div class="swap-fallback-container ${e}">${this.renderFallbackIcon()}</div>`}renderFallbackIcon(){return a.html`<wui-icon
      size="xl"
      weight="regular"
      color="default"
      name="networkPlaceholder"
    ></wui-icon>`}renderPlaceholderIcon(e){return a.html`<wui-icon size="xl" weight="regular" color="default" name=${e}></wui-icon>`}templateIcon(){let e,t="accent-primary";return(e=this.getIcon(),this.status&&(t=this.getStatusColor()),e)?a.html`
      <wui-flex alignItems="center" justifyContent="center" class="status-box">
        <wui-icon-box size="sm" color=${t} icon=${e}></wui-icon-box>
      </wui-flex>
    `:null}getDirectionIcon(){switch(this.direction){case"in":return"arrowBottom";case"out":return"arrowTop";default:return}}getIcon(){return this.onlyDirectionIcon?this.getDirectionIcon():"trade"===this.type?"swapHorizontal":"approve"===this.type?"checkmark":"cancel"===this.type?"close":this.getDirectionIcon()}getStatusColor(){switch(this.status){case"confirmed":return"success";case"failed":return"error";case"pending":return"inverse";default:return"accent-primary"}}};U.styles=[I],P([(0,n.property)()],U.prototype,"type",void 0),P([(0,n.property)()],U.prototype,"status",void 0),P([(0,n.property)()],U.prototype,"direction",void 0),P([(0,n.property)({type:Boolean})],U.prototype,"onlyDirectionIcon",void 0),P([(0,n.property)({type:Array})],U.prototype,"images",void 0),P([(0,n.property)({type:Object})],U.prototype,"secondImage",void 0),P([(0,s.state)()],U.prototype,"failedImageUrls",void 0),U=P([(0,T.customElement)("wui-transaction-visual")],U);let _=E.css`
  :host {
    width: 100%;
  }

  :host > wui-flex:first-child {
    align-items: center;
    column-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    width: 100%;
  }

  :host > wui-flex:first-child wui-text:nth-child(1) {
    text-transform: capitalize;
  }

  wui-transaction-visual {
    width: 40px;
    height: 40px;
  }

  wui-flex {
    flex: 1;
  }

  :host wui-flex wui-flex {
    overflow: hidden;
  }

  :host .description-container wui-text span {
    word-break: break-all;
  }

  :host .description-container wui-text {
    overflow: hidden;
  }

  :host .description-separator-icon {
    margin: 0px 6px;
  }

  :host wui-text > span {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
`;var O=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let N=class extends S.LitElement{constructor(){super(...arguments),this.type="approve",this.onlyDirectionIcon=!1,this.images=[]}render(){return a.html`
      <wui-flex>
        <wui-transaction-visual
          .status=${this.status}
          direction=${(0,C.ifDefined)(this.direction)}
          type=${this.type}
          .onlyDirectionIcon=${this.onlyDirectionIcon}
          .images=${this.images}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="lg-medium" color="primary">
            ${r[this.type]||this.type}
          </wui-text>
          <wui-flex class="description-container">
            ${this.templateDescription()} ${this.templateSecondDescription()}
          </wui-flex>
        </wui-flex>
        <wui-text variant="sm-medium" color="secondary"><span>${this.date}</span></wui-text>
      </wui-flex>
    `}templateDescription(){let e=this.descriptions?.[0];return e?a.html`
          <wui-text variant="md-regular" color="secondary">
            <span>${e}</span>
          </wui-text>
        `:null}templateSecondDescription(){let e=this.descriptions?.[1];return e?a.html`
          <wui-icon class="description-separator-icon" size="sm" name="arrowRight"></wui-icon>
          <wui-text variant="md-regular" color="secondary">
            <span>${e}</span>
          </wui-text>
        `:null}};N.styles=[D.resetStyles,_],O([(0,n.property)()],N.prototype,"type",void 0),O([(0,n.property)({type:Array})],N.prototype,"descriptions",void 0),O([(0,n.property)()],N.prototype,"date",void 0),O([(0,n.property)({type:Boolean})],N.prototype,"onlyDirectionIcon",void 0),O([(0,n.property)()],N.prototype,"status",void 0),O([(0,n.property)()],N.prototype,"direction",void 0),O([(0,n.property)({type:Array})],N.prototype,"images",void 0),N=O([(0,T.customElement)("wui-transaction-list-item")],N);var M=i;e.i(64576),e.i(73944);var R=i;let z=E.css`
  wui-flex {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e[128]};
  }

  .fallback-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
    border-radius: ${({borderRadius:e})=>e[3]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .direction-icon,
  .status-image {
    position: absolute;
    right: 0;
    bottom: 0;
    border-radius: ${({borderRadius:e})=>e[128]};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .direction-icon {
    padding: ${({spacing:e})=>e["01"]};
    color: ${({tokens:e})=>e.core.iconSuccess};

    background-color: color-mix(
      in srgb,
      ${({tokens:e})=>e.core.textSuccess} 30%,
      ${({tokens:e})=>e.theme.backgroundPrimary} 70%
    );
  }

  /* -- Sizes --------------------------------------------------- */
  :host([data-size='sm']) > wui-image:not(.status-image),
  :host([data-size='sm']) > wui-flex {
    width: 24px;
    height: 24px;
  }

  :host([data-size='lg']) > wui-image:not(.status-image),
  :host([data-size='lg']) > wui-flex {
    width: 40px;
    height: 40px;
  }

  :host([data-size='sm']) .fallback-icon {
    height: 16px;
    width: 16px;
    padding: ${({spacing:e})=>e[1]};
  }

  :host([data-size='lg']) .fallback-icon {
    height: 32px;
    width: 32px;
    padding: ${({spacing:e})=>e[1]};
  }

  :host([data-size='sm']) .direction-icon,
  :host([data-size='sm']) .status-image {
    transform: translate(40%, 30%);
  }

  :host([data-size='lg']) .direction-icon,
  :host([data-size='lg']) .status-image {
    transform: translate(40%, 10%);
  }

  :host([data-size='sm']) .status-image {
    height: 14px;
    width: 14px;
  }

  :host([data-size='lg']) .status-image {
    height: 20px;
    width: 20px;
  }

  /* -- Crop effects --------------------------------------------------- */
  .swap-crop-left-image,
  .swap-crop-right-image {
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .swap-crop-left-image {
    left: 0;
    clip-path: inset(0px calc(50% + 1.5px) 0px 0%);
  }

  .swap-crop-right-image {
    right: 0;
    clip-path: inset(0px 0px 0px calc(50% + 1.5px));
  }
`;var j=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let F={sm:"xxs",lg:"md"},L=class extends R.LitElement{constructor(){super(...arguments),this.type="approve",this.size="lg",this.statusImageUrl="",this.images=[]}render(){return a.html`<wui-flex>${this.templateVisual()} ${this.templateIcon()}</wui-flex>`}templateVisual(){switch(this.dataset.size=this.size,this.type){case"trade":return this.swapTemplate();case"fiat":return this.fiatTemplate();case"unknown":return this.unknownTemplate();default:return this.tokenTemplate()}}swapTemplate(){let[e,t]=this.images;return 2===this.images.length&&(e||t)?a.html`
        <wui-image class="swap-crop-left-image" src=${e} alt="Swap image"></wui-image>
        <wui-image class="swap-crop-right-image" src=${t} alt="Swap image"></wui-image>
      `:e?a.html`<wui-image src=${e} alt="Swap image"></wui-image>`:null}fiatTemplate(){return a.html`<wui-icon
      class="fallback-icon"
      size=${F[this.size]}
      name="dollar"
    ></wui-icon>`}unknownTemplate(){return a.html`<wui-icon
      class="fallback-icon"
      size=${F[this.size]}
      name="questionMark"
    ></wui-icon>`}tokenTemplate(){let[e]=this.images;return e?a.html`<wui-image src=${e} alt="Token image"></wui-image> `:a.html`<wui-icon
      class="fallback-icon"
      name=${"nft"===this.type?"image":"coinPlaceholder"}
    ></wui-icon>`}templateIcon(){return this.statusImageUrl?a.html`<wui-image
        class="status-image"
        src=${this.statusImageUrl}
        alt="Status image"
      ></wui-image>`:a.html`<wui-icon
      class="direction-icon"
      size=${F[this.size]}
      name=${this.getTemplateIcon()}
    ></wui-icon>`}getTemplateIcon(){return"trade"===this.type?"arrowClockWise":"arrowBottom"}};L.styles=[z],j([(0,n.property)()],L.prototype,"type",void 0),j([(0,n.property)()],L.prototype,"size",void 0),j([(0,n.property)()],L.prototype,"statusImageUrl",void 0),j([(0,n.property)({type:Array})],L.prototype,"images",void 0),L=j([(0,T.customElement)("wui-transaction-thumbnail")],L);let H=E.css`
  :host > wui-flex:first-child {
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
  }

  wui-flex {
    display: flex;
    flex: 1;
  }
`,Y=class extends M.LitElement{render(){return a.html`
      <wui-flex alignItems="center" .padding=${["1","2","1","2"]}>
        <wui-shimmer width="40px" height="40px" rounded></wui-shimmer>
        <wui-flex flexDirection="column" gap="1">
          <wui-shimmer width="124px" height="16px" rounded></wui-shimmer>
          <wui-shimmer width="60px" height="14px" rounded></wui-shimmer>
        </wui-flex>
        <wui-shimmer width="24px" height="12px" rounded></wui-shimmer>
      </wui-flex>
    `}};Y.styles=[D.resetStyles,H],Y=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s}([(0,T.customElement)("wui-transaction-list-item-loader")],Y);var B=e.i(79484);let G=E.css`
  :host {
    min-height: 100%;
  }

  .group-container[last-group='true'] {
    padding-bottom: ${({spacing:e})=>e["3"]};
  }

  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e["3"]};
  }

  .contentContainer > .textContent {
    width: 65%;
  }

  .emptyContainer {
    height: 100%;
  }
`;var W=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let q="last-transaction",K=class extends i.LitElement{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.page="activity",this.caipAddress=h.ChainController.state.activeCaipAddress,this.transactionsByYear=w.TransactionsController.state.transactionsByYear,this.loading=w.TransactionsController.state.loading,this.empty=w.TransactionsController.state.empty,this.next=w.TransactionsController.state.next,w.TransactionsController.clearCursor(),this.unsubscribe.push(h.ChainController.subscribeKey("activeCaipAddress",e=>{e&&this.caipAddress!==e&&(w.TransactionsController.resetTransactions(),w.TransactionsController.fetchTransactions(e)),this.caipAddress=e}),h.ChainController.subscribeKey("activeCaipNetwork",()=>{this.updateTransactionView()}),w.TransactionsController.subscribe(e=>{this.transactionsByYear=e.transactionsByYear,this.loading=e.loading,this.empty=e.empty,this.next=e.next}))}firstUpdated(){this.updateTransactionView(),this.createPaginationObserver()}updated(){this.setPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return a.html` ${this.empty?null:this.templateTransactionsByYear()}
    ${this.loading?this.templateLoading():null}
    ${!this.loading&&this.empty?this.templateEmpty():null}`}updateTransactionView(){w.TransactionsController.resetTransactions(),this.caipAddress&&w.TransactionsController.fetchTransactions(m.CoreHelperUtil.getPlainAddress(this.caipAddress))}templateTransactionsByYear(){return Object.keys(this.transactionsByYear).sort().reverse().map(e=>{let t=parseInt(e,10),r=Array(12).fill(null).map((e,r)=>({groupTitle:k.getTransactionGroupTitle(t,r),transactions:this.transactionsByYear[t]?.[r]})).filter(({transactions:e})=>e).reverse();return r.map(({groupTitle:e,transactions:t},i)=>{let n=i===r.length-1;return t?a.html`
          <wui-flex
            flexDirection="column"
            class="group-container"
            last-group="${n?"true":"false"}"
            data-testid="month-indexes"
          >
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${["2","3","3","3"]}
            >
              <wui-text variant="md-medium" color="secondary" data-testid="group-title">
                ${e}
              </wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="2">
              ${this.templateTransactions(t,n)}
            </wui-flex>
          </wui-flex>
        `:null})})}templateRenderTransaction(e,t){let{date:r,descriptions:i,direction:n,images:s,status:o,type:l,transfers:c,isAllNFT:u}=this.getTransactionListItemProps(e);return a.html`
      <wui-transaction-list-item
        date=${r}
        .direction=${n}
        id=${t&&this.next?q:""}
        status=${o}
        type=${l}
        .images=${s}
        .onlyDirectionIcon=${u||1===c.length}
        .descriptions=${i}
      ></wui-transaction-list-item>
    `}templateTransactions(e,t){return e.map((r,i)=>{let n=t&&i===e.length-1;return a.html`${this.templateRenderTransaction(r,n)}`})}emptyStateActivity(){return a.html`<wui-flex
      class="emptyContainer"
      flexGrow="1"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      .padding=${["10","5","10","5"]}
      gap="5"
      data-testid="empty-activity-state"
    >
      <wui-icon-box color="default" icon="wallet" size="xl"></wui-icon-box>
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text align="center" variant="lg-medium" color="primary">No Transactions yet</wui-text>
        <wui-text align="center" variant="lg-regular" color="secondary"
          >Start trading on dApps <br />
          to grow your wallet!</wui-text
        >
      </wui-flex>
    </wui-flex>`}emptyStateAccount(){return a.html`<wui-flex
      class="contentContainer"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap="4"
      data-testid="empty-account-state"
    >
      <wui-icon-box icon="swapHorizontal" size="lg" color="default"></wui-icon-box>
      <wui-flex
        class="textContent"
        gap="2"
        flexDirection="column"
        justifyContent="center"
        flexDirection="column"
      >
        <wui-text variant="md-regular" align="center" color="primary">No activity yet</wui-text>
        <wui-text variant="sm-regular" align="center" color="secondary"
          >Your next transactions will appear here</wui-text
        >
      </wui-flex>
      <wui-link @click=${this.onReceiveClick.bind(this)}>Trade</wui-link>
    </wui-flex>`}templateEmpty(){return"account"===this.page?a.html`${this.emptyStateAccount()}`:a.html`${this.emptyStateActivity()}`}templateLoading(){return"activity"===this.page?a.html` <wui-flex flexDirection="column" width="100%">
        <wui-flex .padding=${["2","3","3","3"]}>
          <wui-shimmer width="70px" height="16px" rounded></wui-shimmer>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2" width="100%">
          ${Array(7).fill(a.html` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `).map(e=>e)}
        </wui-flex>
      </wui-flex>`:null}onReceiveClick(){y.RouterController.push("WalletReceive")}createPaginationObserver(){let{projectId:e}=g.OptionsController.state;this.paginationObserver=new IntersectionObserver(([t])=>{t?.isIntersecting&&!this.loading&&(w.TransactionsController.fetchTransactions(m.CoreHelperUtil.getPlainAddress(this.caipAddress)),f.EventsController.sendEvent({type:"track",event:"LOAD_MORE_TRANSACTIONS",properties:{address:m.CoreHelperUtil.getPlainAddress(this.caipAddress),projectId:e,cursor:this.next,isSmartAccount:(0,b.getPreferredAccountType)(h.ChainController.state.activeChain)===B.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}))},{}),this.setPaginationObserver()}setPaginationObserver(){this.paginationObserver?.disconnect();let e=this.shadowRoot?.querySelector(`#${q}`);e&&this.paginationObserver?.observe(e)}getTransactionListItemProps(e){let t=((e,t="DD MMM")=>(0,o.default)(e).format(t))(e?.metadata?.minedAt),r=k.mergeTransfers(e?.transfers||[]),i=k.getTransactionDescriptions(e,r),a=r?.[0],n=!!a&&r?.every(e=>!!e.nft_info),s=k.getTransactionImages(r);return{date:t,direction:a?.direction,descriptions:i,isAllNFT:n,images:s,status:e.metadata?.status,transfers:r,type:e.metadata?.operationType}}};K.styles=G,W([(0,n.property)()],K.prototype,"page",void 0),W([(0,s.state)()],K.prototype,"caipAddress",void 0),W([(0,s.state)()],K.prototype,"transactionsByYear",void 0),W([(0,s.state)()],K.prototype,"loading",void 0),W([(0,s.state)()],K.prototype,"empty",void 0),W([(0,s.state)()],K.prototype,"next",void 0),K=W([(0,T.customElement)("w3m-activity-list")],K),e.s([],89676)},46650,e=>{"use strict";e.i(12190),e.s([])},84326,65090,e=>{"use strict";var t=e.i(54479);let{I:r}=t._$LH;var i=e.i(91909);let a=(e,t)=>{let r=e._$AN;if(void 0===r)return!1;for(let e of r)e._$AO?.(t,!1),a(e,t);return!0},n=e=>{let t,r;do{if(void 0===(t=e._$AM))break;(r=t._$AN).delete(e),e=t}while(0===r?.size)},s=e=>{for(let t;t=e._$AM;e=t){let r=t._$AN;if(void 0===r)t._$AN=r=new Set;else if(r.has(e))break;r.add(e),c(t)}};function o(e){void 0!==this._$AN?(n(this),this._$AM=e,s(this)):this._$AM=e}function l(e,t=!1,r=0){let i=this._$AH,s=this._$AN;if(void 0!==s&&0!==s.size)if(t)if(Array.isArray(i))for(let e=r;e<i.length;e++)a(i[e],!1),n(i[e]);else null!=i&&(a(i,!1),n(i));else a(this,e)}let c=e=>{e.type==i.PartType.CHILD&&(e._$AP??=l,e._$AQ??=o)};class u extends i.Directive{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,r){super._$AT(e,t,r),s(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(a(this,e),n(this))}setValue(e){if(void 0===this._$Ct.strings)this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}class d{}let p=new WeakMap,h=(0,i.directive)(class extends u{render(e){return t.nothing}update(e,[r]){let i=r!==this.G;return i&&void 0!==this.G&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=r,this.ht=e.options?.host,this.rt(this.ct=e.element)),t.nothing}rt(e){if(this.isConnected||(e=void 0),"function"==typeof this.G){let t=this.ht??globalThis,r=p.get(t);void 0===r&&(r=new WeakMap,p.set(t,r)),void 0!==r.get(this.G)&&this.G.call(this.ht,void 0),r.set(this.G,e),void 0!==e&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return"function"==typeof this.G?p.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});e.s(["createRef",0,()=>new d,"ref",0,h],65090),e.s([],84326)},35902,e=>{"use strict";e.i(12207);var t=e.i(8285),r=e.i(54479);e.i(74576);var i=e.i(20119);e.i(34051);var a=e.i(29389);e.i(84326);var n=e.i(65090);e.i(52634),e.i(39009);var s=e.i(59088),o=e.i(45975),l=e.i(62611);let c=l.css`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[3]} ${({spacing:e})=>e[10]};
    font-size: ${({textSize:e})=>e.large};
    line-height: ${({typography:e})=>e["lg-regular"].lineHeight};
    letter-spacing: ${({typography:e})=>e["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:e})=>e.regular};
    font-family: ${({fontFamily:e})=>e.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[4]} ${({spacing:e})=>e[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:e})=>e[4]};
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:e})=>e[2]};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:e})=>e[12]};
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  /* -- Keyframes --------------------------------------------------- */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;var u=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let d=class extends t.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,n.createRef)(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return r.html` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${(0,n.ref)(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${(0,a.ifDefined)(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value||""}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?r.html`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){return this.onSubmit?r.html`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?r.html`<wui-icon name="spinner" size="md"></wui-icon>`:r.html`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?r.html`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?r.html`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};d.styles=[s.resetStyles,s.elementStyles,c],u([(0,i.property)()],d.prototype,"icon",void 0),u([(0,i.property)({type:Boolean})],d.prototype,"disabled",void 0),u([(0,i.property)({type:Boolean})],d.prototype,"loading",void 0),u([(0,i.property)()],d.prototype,"placeholder",void 0),u([(0,i.property)()],d.prototype,"type",void 0),u([(0,i.property)()],d.prototype,"value",void 0),u([(0,i.property)()],d.prototype,"errorText",void 0),u([(0,i.property)()],d.prototype,"warningText",void 0),u([(0,i.property)()],d.prototype,"onSubmit",void 0),u([(0,i.property)()],d.prototype,"size",void 0),u([(0,i.property)({attribute:!1})],d.prototype,"onKeyDown",void 0),d=u([(0,o.customElement)("wui-input-text")],d),e.s([],35902)},6957,e=>{"use strict";e.i(35902),e.s([])},23838,e=>{"use strict";e.i(12207);var t=e.i(8285),r=e.i(54479);e.i(74576);var i=e.i(20119),a=e.i(75457);e.i(52634),e.i(64380),e.i(39009),e.i(73944);var n=e.i(59088),s=e.i(45975),o=e.i(62611);let l=o.css`
  :host {
    width: 100%;
  }

  button {
    padding: ${({spacing:e})=>e[3]};
    display: flex;
    gap: ${({spacing:e})=>e[3]};
    justify-content: space-between;
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    background-color: transparent;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  button[data-clickable='false'] {
    pointer-events: none;
    background-color: transparent;
  }

  wui-image,
  wui-icon {
    width: ${({spacing:e})=>e[10]};
    height: ${({spacing:e})=>e[10]};
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  .token-name-container {
    flex: 1;
  }
`;var c=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let u=class extends t.LitElement{constructor(){super(...arguments),this.tokenName="",this.tokenImageUrl="",this.tokenValue=0,this.tokenAmount="0.0",this.tokenCurrency="",this.clickable=!1}render(){return r.html`
      <button data-clickable=${String(this.clickable)}>
        <wui-flex gap="2" alignItems="center">
          ${this.visualTemplate()}
          <wui-flex
            flexDirection="column"
            justifyContent="space-between"
            gap="1"
            class="token-name-container"
          >
            <wui-text variant="md-regular" color="primary" lineClamp="1">
              ${this.tokenName}
            </wui-text>
            <wui-text variant="sm-regular-mono" color="secondary">
              ${a.NumberUtil.formatNumberToLocalString(this.tokenAmount,4)} ${this.tokenCurrency}
            </wui-text>
          </wui-flex>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          justifyContent="space-between"
          gap="1"
          alignItems="flex-end"
          width="auto"
        >
          <wui-text variant="md-regular-mono" color="primary"
            >$${this.tokenValue.toFixed(2)}</wui-text
          >
          <wui-text variant="sm-regular-mono" color="secondary">
            ${a.NumberUtil.formatNumberToLocalString(this.tokenAmount,4)}
          </wui-text>
        </wui-flex>
      </button>
    `}visualTemplate(){return this.tokenName&&this.tokenImageUrl?r.html`<wui-image alt=${this.tokenName} src=${this.tokenImageUrl}></wui-image>`:r.html`<wui-icon name="coinPlaceholder" color="default"></wui-icon>`}};u.styles=[n.resetStyles,n.elementStyles,l],c([(0,i.property)()],u.prototype,"tokenName",void 0),c([(0,i.property)()],u.prototype,"tokenImageUrl",void 0),c([(0,i.property)({type:Number})],u.prototype,"tokenValue",void 0),c([(0,i.property)()],u.prototype,"tokenAmount",void 0),c([(0,i.property)()],u.prototype,"tokenCurrency",void 0),c([(0,i.property)({type:Boolean})],u.prototype,"clickable",void 0),u=c([(0,s.customElement)("wui-list-token")],u),e.s([],23838)},21803,e=>{"use strict";e.i(12207);var t=e.i(8285),r=e.i(54479);e.i(74576);var i=e.i(20119);e.i(64380);var a=e.i(59088),n=e.i(12699),s=e.i(45975),o=e.i(62611);let l=o.css`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
    border-radius: ${({borderRadius:e})=>e[16]};
    overflow: hidden;
    position: relative;
  }

  :host([data-variant='generated']) {
    --mixed-local-color-1: var(--local-color-1);
    --mixed-local-color-2: var(--local-color-2);
    --mixed-local-color-3: var(--local-color-3);
    --mixed-local-color-4: var(--local-color-4);
    --mixed-local-color-5: var(--local-color-5);
  }

  :host([data-variant='generated']) {
    background: radial-gradient(
      var(--local-radial-circle),
      #fff 0.52%,
      var(--mixed-local-color-5) 31.25%,
      var(--mixed-local-color-3) 51.56%,
      var(--mixed-local-color-2) 65.63%,
      var(--mixed-local-color-1) 82.29%,
      var(--mixed-local-color-4) 100%
    );
  }

  :host([data-variant='default']) {
    background: radial-gradient(
      75.29% 75.29% at 64.96% 24.36%,
      #fff 0.52%,
      #f5ccfc 31.25%,
      #dba4f5 51.56%,
      #9a8ee8 65.63%,
      #6493da 82.29%,
      #6ebdea 100%
    );
  }
`;var c=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let u=class extends t.LitElement{constructor(){super(...arguments),this.imageSrc=void 0,this.alt=void 0,this.address=void 0,this.size="xl"}render(){let e={inherit:"inherit",xxs:"3",xs:"5",sm:"6",md:"8",mdl:"8",lg:"10",xl:"16",xxl:"20"};return this.style.cssText=`
    --local-width: var(--apkt-spacing-${e[this.size??"xl"]});
    --local-height: var(--apkt-spacing-${e[this.size??"xl"]});
    `,r.html`${this.visualTemplate()}`}visualTemplate(){if(this.imageSrc)return this.dataset.variant="image",r.html`<wui-image src=${this.imageSrc} alt=${this.alt??"avatar"}></wui-image>`;if(this.address){this.dataset.variant="generated";let e=n.UiHelperUtil.generateAvatarColors(this.address);return this.style.cssText+=`
 ${e}`,null}return this.dataset.variant="default",null}};u.styles=[a.resetStyles,l],c([(0,i.property)()],u.prototype,"imageSrc",void 0),c([(0,i.property)()],u.prototype,"alt",void 0),c([(0,i.property)()],u.prototype,"address",void 0),c([(0,i.property)()],u.prototype,"size",void 0),u=c([(0,s.customElement)("wui-avatar")],u),e.s([],21803)},39299,e=>{"use strict";e.i(12207);var t=e.i(8285),r=e.i(54479);e.i(74576);var i=e.i(20119);e.i(34051);var a=e.i(29389);e.i(52634),e.i(39009);var n=e.i(59088),s=e.i(45975);e.i(35902);var o=e.i(15193);let l=o.css`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`;var c=function(e,t,r,i){var a,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(n<3?a(s):n>3?a(t,r,s):a(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let u=class extends t.LitElement{constructor(){super(...arguments),this.disabled=!1}render(){return r.html`
      <wui-input-text
        type="email"
        placeholder="Email"
        icon="mail"
        size="lg"
        .disabled=${this.disabled}
        .value=${this.value}
        data-testid="wui-email-input"
        tabIdx=${(0,a.ifDefined)(this.tabIdx)}
      ></wui-input-text>
      ${this.templateError()}
    `}templateError(){return this.errorMessage?r.html`<wui-text variant="sm-regular" color="error">${this.errorMessage}</wui-text>`:null}};u.styles=[n.resetStyles,l],c([(0,i.property)()],u.prototype,"errorMessage",void 0),c([(0,i.property)({type:Boolean})],u.prototype,"disabled",void 0),c([(0,i.property)()],u.prototype,"value",void 0),c([(0,i.property)()],u.prototype,"tabIdx",void 0),u=c([(0,s.customElement)("wui-email-input")],u),e.s([],39299)},49694,24141,e=>{"use strict";var t=e.i(65801),r=e.i(42710),i=e.i(75457),a=e.i(64126),n=e.i(60334),s=e.i(27302),o=e.i(50576),l=e.i(82283);let c={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}},u={56:"714",204:"714"};class d extends Error{}async function p(e,t){let r=function(){let{sdkType:e,sdkVersion:t,projectId:r}=l.OptionsController.getSnapshot(),i=new URL("https://rpc.walletconnect.org/v1/json-rpc");return i.searchParams.set("projectId",r),i.searchParams.set("st",e),i.searchParams.set("sv",t),i.searchParams.set("source","fund-wallet"),i.toString()}(),{projectId:i}=l.OptionsController.getSnapshot(),a={jsonrpc:"2.0",id:1,method:e,params:{...t||{},projectId:i}},n=await fetch(r,{method:"POST",body:JSON.stringify(a),headers:{"Content-Type":"application/json"}}),s=await n.json();if(s.error)throw new d(s.error.message);return s}async function h(e){return(await p("reown_getExchanges",e)).result}async function m(e){return(await p("reown_getExchangePayUrl",e)).result}async function f(e){return(await p("reown_getExchangeBuyStatus",e)).result}function g(e,t){let{chainNamespace:r,chainId:i}=o.ParseUtil.parseCaipNetworkId(e),a=c[r];if(!a)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${r}`);let n=a.native.assetNamespace,s=a.native.assetReference;"native"!==t?(n=a.defaultTokenNamespace,s=t):"eip155"===r&&u[i]&&(s=u[i]);let l=`${r}:${i}`;return`${l}/${n}:${s}`}let y={network:"eip155:8453",asset:"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},w={ethereumETH:{network:"eip155:1",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},baseETH:{network:"eip155:8453",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},baseUSDC:y,baseSepoliaETH:{network:"eip155:84532",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},ethereumUSDC:{network:"eip155:1",asset:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},arbitrumUSDC:{network:"eip155:42161",asset:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},polygonUSDC:{network:"eip155:137",asset:"0x2791bca1f2de4661ed88a30c99a7a9449aa84174",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},solanaUSDC:{network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ethereumUSDT:{network:"eip155:1",asset:"0xdAC17F958D2ee523a2206206994597C13D831ec7",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},optimismUSDT:{network:"eip155:10",asset:"0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},arbitrumUSDT:{network:"eip155:42161",asset:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},polygonUSDT:{network:"eip155:137",asset:"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},solanaUSDT:{network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},solanaSOL:{network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"native",metadata:{name:"Solana",symbol:"SOL",decimals:9}}};function b(e){return Object.values(w).filter(t=>t.network===e)}e.s(["baseSepoliaUSDC",0,{network:"eip155:84532",asset:"0x036CbD53842c5426634e7929541eC2318f3dCF7e",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},"baseUSDC",0,y,"formatCaip19Asset",0,g,"getBuyStatus",0,f,"getExchanges",0,h,"getPayUrl",0,m,"getPaymentAssetsForNetwork",0,b],24141);var v=e.i(24742),x=e.i(60398),$=e.i(53157),k=e.i(11424);let T={paymentAsset:null,amount:null,tokenAmount:0,priceLoading:!1,error:null,exchanges:[],isLoading:!1,currentPayment:void 0,isPaymentInProgress:!1,paymentId:"",assets:[]},S=(0,t.proxy)(T),C={state:S,subscribe:e=>(0,t.subscribe)(S,()=>e(S)),subscribeKey:(e,t)=>(0,r.subscribeKey)(S,e,t),resetState(){Object.assign(S,{...T})},async getAssetsForNetwork(e){let t=b(e),r=await C.getAssetsImageAndPrice(t),i=t.map(e=>{let t="native"===e.asset?(0,a.getActiveNetworkTokenAddress)():`${e.network}:${e.asset}`,i=r.find(e=>e.fungibles?.[0]?.address?.toLowerCase()===t.toLowerCase());return{...e,price:i?.fungibles?.[0]?.price||1,metadata:{...e.metadata,iconUrl:i?.fungibles?.[0]?.iconUrl}}});return S.assets=i,i},async getAssetsImageAndPrice(e){let t=e.map(e=>"native"===e.asset?(0,a.getActiveNetworkTokenAddress)():`${e.network}:${e.asset}`);return await Promise.all(t.map(e=>v.BlockchainApiController.fetchTokenPrice({addresses:[e]})))},getTokenAmount(){if(!S?.paymentAsset?.price)throw Error("Cannot get token price");let e=i.NumberUtil.bigNumber(S.amount??0).round(8),t=i.NumberUtil.bigNumber(S.paymentAsset.price).round(8);return e.div(t).round(8).toNumber()},setAmount(e){S.amount=e,S.paymentAsset?.price&&(S.tokenAmount=C.getTokenAmount())},setPaymentAsset(e){S.paymentAsset=e},isPayWithExchangeEnabled:()=>l.OptionsController.state.remoteFeatures?.payWithExchange,isPayWithExchangeSupported:()=>C.isPayWithExchangeEnabled()&&x.ChainController.state.activeCaipNetwork&&n.ConstantsUtil.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(x.ChainController.state.activeCaipNetwork.chainNamespace),async fetchExchanges(){try{let e=C.isPayWithExchangeSupported();if(!S.paymentAsset||!e){S.exchanges=[],S.isLoading=!1;return}S.isLoading=!0;let t=await h({page:0,asset:g(S.paymentAsset.network,S.paymentAsset.asset),amount:S.amount?.toString()??"0"});S.exchanges=t.exchanges.slice(0,2)}catch(e){throw k.SnackController.showError("Unable to get exchanges"),Error("Unable to get exchanges")}finally{S.isLoading=!1}},async getPayUrl(e,t){try{let r=Number(t.amount),i=await m({exchangeId:e,asset:g(t.network,t.asset),amount:r.toString(),recipient:`${t.network}:${t.recipient}`});return $.EventsController.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:"exchange",exchangeId:e},source:"fund-from-exchange",headless:!1}}),i}catch(e){if(e instanceof Error&&e.message.includes("is not supported"))throw Error("Asset not supported");throw Error(e.message)}},async handlePayWithExchange(e){try{let t=x.ChainController.getAccountData()?.address;if(!t)throw Error("No account connected");if(!S.paymentAsset)throw Error("No payment asset selected");let r=s.CoreHelperUtil.returnOpenHref("","popupWindow","scrollbar=yes,width=480,height=720");if(!r)throw Error("Could not create popup window");S.isPaymentInProgress=!0,S.paymentId=crypto.randomUUID(),S.currentPayment={type:"exchange",exchangeId:e};let{network:i,asset:a}=S.paymentAsset,n={network:i,asset:a,amount:S.tokenAmount,recipient:t},o=await C.getPayUrl(e,n);if(!o){try{r.close()}catch(e){console.error("Unable to close popup window",e)}throw Error("Unable to initiate payment")}S.currentPayment.sessionId=o.sessionId,S.currentPayment.status="IN_PROGRESS",S.currentPayment.exchangeId=e,r.location.href=o.url}catch(e){S.error="Unable to initiate payment",k.SnackController.showError(S.error)}},async waitUntilComplete({exchangeId:e,sessionId:t,paymentId:r,retries:i=20}){let a=await C.getBuyStatus(e,t,r);if("SUCCESS"===a.status||"FAILED"===a.status)return a;if(0===i)throw Error("Unable to get deposit status");return await new Promise(e=>{setTimeout(e,5e3)}),C.waitUntilComplete({exchangeId:e,sessionId:t,paymentId:r,retries:i-1})},async getBuyStatus(e,t,r){try{if(!S.currentPayment)throw Error("No current payment");let i=await f({sessionId:t,exchangeId:e});if(S.currentPayment.status=i.status,"SUCCESS"===i.status||"FAILED"===i.status){let e=x.ChainController.getAccountData()?.address;S.currentPayment.result=i.txHash,S.isPaymentInProgress=!1,$.EventsController.sendEvent({type:"track",event:"SUCCESS"===i.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===i.status?s.CoreHelperUtil.parseError(S.error):void 0,source:"fund-from-exchange",paymentId:r,configuration:{network:S.paymentAsset?.network||"",asset:S.paymentAsset?.asset||"",recipient:e||"",amount:S.amount??0},currentPayment:{type:"exchange",exchangeId:S.currentPayment?.exchangeId,sessionId:S.currentPayment?.sessionId,result:i.txHash}}})}return i}catch(e){return{status:"UNKNOWN",txHash:""}}},reset(){S.currentPayment=void 0,S.isPaymentInProgress=!1,S.paymentId="",S.paymentAsset=null,S.amount=0,S.tokenAmount=0,S.priceLoading=!1,S.error=null,S.exchanges=[],S.isLoading=!1}};e.s(["ExchangeController",0,C],49694)}]);