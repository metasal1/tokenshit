(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,64380,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var i=t.i(20119);t.i(34051);var a=t.i(29389),n=t.i(59088),s=t.i(45975),o=t.i(62611);let l=o.css`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
    user-select: none;
    user-drag: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
  }

  :host([data-boxed='true']) {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  :host([data-boxed='true']) img {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:t})=>t[16]};
  }

  :host([data-full='true']) img {
    width: 100%;
    height: 100%;
  }

  :host([data-boxed='true']) wui-icon {
    width: 20px;
    height: 20px;
  }

  :host([data-icon='error']) {
    background-color: ${({tokens:t})=>t.core.backgroundError};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:t})=>t[16]};
  }
`;var c=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let u=class extends e.LitElement{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let t={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?r.html`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?r.html`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:r.html`<img src=${(0,a.ifDefined)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};u.styles=[n.resetStyles,l],c([(0,i.property)()],u.prototype,"src",void 0),c([(0,i.property)()],u.prototype,"logo",void 0),c([(0,i.property)()],u.prototype,"icon",void 0),c([(0,i.property)()],u.prototype,"iconColor",void 0),c([(0,i.property)()],u.prototype,"alt",void 0),c([(0,i.property)()],u.prototype,"size",void 0),c([(0,i.property)({type:Boolean})],u.prototype,"boxed",void 0),c([(0,i.property)({type:Boolean})],u.prototype,"rounded",void 0),c([(0,i.property)({type:Boolean})],u.prototype,"fullSize",void 0),u=c([(0,s.customElement)("wui-image")],u),t.s([],64380)},34051,29389,t=>{"use strict";var e=t.i(54479);t.s(["ifDefined",0,t=>t??e.nothing],29389),t.s([],34051)},12190,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var i=t.i(20119);t.i(34051);var a=t.i(29389);t.i(52634);var n=t.i(59088),s=t.i(45975),o=t.i(62611);let l=o.css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({borderRadius:t})=>t[2]};
    padding: ${({spacing:t})=>t[1]} !important;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    position: relative;
  }

  :host([data-padding='2']) {
    padding: ${({spacing:t})=>t[2]} !important;
  }

  :host:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  :host > wui-icon {
    z-index: 10;
  }

  /* -- Colors --------------------------------------------------- */
  :host([data-color='accent-primary']) {
    color: ${({tokens:t})=>t.core.iconAccentPrimary};
  }

  :host([data-color='accent-primary']):after {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  :host([data-color='default']),
  :host([data-color='secondary']) {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  :host([data-color='default']):after {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  :host([data-color='secondary']):after {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  :host([data-color='success']) {
    color: ${({tokens:t})=>t.core.iconSuccess};
  }

  :host([data-color='success']):after {
    background-color: ${({tokens:t})=>t.core.backgroundSuccess};
  }

  :host([data-color='error']) {
    color: ${({tokens:t})=>t.core.iconError};
  }

  :host([data-color='error']):after {
    background-color: ${({tokens:t})=>t.core.backgroundError};
  }

  :host([data-color='warning']) {
    color: ${({tokens:t})=>t.core.iconWarning};
  }

  :host([data-color='warning']):after {
    background-color: ${({tokens:t})=>t.core.backgroundWarning};
  }

  :host([data-color='inverse']) {
    color: ${({tokens:t})=>t.theme.iconInverse};
  }

  :host([data-color='inverse']):after {
    background-color: transparent;
  }
`;var c=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let u=class extends e.LitElement{constructor(){super(...arguments),this.icon="copy",this.size="md",this.padding="1",this.color="default"}render(){return this.dataset.padding=this.padding,this.dataset.color=this.color,r.html`
      <wui-icon size=${(0,a.ifDefined)(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `}};u.styles=[n.resetStyles,n.elementStyles,l],c([(0,i.property)()],u.prototype,"icon",void 0),c([(0,i.property)()],u.prototype,"size",void 0),c([(0,i.property)()],u.prototype,"padding",void 0),c([(0,i.property)()],u.prototype,"color",void 0),u=c([(0,s.customElement)("wui-icon-box")],u),t.s([],12190)},64576,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var i=t.i(20119),a=t.i(45975),n=t.i(62611);let s=n.css`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({tokens:t})=>t.theme.foregroundPrimary} 0%,
      ${({tokens:t})=>t.theme.foregroundSecondary} 50%,
      ${({tokens:t})=>t.theme.foregroundPrimary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:t})=>t[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;var o=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let l=class extends e.LitElement{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",r.html`<slot></slot>`}};l.styles=[s],o([(0,i.property)()],l.prototype,"width",void 0),o([(0,i.property)()],l.prototype,"height",void 0),o([(0,i.property)()],l.prototype,"variant",void 0),o([(0,i.property)({type:Boolean})],l.prototype,"rounded",void 0),l=o([(0,a.customElement)("wui-shimmer")],l),t.s([],64576)},46650,t=>{"use strict";t.i(12190),t.s([])},10380,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var i=t.i(20119);t.i(52634),t.i(39009);var a=t.i(59088),n=t.i(45975),s=t.i(62611);let o=s.css`
  button {
    border: none;
    background: transparent;
    height: 20px;
    padding: ${({spacing:t})=>t[2]};
    column-gap: ${({spacing:t})=>t[1]};
    border-radius: ${({borderRadius:t})=>t[1]};
    padding: 0 ${({spacing:t})=>t[1]};
    border-radius: ${({spacing:t})=>t[1]};
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent'] {
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button[data-variant='secondary'] {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[data-variant='accent']:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-variant='accent']:hover:enabled {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:hover:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var l=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let c={sm:"sm-medium",md:"md-medium"},u={accent:"accent-primary",secondary:"secondary"},d=class extends e.LitElement{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.variant="accent",this.icon=void 0}render(){return r.html`
      <button ?disabled=${this.disabled} data-variant=${this.variant}>
        <slot name="iconLeft"></slot>
        <wui-text
          color=${u[this.variant]}
          variant=${c[this.size]}
        >
          <slot></slot>
        </wui-text>
        ${this.iconTemplate()}
      </button>
    `}iconTemplate(){return this.icon?r.html`<wui-icon name=${this.icon} size="sm"></wui-icon>`:null}};d.styles=[a.resetStyles,a.elementStyles,o],l([(0,i.property)()],d.prototype,"size",void 0),l([(0,i.property)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,i.property)()],d.prototype,"variant",void 0),l([(0,i.property)()],d.prototype,"icon",void 0),d=l([(0,n.customElement)("wui-link")],d),t.s([],10380)},22315,(t,e,r)=>{t.e,e.exports=function(){"use strict";var t="millisecond",e="second",r="minute",i="hour",a="week",n="month",s="quarter",o="year",l="date",c="Invalid Date",u=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,d=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,h=function(t,e,r){var i=String(t);return!i||i.length>=e?t:""+Array(e+1-i.length).join(r)+t},p="en",m={};m[p]={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],r=t%100;return"["+t+(e[(r-20)%10]||e[r]||e[0])+"]"}};var f="$isDayjsObject",g=function(t){return t instanceof b||!(!t||!t[f])},y=function t(e,r,i){var a;if(!e)return p;if("string"==typeof e){var n=e.toLowerCase();m[n]&&(a=n),r&&(m[n]=r,a=n);var s=e.split("-");if(!a&&s.length>1)return t(s[0])}else{var o=e.name;m[o]=e,a=o}return!i&&a&&(p=a),a||!i&&p},v=function(t,e){if(g(t))return t.clone();var r="object"==typeof e?e:{};return r.date=t,r.args=arguments,new b(r)},w={s:h,z:function(t){var e=-t.utcOffset(),r=Math.abs(e);return(e<=0?"+":"-")+h(Math.floor(r/60),2,"0")+":"+h(r%60,2,"0")},m:function t(e,r){if(e.date()<r.date())return-t(r,e);var i=12*(r.year()-e.year())+(r.month()-e.month()),a=e.clone().add(i,n),s=r-a<0,o=e.clone().add(i+(s?-1:1),n);return+(-(i+(r-a)/(s?a-o:o-a))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(c){return({M:n,y:o,w:a,d:"day",D:l,h:i,m:r,s:e,ms:t,Q:s})[c]||String(c||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}};w.l=y,w.i=g,w.w=function(t,e){return v(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var b=function(){function h(t){this.$L=y(t.locale,null,!0),this.parse(t),this.$x=this.$x||t.x||{},this[f]=!0}var p=h.prototype;return p.parse=function(t){this.$d=function(t){var e=t.date,r=t.utc;if(null===e)return new Date(NaN);if(w.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var i=e.match(u);if(i){var a=i[2]-1||0,n=(i[7]||"0").substring(0,3);return r?new Date(Date.UTC(i[1],a,i[3]||1,i[4]||0,i[5]||0,i[6]||0,n)):new Date(i[1],a,i[3]||1,i[4]||0,i[5]||0,i[6]||0,n)}}return new Date(e)}(t),this.init()},p.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},p.$utils=function(){return w},p.isValid=function(){return this.$d.toString()!==c},p.isSame=function(t,e){var r=v(t);return this.startOf(e)<=r&&r<=this.endOf(e)},p.isAfter=function(t,e){return v(t)<this.startOf(e)},p.isBefore=function(t,e){return this.endOf(e)<v(t)},p.$g=function(t,e,r){return w.u(t)?this[e]:this.set(r,t)},p.unix=function(){return Math.floor(this.valueOf()/1e3)},p.valueOf=function(){return this.$d.getTime()},p.startOf=function(t,s){var c=this,u=!!w.u(s)||s,d=w.p(t),h=function(t,e){var r=w.w(c.$u?Date.UTC(c.$y,e,t):new Date(c.$y,e,t),c);return u?r:r.endOf("day")},p=function(t,e){return w.w(c.toDate()[t].apply(c.toDate("s"),(u?[0,0,0,0]:[23,59,59,999]).slice(e)),c)},m=this.$W,f=this.$M,g=this.$D,y="set"+(this.$u?"UTC":"");switch(d){case o:return u?h(1,0):h(31,11);case n:return u?h(1,f):h(0,f+1);case a:var v=this.$locale().weekStart||0,b=(m<v?m+7:m)-v;return h(u?g-b:g+(6-b),f);case"day":case l:return p(y+"Hours",0);case i:return p(y+"Minutes",1);case r:return p(y+"Seconds",2);case e:return p(y+"Milliseconds",3);default:return this.clone()}},p.endOf=function(t){return this.startOf(t,!1)},p.$set=function(a,s){var c,u=w.p(a),d="set"+(this.$u?"UTC":""),h=((c={}).day=d+"Date",c[l]=d+"Date",c[n]=d+"Month",c[o]=d+"FullYear",c[i]=d+"Hours",c[r]=d+"Minutes",c[e]=d+"Seconds",c[t]=d+"Milliseconds",c)[u],p="day"===u?this.$D+(s-this.$W):s;if(u===n||u===o){var m=this.clone().set(l,1);m.$d[h](p),m.init(),this.$d=m.set(l,Math.min(this.$D,m.daysInMonth())).$d}else h&&this.$d[h](p);return this.init(),this},p.set=function(t,e){return this.clone().$set(t,e)},p.get=function(t){return this[w.p(t)]()},p.add=function(t,s){var l,c=this;t=Number(t);var u=w.p(s),d=function(e){var r=v(c);return w.w(r.date(r.date()+Math.round(e*t)),c)};if(u===n)return this.set(n,this.$M+t);if(u===o)return this.set(o,this.$y+t);if("day"===u)return d(1);if(u===a)return d(7);var h=((l={})[r]=6e4,l[i]=36e5,l[e]=1e3,l)[u]||1,p=this.$d.getTime()+t*h;return w.w(p,this)},p.subtract=function(t,e){return this.add(-1*t,e)},p.format=function(t){var e=this,r=this.$locale();if(!this.isValid())return r.invalidDate||c;var i=t||"YYYY-MM-DDTHH:mm:ssZ",a=w.z(this),n=this.$H,s=this.$m,o=this.$M,l=r.weekdays,u=r.months,h=r.meridiem,p=function(t,r,a,n){return t&&(t[r]||t(e,i))||a[r].slice(0,n)},m=function(t){return w.s(n%12||12,t,"0")},f=h||function(t,e,r){var i=t<12?"AM":"PM";return r?i.toLowerCase():i};return i.replace(d,function(t,i){return i||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return w.s(e.$y,4,"0");case"M":return o+1;case"MM":return w.s(o+1,2,"0");case"MMM":return p(r.monthsShort,o,u,3);case"MMMM":return p(u,o);case"D":return e.$D;case"DD":return w.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return p(r.weekdaysMin,e.$W,l,2);case"ddd":return p(r.weekdaysShort,e.$W,l,3);case"dddd":return l[e.$W];case"H":return String(n);case"HH":return w.s(n,2,"0");case"h":return m(1);case"hh":return m(2);case"a":return f(n,s,!0);case"A":return f(n,s,!1);case"m":return String(s);case"mm":return w.s(s,2,"0");case"s":return String(e.$s);case"ss":return w.s(e.$s,2,"0");case"SSS":return w.s(e.$ms,3,"0");case"Z":return a}return null}(t)||a.replace(":","")})},p.utcOffset=function(){return-(15*Math.round(this.$d.getTimezoneOffset()/15))},p.diff=function(t,l,c){var u,d=this,h=w.p(l),p=v(t),m=(p.utcOffset()-this.utcOffset())*6e4,f=this-p,g=function(){return w.m(d,p)};switch(h){case o:u=g()/12;break;case n:u=g();break;case s:u=g()/3;break;case a:u=(f-m)/6048e5;break;case"day":u=(f-m)/864e5;break;case i:u=f/36e5;break;case r:u=f/6e4;break;case e:u=f/1e3;break;default:u=f}return c?u:w.a(u)},p.daysInMonth=function(){return this.endOf(n).$D},p.$locale=function(){return m[this.$L]},p.locale=function(t,e){if(!t)return this.$L;var r=this.clone(),i=y(t,e,!0);return i&&(r.$L=i),r},p.clone=function(){return w.w(this.$d,this)},p.toDate=function(){return new Date(this.valueOf())},p.toJSON=function(){return this.isValid()?this.toISOString():null},p.toISOString=function(){return this.$d.toISOString()},p.toString=function(){return this.$d.toUTCString()},h}(),x=b.prototype;return v.prototype=x,[["$ms",t],["$s",e],["$m",r],["$H",i],["$W","day"],["$M",n],["$y",o],["$D",l]].forEach(function(t){x[t[1]]=function(e){return this.$g(e,t[0],t[1])}}),v.extend=function(t,e){return t.$i||(t(e,b,v),t.$i=!0),v},v.locale=y,v.isDayjs=g,v.unix=function(t){return v(1e3*t)},v.en=m[p],v.Ls=m,v.p={},v}()},96931,(t,e,r)=>{t.e,e.exports={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],r=t%100;return"["+t+(e[(r-20)%10]||e[r]||e[0])+"]"}}},72856,(t,e,r)=>{t.e,e.exports=function(t,e,r){t=t||{};var i=e.prototype,a={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function n(t,e,r,a){return i.fromToBase(t,e,r,a)}r.en.relativeTime=a,i.fromToBase=function(e,i,n,s,o){for(var l,c,u,d=n.$locale().relativeTime||a,h=t.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],p=h.length,m=0;m<p;m+=1){var f=h[m];f.d&&(l=s?r(e).diff(n,f.d,!0):n.diff(e,f.d,!0));var g=(t.rounding||Math.round)(Math.abs(l));if(u=l>0,g<=f.r||!f.r){g<=1&&m>0&&(f=h[m-1]);var y=d[f.l];o&&(g=o(""+g)),c="string"==typeof y?y.replace("%d",g):y(g,i,f.l,u);break}}if(i)return c;var v=u?d.future:d.past;return"function"==typeof v?v(c):v.replace("%s",c)},i.to=function(t,e){return n(t,e,this,!0)},i.from=function(t,e){return n(t,e,this)};var s=function(t){return t.$u?r.utc():r()};i.toNow=function(t){return this.to(s(this),t)},i.fromNow=function(t){return this.from(s(this),t)}}},83840,(t,e,r)=>{t.e,e.exports=function(t,e,r){r.updateLocale=function(t,e){var i=r.Ls[t];if(i)return(e?Object.keys(e):[]).forEach(function(t){i[t]=e[t]}),i}}},89676,t=>{"use strict";t.i(12207);var e,r,i=t.i(8285),a=t.i(54479);t.i(74576);var n=t.i(20119),s=t.i(56350),o=t.i(22315),l=t.i(96931),c=t.i(72856),u=t.i(83840);o.default.extend(c.default),o.default.extend(u.default);let d={...l.default,name:"en-web3-modal",relativeTime:{future:"in %s",past:"%s ago",s:"%d sec",m:"1 min",mm:"%d min",h:"1 hr",hh:"%d hrs",d:"1 d",dd:"%d d",M:"1 mo",MM:"%d mo",y:"1 yr",yy:"%d yr"}},h=["January","February","March","April","May","June","July","August","September","October","November","December"];o.default.locale("en-web3-modal",d);var p=t.i(60398),m=t.i(27302),f=t.i(53157),g=t.i(82283),y=t.i(21728),v=t.i(26618),w=t.i(64126);t.i(4041);var b=t.i(12699);let x=["receive","deposit","borrow","claim"],$=["withdraw","repay","burn"],k={getTransactionGroupTitle(t,e){let r=((t=new Date().toISOString())=>(0,o.default)(t).year())(),i=h[e];return t===r?i:`${i} ${t}`},getTransactionImages(t){let[e]=t;return t?.length>1?t.map(t=>this.getTransactionImage(t)):[this.getTransactionImage(e)]},getTransactionImage:t=>({type:k.getTransactionTransferTokenType(t),url:k.getTransactionImageURL(t)}),getTransactionImageURL(t){let e,r=!!t?.nft_info,i=!!t?.fungible_info;return t&&r?e=t?.nft_info?.content?.preview?.url:t&&i&&(e=t?.fungible_info?.icon?.url),e},getTransactionTransferTokenType:t=>t?.fungible_info?"FUNGIBLE":t?.nft_info?"NFT":void 0,getTransactionDescriptions(t,e){let r=t?.metadata?.operationType,i=e||t?.transfers,a=i&&i.length>0,n=i&&i.length>1,s=a&&i.every(t=>!!t?.fungible_info),[o,l]=i||[],c=this.getTransferDescription(o),u=this.getTransferDescription(l);if(!a)return("send"===r||"receive"===r)&&s?[c=b.UiHelperUtil.getTruncateString({string:t?.metadata.sentFrom,charsStart:4,charsEnd:6,truncate:"middle"}),b.UiHelperUtil.getTruncateString({string:t?.metadata.sentTo,charsStart:4,charsEnd:6,truncate:"middle"})]:[t.metadata.status];if(n)return i?.map(t=>this.getTransferDescription(t));let d="";return x.includes(r)?d="+":$.includes(r)&&(d="-"),[c=d.concat(c)]},getTransferDescription(t){let e="";return t&&(t?.nft_info?e=t?.nft_info?.name||"-":t?.fungible_info&&(e=this.getFungibleTransferDescription(t)||"-")),e},getFungibleTransferDescription(t){return t?[this.getQuantityFixedValue(t?.quantity.numeric),t?.fungible_info?.symbol].join(" ").trim():null},mergeTransfers(t){if(t?.length<=1)return t;let e=this.filterGasFeeTransfers(t).reduce((t,e)=>{let r=e?.fungible_info?.name,i=t.find(({fungible_info:t,direction:i})=>r&&r===t?.name&&i===e.direction);if(i){let t=Number(i.quantity.numeric)+Number(e.quantity.numeric);i.quantity.numeric=t.toString(),i.value=(i.value||0)+(e.value||0)}else t.push(e);return t},[]),r=e;return e.length>2&&(r=e.sort((t,e)=>(e.value||0)-(t.value||0)).slice(0,2)),r=r.sort((t,e)=>"out"===t.direction&&"in"===e.direction?-1:+("in"===t.direction&&"out"===e.direction))},filterGasFeeTransfers(t){let e=t?.reduce((t,e)=>{let r=e?.fungible_info?.name;return r&&(t[r]||(t[r]=[]),t[r].push(e)),t},{}),r=[];return Object.values(e??{}).forEach(t=>{if(1===t.length){let e=t[0];e&&r.push(e)}else{let e=t.filter(t=>"in"===t.direction),i=t.filter(t=>"out"===t.direction);if(1===e.length&&1===i.length){let a=e[0],n=i[0],s=!1;if(a&&n){let t=Number(a.quantity.numeric),e=Number(n.quantity.numeric);e<.1*t?(r.push(a),s=!0):t<.1*e&&(r.push(n),s=!0)}s||r.push(...t)}else{let e=this.filterGasFeesFromTokenGroup(t);r.push(...e)}}}),t?.forEach(t=>{t?.fungible_info?.name||r.push(t)}),r},filterGasFeesFromTokenGroup(t){if(t.length<=1)return t;let e=t?.map(t=>Number(t.quantity.numeric)),r=Math.max(...e);if(Math.min(...e)<.01*r)return t?.filter(t=>Number(t.quantity.numeric)>=.01*r);let i=t?.filter(t=>"in"===t.direction),a=t?.filter(t=>"out"===t.direction);if(1===i.length&&1===a.length){let t=i[0],e=a[0];if(t&&e){let r=Number(t.quantity.numeric),i=Number(e.quantity.numeric);if(i<.1*r)return[t];if(r<.1*i)return[e]}}return t},getQuantityFixedValue:t=>t?parseFloat(t).toFixed(3):null};var T=t.i(45975);t.i(62238),t.i(46650),t.i(10380),t.i(49536);var j=i;t.i(34051);var P=t.i(29389);t.i(39009);var D=t.i(59088);(e=r||(r={})).approve="approved",e.bought="bought",e.borrow="borrowed",e.burn="burnt",e.cancel="canceled",e.claim="claimed",e.deploy="deployed",e.deposit="deposited",e.execute="executed",e.mint="minted",e.receive="received",e.repay="repaid",e.send="sent",e.sell="sold",e.stake="staked",e.trade="swapped",e.unstake="unstaked",e.withdraw="withdrawn";var S=i;t.i(52634),t.i(64380),t.i(12190);var I=t.i(62611);let O=I.css`
  :host > wui-flex {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 40px;
    height: 40px;
    box-shadow: inset 0 0 0 1px ${({tokens:t})=>t.core.glass010};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  :host([data-no-images='true']) > wui-flex {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[3]} !important;
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
    border-radius: ${({borderRadius:t})=>t[4]};
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    box-shadow: 0 0 0 2px ${({tokens:t})=>t.theme.backgroundPrimary};
    overflow: hidden;
    width: 16px;
    height: 16px;
  }
`;var _=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let C=class extends S.LitElement{constructor(){super(...arguments),this.images=[],this.secondImage={type:void 0,url:""},this.failedImageUrls=new Set}handleImageError(t){return e=>{e.stopPropagation(),this.failedImageUrls.add(t),this.requestUpdate()}}render(){let[t,e]=this.images;this.images.length||(this.dataset.noImages="true");let r=t?.type==="NFT",i=e?.url?"NFT"===e.type:r;return this.style.cssText=`
    --local-left-border-radius: ${r?"var(--apkt-borderRadius-3)":"var(--apkt-borderRadius-5)"};
    --local-right-border-radius: ${i?"var(--apkt-borderRadius-3)":"var(--apkt-borderRadius-5)"};
    `,a.html`<wui-flex> ${this.templateVisual()} ${this.templateIcon()} </wui-flex>`}templateVisual(){let[t,e]=this.images;return 2===this.images.length&&(t?.url||e?.url)?this.renderSwapImages(t,e):t?.url&&!this.failedImageUrls.has(t.url)?this.renderSingleImage(t):t?.type==="NFT"?this.renderPlaceholderIcon("nftPlaceholder"):this.renderPlaceholderIcon("coinPlaceholder")}renderSwapImages(t,e){return a.html`<div class="swap-images-container">
      ${t?.url?this.renderImageOrFallback(t,"first",!0):null}
      ${e?.url?this.renderImageOrFallback(e,"last",!0):null}
    </div>`}renderSingleImage(t){return this.renderImageOrFallback(t,void 0,!1)}renderImageOrFallback(t,e,r=!1){return t.url?this.failedImageUrls.has(t.url)?r&&e?this.renderFallbackIconInContainer(e):this.renderFallbackIcon():a.html`<wui-image
      src=${t.url}
      alt="Transaction image"
      @onLoadError=${this.handleImageError(t.url)}
    ></wui-image>`:null}renderFallbackIconInContainer(t){return a.html`<div class="swap-fallback-container ${t}">${this.renderFallbackIcon()}</div>`}renderFallbackIcon(){return a.html`<wui-icon
      size="xl"
      weight="regular"
      color="default"
      name="networkPlaceholder"
    ></wui-icon>`}renderPlaceholderIcon(t){return a.html`<wui-icon size="xl" weight="regular" color="default" name=${t}></wui-icon>`}templateIcon(){let t,e="accent-primary";return(t=this.getIcon(),this.status&&(e=this.getStatusColor()),t)?a.html`
      <wui-flex alignItems="center" justifyContent="center" class="status-box">
        <wui-icon-box size="sm" color=${e} icon=${t}></wui-icon-box>
      </wui-flex>
    `:null}getDirectionIcon(){switch(this.direction){case"in":return"arrowBottom";case"out":return"arrowTop";default:return}}getIcon(){return this.onlyDirectionIcon?this.getDirectionIcon():"trade"===this.type?"swapHorizontal":"approve"===this.type?"checkmark":"cancel"===this.type?"close":this.getDirectionIcon()}getStatusColor(){switch(this.status){case"confirmed":return"success";case"failed":return"error";case"pending":return"inverse";default:return"accent-primary"}}};C.styles=[O],_([(0,n.property)()],C.prototype,"type",void 0),_([(0,n.property)()],C.prototype,"status",void 0),_([(0,n.property)()],C.prototype,"direction",void 0),_([(0,n.property)({type:Boolean})],C.prototype,"onlyDirectionIcon",void 0),_([(0,n.property)({type:Array})],C.prototype,"images",void 0),_([(0,n.property)({type:Object})],C.prototype,"secondImage",void 0),_([(0,s.state)()],C.prototype,"failedImageUrls",void 0),C=_([(0,T.customElement)("wui-transaction-visual")],C);let z=I.css`
  :host {
    width: 100%;
  }

  :host > wui-flex:first-child {
    align-items: center;
    column-gap: ${({spacing:t})=>t[2]};
    padding: ${({spacing:t})=>t[1]} ${({spacing:t})=>t[2]};
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
`;var M=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let A=class extends j.LitElement{constructor(){super(...arguments),this.type="approve",this.onlyDirectionIcon=!1,this.images=[]}render(){return a.html`
      <wui-flex>
        <wui-transaction-visual
          .status=${this.status}
          direction=${(0,P.ifDefined)(this.direction)}
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
    `}templateDescription(){let t=this.descriptions?.[0];return t?a.html`
          <wui-text variant="md-regular" color="secondary">
            <span>${t}</span>
          </wui-text>
        `:null}templateSecondDescription(){let t=this.descriptions?.[1];return t?a.html`
          <wui-icon class="description-separator-icon" size="sm" name="arrowRight"></wui-icon>
          <wui-text variant="md-regular" color="secondary">
            <span>${t}</span>
          </wui-text>
        `:null}};A.styles=[D.resetStyles,z],M([(0,n.property)()],A.prototype,"type",void 0),M([(0,n.property)({type:Array})],A.prototype,"descriptions",void 0),M([(0,n.property)()],A.prototype,"date",void 0),M([(0,n.property)({type:Boolean})],A.prototype,"onlyDirectionIcon",void 0),M([(0,n.property)()],A.prototype,"status",void 0),M([(0,n.property)()],A.prototype,"direction",void 0),M([(0,n.property)({type:Array})],A.prototype,"images",void 0),A=M([(0,T.customElement)("wui-transaction-list-item")],A);var R=i;t.i(64576),t.i(73944);var E=i;let F=I.css`
  wui-flex {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t[128]};
  }

  .fallback-icon {
    color: ${({tokens:t})=>t.theme.iconInverse};
    border-radius: ${({borderRadius:t})=>t[3]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  .direction-icon,
  .status-image {
    position: absolute;
    right: 0;
    bottom: 0;
    border-radius: ${({borderRadius:t})=>t[128]};
    border: 2px solid ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  .direction-icon {
    padding: ${({spacing:t})=>t["01"]};
    color: ${({tokens:t})=>t.core.iconSuccess};

    background-color: color-mix(
      in srgb,
      ${({tokens:t})=>t.core.textSuccess} 30%,
      ${({tokens:t})=>t.theme.backgroundPrimary} 70%
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
    padding: ${({spacing:t})=>t[1]};
  }

  :host([data-size='lg']) .fallback-icon {
    height: 32px;
    width: 32px;
    padding: ${({spacing:t})=>t[1]};
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
`;var L=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let q={sm:"xxs",lg:"md"},U=class extends E.LitElement{constructor(){super(...arguments),this.type="approve",this.size="lg",this.statusImageUrl="",this.images=[]}render(){return a.html`<wui-flex>${this.templateVisual()} ${this.templateIcon()}</wui-flex>`}templateVisual(){switch(this.dataset.size=this.size,this.type){case"trade":return this.swapTemplate();case"fiat":return this.fiatTemplate();case"unknown":return this.unknownTemplate();default:return this.tokenTemplate()}}swapTemplate(){let[t,e]=this.images;return 2===this.images.length&&(t||e)?a.html`
        <wui-image class="swap-crop-left-image" src=${t} alt="Swap image"></wui-image>
        <wui-image class="swap-crop-right-image" src=${e} alt="Swap image"></wui-image>
      `:t?a.html`<wui-image src=${t} alt="Swap image"></wui-image>`:null}fiatTemplate(){return a.html`<wui-icon
      class="fallback-icon"
      size=${q[this.size]}
      name="dollar"
    ></wui-icon>`}unknownTemplate(){return a.html`<wui-icon
      class="fallback-icon"
      size=${q[this.size]}
      name="questionMark"
    ></wui-icon>`}tokenTemplate(){let[t]=this.images;return t?a.html`<wui-image src=${t} alt="Token image"></wui-image> `:a.html`<wui-icon
      class="fallback-icon"
      name=${"nft"===this.type?"image":"coinPlaceholder"}
    ></wui-icon>`}templateIcon(){return this.statusImageUrl?a.html`<wui-image
        class="status-image"
        src=${this.statusImageUrl}
        alt="Status image"
      ></wui-image>`:a.html`<wui-icon
      class="direction-icon"
      size=${q[this.size]}
      name=${this.getTemplateIcon()}
    ></wui-icon>`}getTemplateIcon(){return"trade"===this.type?"arrowClockWise":"arrowBottom"}};U.styles=[F],L([(0,n.property)()],U.prototype,"type",void 0),L([(0,n.property)()],U.prototype,"size",void 0),L([(0,n.property)()],U.prototype,"statusImageUrl",void 0),L([(0,n.property)({type:Array})],U.prototype,"images",void 0),U=L([(0,T.customElement)("wui-transaction-thumbnail")],U);let N=I.css`
  :host > wui-flex:first-child {
    gap: ${({spacing:t})=>t[2]};
    padding: ${({spacing:t})=>t[3]};
    width: 100%;
  }

  wui-flex {
    display: flex;
    flex: 1;
  }
`,B=class extends R.LitElement{render(){return a.html`
      <wui-flex alignItems="center" .padding=${["1","2","1","2"]}>
        <wui-shimmer width="40px" height="40px" rounded></wui-shimmer>
        <wui-flex flexDirection="column" gap="1">
          <wui-shimmer width="124px" height="16px" rounded></wui-shimmer>
          <wui-shimmer width="60px" height="14px" rounded></wui-shimmer>
        </wui-flex>
        <wui-shimmer width="24px" height="12px" rounded></wui-shimmer>
      </wui-flex>
    `}};B.styles=[D.resetStyles,N],B=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s}([(0,T.customElement)("wui-transaction-list-item-loader")],B);var Y=t.i(79484);let H=I.css`
  :host {
    min-height: 100%;
  }

  .group-container[last-group='true'] {
    padding-bottom: ${({spacing:t})=>t["3"]};
  }

  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:t})=>t["3"]};
  }

  .contentContainer > .textContent {
    width: 65%;
  }

  .emptyContainer {
    height: 100%;
  }
`;var W=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let V="last-transaction",G=class extends i.LitElement{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.page="activity",this.caipAddress=p.ChainController.state.activeCaipAddress,this.transactionsByYear=v.TransactionsController.state.transactionsByYear,this.loading=v.TransactionsController.state.loading,this.empty=v.TransactionsController.state.empty,this.next=v.TransactionsController.state.next,v.TransactionsController.clearCursor(),this.unsubscribe.push(p.ChainController.subscribeKey("activeCaipAddress",t=>{t&&this.caipAddress!==t&&(v.TransactionsController.resetTransactions(),v.TransactionsController.fetchTransactions(t)),this.caipAddress=t}),p.ChainController.subscribeKey("activeCaipNetwork",()=>{this.updateTransactionView()}),v.TransactionsController.subscribe(t=>{this.transactionsByYear=t.transactionsByYear,this.loading=t.loading,this.empty=t.empty,this.next=t.next}))}firstUpdated(){this.updateTransactionView(),this.createPaginationObserver()}updated(){this.setPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return a.html` ${this.empty?null:this.templateTransactionsByYear()}
    ${this.loading?this.templateLoading():null}
    ${!this.loading&&this.empty?this.templateEmpty():null}`}updateTransactionView(){v.TransactionsController.resetTransactions(),this.caipAddress&&v.TransactionsController.fetchTransactions(m.CoreHelperUtil.getPlainAddress(this.caipAddress))}templateTransactionsByYear(){return Object.keys(this.transactionsByYear).sort().reverse().map(t=>{let e=parseInt(t,10),r=Array(12).fill(null).map((t,r)=>({groupTitle:k.getTransactionGroupTitle(e,r),transactions:this.transactionsByYear[e]?.[r]})).filter(({transactions:t})=>t).reverse();return r.map(({groupTitle:t,transactions:e},i)=>{let n=i===r.length-1;return e?a.html`
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
                ${t}
              </wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="2">
              ${this.templateTransactions(e,n)}
            </wui-flex>
          </wui-flex>
        `:null})})}templateRenderTransaction(t,e){let{date:r,descriptions:i,direction:n,images:s,status:o,type:l,transfers:c,isAllNFT:u}=this.getTransactionListItemProps(t);return a.html`
      <wui-transaction-list-item
        date=${r}
        .direction=${n}
        id=${e&&this.next?V:""}
        status=${o}
        type=${l}
        .images=${s}
        .onlyDirectionIcon=${u||1===c.length}
        .descriptions=${i}
      ></wui-transaction-list-item>
    `}templateTransactions(t,e){return t.map((r,i)=>{let n=e&&i===t.length-1;return a.html`${this.templateRenderTransaction(r,n)}`})}emptyStateActivity(){return a.html`<wui-flex
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
          ${Array(7).fill(a.html` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `).map(t=>t)}
        </wui-flex>
      </wui-flex>`:null}onReceiveClick(){y.RouterController.push("WalletReceive")}createPaginationObserver(){let{projectId:t}=g.OptionsController.state;this.paginationObserver=new IntersectionObserver(([e])=>{e?.isIntersecting&&!this.loading&&(v.TransactionsController.fetchTransactions(m.CoreHelperUtil.getPlainAddress(this.caipAddress)),f.EventsController.sendEvent({type:"track",event:"LOAD_MORE_TRANSACTIONS",properties:{address:m.CoreHelperUtil.getPlainAddress(this.caipAddress),projectId:t,cursor:this.next,isSmartAccount:(0,w.getPreferredAccountType)(p.ChainController.state.activeChain)===Y.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}))},{}),this.setPaginationObserver()}setPaginationObserver(){this.paginationObserver?.disconnect();let t=this.shadowRoot?.querySelector(`#${V}`);t&&this.paginationObserver?.observe(t)}getTransactionListItemProps(t){let e=((t,e="DD MMM")=>(0,o.default)(t).format(e))(t?.metadata?.minedAt),r=k.mergeTransfers(t?.transfers||[]),i=k.getTransactionDescriptions(t,r),a=r?.[0],n=!!a&&r?.every(t=>!!t.nft_info),s=k.getTransactionImages(r);return{date:e,direction:a?.direction,descriptions:i,isAllNFT:n,images:s,status:t.metadata?.status,transfers:r,type:t.metadata?.operationType}}};G.styles=H,W([(0,n.property)()],G.prototype,"page",void 0),W([(0,s.state)()],G.prototype,"caipAddress",void 0),W([(0,s.state)()],G.prototype,"transactionsByYear",void 0),W([(0,s.state)()],G.prototype,"loading",void 0),W([(0,s.state)()],G.prototype,"empty",void 0),W([(0,s.state)()],G.prototype,"next",void 0),G=W([(0,T.customElement)("w3m-activity-list")],G),t.s([],89676)},58323,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(4041);var i=t.i(45975);t.i(62238),t.i(89676);var a=t.i(15193);let n=a.css`
  :host > wui-flex:first-child {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }
`,s=class extends e.LitElement{render(){return r.html`
      <wui-flex flexDirection="column" .padding=${["0","3","3","3"]} gap="3">
        <w3m-activity-list page="activity"></w3m-activity-list>
      </wui-flex>
    `}};s.styles=n,s=function(t,e,r,i){var a,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(s=(n<3?a(s):n>3?a(e,r,s):a(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s}([(0,i.customElement)("w3m-transactions-view")],s),t.s(["W3mTransactionsView",0,s],45336),t.s([],85877),t.i(85877),t.i(45336),t.s(["W3mTransactionsView",0,s],58323)},82012,t=>{t.v(e=>Promise.all(["static/chunks/04ico-_gjm27w.js"].map(e=>t.l(e))).then(()=>e(96403)))},40171,t=>{t.v(e=>Promise.all(["static/chunks/11v3m7g373ehs.js"].map(e=>t.l(e))).then(()=>e(69592)))},10729,t=>{t.v(e=>Promise.all(["static/chunks/0xc5ogy.4cqt6.js"].map(e=>t.l(e))).then(()=>e(86977)))},80342,t=>{t.v(e=>Promise.all(["static/chunks/0_mewu7cnpsno.js"].map(e=>t.l(e))).then(()=>e(32833)))},95724,t=>{t.v(e=>Promise.all(["static/chunks/11wkp7hpvh7tf.js"].map(e=>t.l(e))).then(()=>e(72412)))},52792,t=>{t.v(e=>Promise.all(["static/chunks/0g3ui2wv8r~wc.js"].map(e=>t.l(e))).then(()=>e(26763)))},96302,t=>{t.v(e=>Promise.all(["static/chunks/0j0k6c8ggdklr.js"].map(e=>t.l(e))).then(()=>e(43229)))},44243,t=>{t.v(e=>Promise.all(["static/chunks/07wddbwvy22f0.js"].map(e=>t.l(e))).then(()=>e(12721)))},59668,t=>{t.v(e=>Promise.all(["static/chunks/09ba7-_iffhw0.js"].map(e=>t.l(e))).then(()=>e(36682)))},41373,t=>{t.v(e=>Promise.all(["static/chunks/10gk0blv0it_k.js"].map(e=>t.l(e))).then(()=>e(51383)))},69595,t=>{t.v(e=>Promise.all(["static/chunks/0bta-jrs6~00o.js"].map(e=>t.l(e))).then(()=>e(4289)))},33052,t=>{t.v(e=>Promise.all(["static/chunks/0762bbcc5~n~v.js"].map(e=>t.l(e))).then(()=>e(56357)))},280,t=>{t.v(e=>Promise.all(["static/chunks/0zft.mxso0wdv.js"].map(e=>t.l(e))).then(()=>e(78319)))},92833,t=>{t.v(e=>Promise.all(["static/chunks/0tdapn46a87b2.js"].map(e=>t.l(e))).then(()=>e(61289)))},17096,t=>{t.v(e=>Promise.all(["static/chunks/0oeos-plb2q06.js"].map(e=>t.l(e))).then(()=>e(26703)))},5963,t=>{t.v(e=>Promise.all(["static/chunks/0vhj_1cq1owug.js"].map(e=>t.l(e))).then(()=>e(9953)))},48774,t=>{t.v(e=>Promise.all(["static/chunks/0vm3duhzxw-u2.js"].map(e=>t.l(e))).then(()=>e(32295)))},50090,t=>{t.v(e=>Promise.all(["static/chunks/12wk3fvygoqg~.js"].map(e=>t.l(e))).then(()=>e(52019)))},38711,t=>{t.v(e=>Promise.all(["static/chunks/1408kbi9bcza3.js"].map(e=>t.l(e))).then(()=>e(64871)))},50621,t=>{t.v(e=>Promise.all(["static/chunks/0881hmc9re8px.js"].map(e=>t.l(e))).then(()=>e(59021)))},5462,t=>{t.v(e=>Promise.all(["static/chunks/04f2_hmveaqeu.js"].map(e=>t.l(e))).then(()=>e(65788)))},70963,t=>{t.v(e=>Promise.all(["static/chunks/0zhiq_0493.r0.js"].map(e=>t.l(e))).then(()=>e(17729)))},56906,t=>{t.v(e=>Promise.all(["static/chunks/0o7t79qo-g.qk.js"].map(e=>t.l(e))).then(()=>e(34056)))},78023,t=>{t.v(e=>Promise.all(["static/chunks/0p-trm74a~_nw.js"].map(e=>t.l(e))).then(()=>e(71507)))},69039,t=>{t.v(e=>Promise.all(["static/chunks/015dz_0fuvoul.js"].map(e=>t.l(e))).then(()=>e(2658)))},63605,t=>{t.v(e=>Promise.all(["static/chunks/0jt_ui_som86b.js"].map(e=>t.l(e))).then(()=>e(39621)))},42324,t=>{t.v(e=>Promise.all(["static/chunks/16ae95zbkbei2.js"].map(e=>t.l(e))).then(()=>e(11923)))},84968,t=>{t.v(e=>Promise.all(["static/chunks/139-5-~k-a9_a.js"].map(e=>t.l(e))).then(()=>e(74571)))},44020,t=>{t.v(e=>Promise.all(["static/chunks/0sj204xziysfx.js"].map(e=>t.l(e))).then(()=>e(84535)))},50711,t=>{t.v(e=>Promise.all(["static/chunks/0mb5g5c08bg3_.js"].map(e=>t.l(e))).then(()=>e(15680)))},56601,t=>{t.v(e=>Promise.all(["static/chunks/04ao4kqg7-71z.js"].map(e=>t.l(e))).then(()=>e(1958)))},81254,t=>{t.v(e=>Promise.all(["static/chunks/0ylfzksb.ysq3.js"].map(e=>t.l(e))).then(()=>e(11420)))},79893,t=>{t.v(e=>Promise.all(["static/chunks/11vp.ou5.wgk..js"].map(e=>t.l(e))).then(()=>e(52452)))},1514,t=>{t.v(e=>Promise.all(["static/chunks/15_vj4ft3pkw2.js"].map(e=>t.l(e))).then(()=>e(35252)))},44980,t=>{t.v(e=>Promise.all(["static/chunks/0abw.we2fvq85.js"].map(e=>t.l(e))).then(()=>e(80835)))},84074,t=>{t.v(e=>Promise.all(["static/chunks/0qu2ipod_3dre.js"].map(e=>t.l(e))).then(()=>e(94301)))},67422,t=>{t.v(e=>Promise.all(["static/chunks/0trdrklutxs6s.js"].map(e=>t.l(e))).then(()=>e(89931)))},13200,t=>{t.v(e=>Promise.all(["static/chunks/0wufvuse0m1df.js"].map(e=>t.l(e))).then(()=>e(69097)))},48479,t=>{t.v(e=>Promise.all(["static/chunks/039hmx6plo.3u.js"].map(e=>t.l(e))).then(()=>e(88299)))},67369,t=>{t.v(e=>Promise.all(["static/chunks/0avogfle0agse.js"].map(e=>t.l(e))).then(()=>e(66712)))},77793,t=>{t.v(e=>Promise.all(["static/chunks/0xub8so4d47.0.js"].map(e=>t.l(e))).then(()=>e(71960)))},4447,t=>{t.v(e=>Promise.all(["static/chunks/144lv8k~l5496.js"].map(e=>t.l(e))).then(()=>e(65425)))},93690,t=>{t.v(e=>Promise.all(["static/chunks/0acgxj--f7i8u.js"].map(e=>t.l(e))).then(()=>e(65891)))},77385,t=>{t.v(e=>Promise.all(["static/chunks/0qk6uu2q1tw_v.js"].map(e=>t.l(e))).then(()=>e(84131)))},65739,t=>{t.v(e=>Promise.all(["static/chunks/12lr98o1.yd7g.js"].map(e=>t.l(e))).then(()=>e(9900)))},80304,t=>{t.v(e=>Promise.all(["static/chunks/10lvb6.5.uxa9.js"].map(e=>t.l(e))).then(()=>e(45017)))},9957,t=>{t.v(e=>Promise.all(["static/chunks/0.7amhpjej0na.js"].map(e=>t.l(e))).then(()=>e(44919)))},22236,t=>{t.v(e=>Promise.all(["static/chunks/0z~mfwxrvgs-s.js"].map(e=>t.l(e))).then(()=>e(6501)))},40934,t=>{t.v(e=>Promise.all(["static/chunks/0c.ugbg-cm92~.js"].map(e=>t.l(e))).then(()=>e(13559)))},71802,t=>{t.v(e=>Promise.all(["static/chunks/0u00gqq-1y.-7.js"].map(e=>t.l(e))).then(()=>e(94384)))},57792,t=>{t.v(e=>Promise.all(["static/chunks/0l23c_y.nej82.js"].map(e=>t.l(e))).then(()=>e(76208)))},7885,t=>{t.v(e=>Promise.all(["static/chunks/047hyf3ib.ncs.js"].map(e=>t.l(e))).then(()=>e(56529)))}]);