(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,46650,e=>{"use strict";e.i(12190),e.s([])},84326,65090,e=>{"use strict";var t=e.i(54479);let{I:o}=t._$LH;var r=e.i(91909);let i=(e,t)=>{let o=e._$AN;if(void 0===o)return!1;for(let e of o)e._$AO?.(t,!1),i(e,t);return!0},s=e=>{let t,o;do{if(void 0===(t=e._$AM))break;(o=t._$AN).delete(e),e=t}while(0===o?.size)},a=e=>{for(let t;t=e._$AM;e=t){let o=t._$AN;if(void 0===o)t._$AN=o=new Set;else if(o.has(e))break;o.add(e),c(t)}};function n(e){void 0!==this._$AN?(s(this),this._$AM=e,a(this)):this._$AM=e}function l(e,t=!1,o=0){let r=this._$AH,a=this._$AN;if(void 0!==a&&0!==a.size)if(t)if(Array.isArray(r))for(let e=o;e<r.length;e++)i(r[e],!1),s(r[e]);else null!=r&&(i(r,!1),s(r));else i(this,e)}let c=e=>{e.type==r.PartType.CHILD&&(e._$AP??=l,e._$AQ??=n)};class d extends r.Directive{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,o){super._$AT(e,t,o),a(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(i(this,e),s(this))}setValue(e){if(void 0===this._$Ct.strings)this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}class h{}let u=new WeakMap,p=(0,r.directive)(class extends d{render(e){return t.nothing}update(e,[o]){let r=o!==this.G;return r&&void 0!==this.G&&this.rt(void 0),(r||this.lt!==this.ct)&&(this.G=o,this.ht=e.options?.host,this.rt(this.ct=e.element)),t.nothing}rt(e){if(this.isConnected||(e=void 0),"function"==typeof this.G){let t=this.ht??globalThis,o=u.get(t);void 0===o&&(o=new WeakMap,u.set(t,o)),void 0!==o.get(this.G)&&this.G.call(this.ht,void 0),o.set(this.G,e),void 0!==e&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return"function"==typeof this.G?u.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});e.s(["createRef",0,()=>new h,"ref",0,p],65090),e.s([],84326)},34051,29389,e=>{"use strict";var t=e.i(54479);e.s(["ifDefined",0,e=>e??t.nothing],29389),e.s([],34051)},64380,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(20119);e.i(34051);var i=e.i(29389),s=e.i(59088),a=e.i(45975),n=e.i(62611);let l=n.css`
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
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-boxed='true']) img {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[16]};
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
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:e})=>e[16]};
  }
`;var c=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let d=class extends t.LitElement{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let e={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?o.html`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?o.html`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:o.html`<img src=${(0,i.ifDefined)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};d.styles=[s.resetStyles,l],c([(0,r.property)()],d.prototype,"src",void 0),c([(0,r.property)()],d.prototype,"logo",void 0),c([(0,r.property)()],d.prototype,"icon",void 0),c([(0,r.property)()],d.prototype,"iconColor",void 0),c([(0,r.property)()],d.prototype,"alt",void 0),c([(0,r.property)()],d.prototype,"size",void 0),c([(0,r.property)({type:Boolean})],d.prototype,"boxed",void 0),c([(0,r.property)({type:Boolean})],d.prototype,"rounded",void 0),c([(0,r.property)({type:Boolean})],d.prototype,"fullSize",void 0),d=c([(0,a.customElement)("wui-image")],d),e.s([],64380)},83227,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(20119),i=e.i(62611),s=e.i(59088),a=e.i(45975),n=e.i(15193);let l=n.css`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 1.4s linear infinite;
    color: var(--local-color);
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`;var c=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let d=class extends t.LitElement{constructor(){super(...arguments),this.color="primary",this.size="lg"}render(){let e={primary:i.vars.tokens.theme.textPrimary,secondary:i.vars.tokens.theme.textSecondary,tertiary:i.vars.tokens.theme.textTertiary,invert:i.vars.tokens.theme.textInvert,error:i.vars.tokens.core.textError,warning:i.vars.tokens.core.textWarning,"accent-primary":i.vars.tokens.core.textAccentPrimary};return this.style.cssText=`
      --local-color: ${"inherit"===this.color?"inherit":e[this.color]};
      `,this.dataset.size=this.size,o.html`<svg viewBox="0 0 16 17" fill="none">
      <path
        d="M8.75 2.65625V4.65625C8.75 4.85516 8.67098 5.04593 8.53033 5.18658C8.38968 5.32723 8.19891 5.40625 8 5.40625C7.80109 5.40625 7.61032 5.32723 7.46967 5.18658C7.32902 5.04593 7.25 4.85516 7.25 4.65625V2.65625C7.25 2.45734 7.32902 2.26657 7.46967 2.12592C7.61032 1.98527 7.80109 1.90625 8 1.90625C8.19891 1.90625 8.38968 1.98527 8.53033 2.12592C8.67098 2.26657 8.75 2.45734 8.75 2.65625ZM14 7.90625H12C11.8011 7.90625 11.6103 7.98527 11.4697 8.12592C11.329 8.26657 11.25 8.45734 11.25 8.65625C11.25 8.85516 11.329 9.04593 11.4697 9.18658C11.6103 9.32723 11.8011 9.40625 12 9.40625H14C14.1989 9.40625 14.3897 9.32723 14.5303 9.18658C14.671 9.04593 14.75 8.85516 14.75 8.65625C14.75 8.45734 14.671 8.26657 14.5303 8.12592C14.3897 7.98527 14.1989 7.90625 14 7.90625ZM11.3588 10.9544C11.289 10.8846 11.2062 10.8293 11.115 10.7915C11.0239 10.7538 10.9262 10.7343 10.8275 10.7343C10.7288 10.7343 10.6311 10.7538 10.54 10.7915C10.4488 10.8293 10.366 10.8846 10.2963 10.9544C10.2265 11.0241 10.1711 11.107 10.1334 11.1981C10.0956 11.2893 10.0762 11.387 10.0762 11.4856C10.0762 11.5843 10.0956 11.682 10.1334 11.7731C10.1711 11.8643 10.2265 11.9471 10.2963 12.0169L11.7106 13.4312C11.8515 13.5721 12.0426 13.6513 12.2419 13.6513C12.4411 13.6513 12.6322 13.5721 12.7731 13.4312C12.914 13.2904 12.9932 13.0993 12.9932 12.9C12.9932 12.7007 12.914 12.5096 12.7731 12.3687L11.3588 10.9544ZM8 11.9062C7.80109 11.9062 7.61032 11.9853 7.46967 12.1259C7.32902 12.2666 7.25 12.4573 7.25 12.6562V14.6562C7.25 14.8552 7.32902 15.0459 7.46967 15.1866C7.61032 15.3272 7.80109 15.4062 8 15.4062C8.19891 15.4062 8.38968 15.3272 8.53033 15.1866C8.67098 15.0459 8.75 14.8552 8.75 14.6562V12.6562C8.75 12.4573 8.67098 12.2666 8.53033 12.1259C8.38968 11.9853 8.19891 11.9062 8 11.9062ZM4.64125 10.9544L3.22688 12.3687C3.08598 12.5096 3.00682 12.7007 3.00682 12.9C3.00682 13.0993 3.08598 13.2904 3.22688 13.4312C3.36777 13.5721 3.55887 13.6513 3.75813 13.6513C3.95738 13.6513 4.14848 13.5721 4.28937 13.4312L5.70375 12.0169C5.84465 11.876 5.9238 11.6849 5.9238 11.4856C5.9238 11.2864 5.84465 11.0953 5.70375 10.9544C5.56285 10.8135 5.37176 10.7343 5.1725 10.7343C4.97324 10.7343 4.78215 10.8135 4.64125 10.9544ZM4.75 8.65625C4.75 8.45734 4.67098 8.26657 4.53033 8.12592C4.38968 7.98527 4.19891 7.90625 4 7.90625H2C1.80109 7.90625 1.61032 7.98527 1.46967 8.12592C1.32902 8.26657 1.25 8.45734 1.25 8.65625C1.25 8.85516 1.32902 9.04593 1.46967 9.18658C1.61032 9.32723 1.80109 9.40625 2 9.40625H4C4.19891 9.40625 4.38968 9.32723 4.53033 9.18658C4.67098 9.04593 4.75 8.85516 4.75 8.65625ZM4.2875 3.88313C4.1466 3.74223 3.95551 3.66307 3.75625 3.66307C3.55699 3.66307 3.3659 3.74223 3.225 3.88313C3.0841 4.02402 3.00495 4.21512 3.00495 4.41438C3.00495 4.61363 3.0841 4.80473 3.225 4.94562L4.64125 6.35813C4.78215 6.49902 4.97324 6.57818 5.1725 6.57818C5.37176 6.57818 5.56285 6.49902 5.70375 6.35813C5.84465 6.21723 5.9238 6.02613 5.9238 5.82688C5.9238 5.62762 5.84465 5.43652 5.70375 5.29563L4.2875 3.88313Z"
        fill="currentColor"
      />
    </svg>`}};d.styles=[s.resetStyles,l],c([(0,r.property)()],d.prototype,"color",void 0),c([(0,r.property)()],d.prototype,"size",void 0),d=c([(0,a.customElement)("wui-loading-spinner")],d),e.s([],83227)},12190,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(20119);e.i(34051);var i=e.i(29389);e.i(52634);var s=e.i(59088),a=e.i(45975),n=e.i(62611);let l=n.css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({borderRadius:e})=>e[2]};
    padding: ${({spacing:e})=>e[1]} !important;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: relative;
  }

  :host([data-padding='2']) {
    padding: ${({spacing:e})=>e[2]} !important;
  }

  :host:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host > wui-icon {
    z-index: 10;
  }

  /* -- Colors --------------------------------------------------- */
  :host([data-color='accent-primary']) {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  :host([data-color='accent-primary']):after {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  :host([data-color='default']),
  :host([data-color='secondary']) {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  :host([data-color='default']):after {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-color='secondary']):after {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-color='success']) {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  :host([data-color='success']):after {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  :host([data-color='error']) {
    color: ${({tokens:e})=>e.core.iconError};
  }

  :host([data-color='error']):after {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  :host([data-color='warning']) {
    color: ${({tokens:e})=>e.core.iconWarning};
  }

  :host([data-color='warning']):after {
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  :host([data-color='inverse']) {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  :host([data-color='inverse']):after {
    background-color: transparent;
  }
`;var c=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let d=class extends t.LitElement{constructor(){super(...arguments),this.icon="copy",this.size="md",this.padding="1",this.color="default"}render(){return this.dataset.padding=this.padding,this.dataset.color=this.color,o.html`
      <wui-icon size=${(0,i.ifDefined)(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `}};d.styles=[s.resetStyles,s.elementStyles,l],c([(0,r.property)()],d.prototype,"icon",void 0),c([(0,r.property)()],d.prototype,"size",void 0),c([(0,r.property)()],d.prototype,"padding",void 0),c([(0,r.property)()],d.prototype,"color",void 0),d=c([(0,a.customElement)("wui-icon-box")],d),e.s([],12190)},34420,24947,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(20119);e.i(52634),e.i(83227),e.i(39009);var i=e.i(59088),s=e.i(45975),a=e.i(62611);let n=a.css`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({spacing:e})=>e[2]};
    transition:
      scale ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: scale, background-color, border-radius;
    cursor: pointer;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[2]};
    padding: 0 ${({spacing:e})=>e[2]};
    height: 28px;
  }

  button[data-size='md'] {
    border-radius: ${({borderRadius:e})=>e[3]};
    padding: 0 ${({spacing:e})=>e[4]};
    height: 38px;
  }

  button[data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: 0 ${({spacing:e})=>e[5]};
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent-primary'] {
    background-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='accent-secondary'] {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button[data-variant='neutral-primary'] {
    background-color: ${({tokens:e})=>e.theme.backgroundInvert};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='neutral-secondary'] {
    background-color: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  button[data-variant='neutral-tertiary'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  button[data-variant='error-primary'] {
    background-color: ${({tokens:e})=>e.core.textError};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({tokens:e})=>e.core.backgroundError};
    color: ${({tokens:e})=>e.core.textError};
  }

  button[data-variant='shade'] {
    background: var(--wui-color-gray-glass-002);
    color: var(--wui-color-fg-200);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-size='sm']:focus-visible:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:focus-visible:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:focus-visible:enabled {
    border-radius: 48px;
  }
  button[data-variant='shade']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button[data-size='sm']:hover:enabled {
      border-radius: 28px;
    }

    button[data-size='md']:hover:enabled {
      border-radius: 38px;
    }

    button[data-size='lg']:hover:enabled {
      border-radius: 48px;
    }

    button[data-variant='shade']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='shade']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }
  }

  button[data-size='sm']:active:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:active:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:active:enabled {
    border-radius: 48px;
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
  }
`;var l=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let c={lg:"lg-regular-mono",md:"md-regular-mono",sm:"sm-regular-mono"},d={lg:"md",md:"md",sm:"sm"},h=class extends t.LitElement{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="accent-primary"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
     `;let e=this.textVariant??c[this.size];return o.html`
      <button data-variant=${this.variant} data-size=${this.size} ?disabled=${this.disabled}>
        ${this.loadingTemplate()}
        <slot name="iconLeft"></slot>
        <wui-text variant=${e} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}loadingTemplate(){if(this.loading){let e=d[this.size],t="neutral-primary"===this.variant||"accent-primary"===this.variant?"invert":"primary";return o.html`<wui-loading-spinner color=${t} size=${e}></wui-loading-spinner>`}return null}};h.styles=[i.resetStyles,i.elementStyles,n],l([(0,r.property)()],h.prototype,"size",void 0),l([(0,r.property)({type:Boolean})],h.prototype,"disabled",void 0),l([(0,r.property)({type:Boolean})],h.prototype,"fullWidth",void 0),l([(0,r.property)({type:Boolean})],h.prototype,"loading",void 0),l([(0,r.property)()],h.prototype,"variant",void 0),l([(0,r.property)()],h.prototype,"textVariant",void 0),h=l([(0,s.customElement)("wui-button")],h),e.s([],24947),e.s([],34420)},43452,e=>{"use strict";e.i(52634),e.s([])},64576,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(20119),i=e.i(45975),s=e.i(62611);let a=s.css`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({tokens:e})=>e.theme.foregroundPrimary} 0%,
      ${({tokens:e})=>e.theme.foregroundSecondary} 50%,
      ${({tokens:e})=>e.theme.foregroundPrimary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;var n=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let l=class extends t.LitElement{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",o.html`<slot></slot>`}};l.styles=[a],n([(0,r.property)()],l.prototype,"width",void 0),n([(0,r.property)()],l.prototype,"height",void 0),n([(0,r.property)()],l.prototype,"variant",void 0),n([(0,r.property)({type:Boolean})],l.prototype,"rounded",void 0),l=n([(0,i.customElement)("wui-shimmer")],l),e.s([],64576)},80313,e=>{"use strict";e.i(64576),e.s([])},42904,e=>{"use strict";var t=e.i(47167);let o={ACCOUNT_TABS:[{label:"Tokens"},{label:"Activity"}],SECURE_SITE_ORIGIN:(void 0!==t.default&&void 0!==t.default.env?t.default.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org",VIEW_DIRECTION:{Next:"next",Prev:"prev"},ANIMATION_DURATIONS:{HeaderText:120,ModalHeight:150,ViewTransition:150},VIEWS_WITH_LEGAL_FOOTER:["Connect","ConnectWallets","OnRampTokenSelect","OnRampFiatSelect","OnRampProviders"],VIEWS_WITH_DEFAULT_FOOTER:["Networks"]};e.s(["ConstantsUtil",0,o])},55587,29084,95157,e=>{"use strict";var t=e.i(65801),o=e.i(42710);let r=(0,t.proxy)({isLegalCheckboxChecked:!1}),i={state:r,subscribe:e=>(0,t.subscribe)(r,()=>e(r)),subscribeKey:(e,t)=>(0,o.subscribeKey)(r,e,t),setIsLegalCheckboxChecked(e){r.isLegalCheckboxChecked=e}};e.s(["OptionsStateController",0,i],55587),e.i(12207);var s=e.i(8285),a=e.i(54479);e.i(74576);var n=e.i(56350),l=e.i(82283);e.i(4041);var c=e.i(45975),d=s,h=e.i(20119);e.i(34051);var u=e.i(29389);e.i(84326);var p=e.i(65090);e.i(52634),e.i(39009);var m=e.i(59088),g=e.i(62611);let v=g.css`
  label {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    column-gap: ${({spacing:e})=>e[2]};
  }

  label > input[type='checkbox'] {
    height: 0;
    width: 0;
    opacity: 0;
    position: absolute;
  }

  label > span {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    border: 1px solid ${({colors:e})=>e.neutrals400};
    color: ${({colors:e})=>e.white};
    background-color: transparent;
    will-change: border-color, background-color;
  }

  label > span > wui-icon {
    opacity: 0;
    will-change: opacity;
  }

  label > input[type='checkbox']:checked + span > wui-icon {
    color: ${({colors:e})=>e.white};
  }

  label > input[type='checkbox']:not(:checked) > span > wui-icon {
    color: ${({colors:e})=>e.neutrals900};
  }

  label > input[type='checkbox']:checked + span > wui-icon {
    opacity: 1;
  }

  /* -- Sizes --------------------------------------------------- */
  label[data-size='lg'] > span {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    border-radius: ${({borderRadius:e})=>e[10]};
  }

  label[data-size='md'] > span {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  label[data-size='sm'] > span {
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  /* -- Focus states --------------------------------------------------- */
  label > input[type='checkbox']:focus-visible + span,
  label > input[type='checkbox']:focus + span {
    border: 1px solid ${({tokens:e})=>e.core.borderAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  label > input[type='checkbox']:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
    border: 1px solid transparent;
  }

  /* -- Hover states --------------------------------------------------- */
  input[type='checkbox']:not(:checked):not(:disabled) + span:hover {
    border: 1px solid ${({colors:e})=>e.neutrals700};
    background-color: ${({colors:e})=>e.neutrals800};
    box-shadow: none;
  }

  input[type='checkbox']:checked:not(:disabled) + span:hover {
    border: 1px solid transparent;
    background-color: ${({colors:e})=>e.accent080};
    box-shadow: none;
  }

  /* -- Disabled state --------------------------------------------------- */
  label > input[type='checkbox']:checked:disabled + span {
    border: 1px solid transparent;
    opacity: 0.3;
  }

  label > input[type='checkbox']:not(:checked):disabled + span {
    border: 1px solid ${({colors:e})=>e.neutrals700};
  }

  label:has(input[type='checkbox']:disabled) {
    cursor: auto;
  }

  label > input[type='checkbox']:disabled + span {
    cursor: not-allowed;
  }
`;var b=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let f={lg:"md",md:"sm",sm:"sm"},y=class extends d.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,p.createRef)(),this.checked=void 0,this.disabled=!1,this.size="md"}render(){let e=f[this.size];return a.html`
      <label data-size=${this.size}>
        <input
          ${(0,p.ref)(this.inputElementRef)}
          ?checked=${(0,u.ifDefined)(this.checked)}
          ?disabled=${this.disabled}
          type="checkbox"
          @change=${this.dispatchChangeEvent}
        />
        <span>
          <wui-icon name="checkmarkBold" size=${e}></wui-icon>
        </span>
        <slot></slot>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("checkboxChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};y.styles=[m.resetStyles,v],b([(0,h.property)({type:Boolean})],y.prototype,"checked",void 0),b([(0,h.property)({type:Boolean})],y.prototype,"disabled",void 0),b([(0,h.property)()],y.prototype,"size",void 0),y=b([(0,c.customElement)("wui-checkbox")],y),e.i(49536);let w=g.css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  wui-checkbox {
    padding: ${({spacing:e})=>e["3"]};
  }
  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.theme.textSecondary};
    font-weight: 500;
  }
`;var C=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let x=class extends s.LitElement{constructor(){super(),this.unsubscribe=[],this.checked=i.state.isLegalCheckboxChecked,this.unsubscribe.push(i.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state,o=l.OptionsController.state.features?.legalCheckbox;return(e||t)&&o?a.html`
      <wui-checkbox
        ?checked=${this.checked}
        @checkboxChange=${this.onCheckboxChange.bind(this)}
        data-testid="wui-checkbox"
      >
        <wui-text color="secondary" variant="sm-regular" align="left">
          I agree to our ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
        </wui-text>
      </wui-checkbox>
    `:null}andTemplate(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state;return e&&t?"and":""}termsTemplate(){let{termsConditionsUrl:e}=l.OptionsController.state;return e?a.html`<a rel="noreferrer" target="_blank" href=${e}>terms of service</a>`:null}privacyTemplate(){let{privacyPolicyUrl:e}=l.OptionsController.state;return e?a.html`<a rel="noreferrer" target="_blank" href=${e}>privacy policy</a>`:null}onCheckboxChange(){i.setIsLegalCheckboxChecked(!this.checked)}};x.styles=[w],C([(0,n.state)()],x.prototype,"checked",void 0),x=C([(0,c.customElement)("w3m-legal-checkbox")],x),e.s([],29084);var k=s;let $=g.css`
  :host {
    display: block;
    width: 100px;
    height: 100px;
  }

  svg {
    width: 100px;
    height: 100px;
  }

  rect {
    fill: none;
    stroke: ${e=>e.colors.accent100};
    stroke-width: 3px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;var P=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let E=class extends k.LitElement{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){let e=this.radius>50?50:this.radius,t=36-e;return a.html`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${e}
          stroke-dasharray="${116+t} ${245+t}"
          stroke-dashoffset=${360+1.75*t}
        />
      </svg>
    `}};E.styles=[m.resetStyles,$],P([(0,h.property)({type:Number})],E.prototype,"radius",void 0),E=P([(0,c.customElement)("wui-loading-thumbnail")],E),e.s([],95157)},28182,96969,55934,e=>{"use strict";var t=e.i(65801),o=e.i(1564),r=e.i(60398),i=e.i(49454),s=e.i(53157),a=e.i(21728),n=e.i(11424),l=e.i(27302),c=e.i(58331);async function d(){a.RouterController.push("ConnectingFarcaster");let e=i.ConnectorController.getAuthConnector();if(e){let t=r.ChainController.getAccountData();if(!t?.farcasterUrl)try{let{url:t}=await e.provider.getFarcasterUri();r.ChainController.setAccountProp("farcasterUrl",t,r.ChainController.state.activeChain)}catch(e){a.RouterController.goBack(),n.SnackController.showError(e)}}}async function h(e){a.RouterController.push("ConnectingSocial");let d=i.ConnectorController.getAuthConnector(),h=null;try{let i=setTimeout(()=>{throw Error("Social login timed out. Please try again.")},45e3);if(d&&e){if(l.CoreHelperUtil.isTelegram()||(h=function(){try{return l.CoreHelperUtil.returnOpenHref(`${o.ConstantsUtil.SECURE_SITE_SDK_ORIGIN}/loading`,"popupWindow","width=600,height=800,scrollbars=yes")}catch(e){throw Error("Could not open social popup")}}()),h)r.ChainController.setAccountProp("socialWindow",(0,t.ref)(h),r.ChainController.state.activeChain);else if(!l.CoreHelperUtil.isTelegram())throw Error("Could not create social popup");let{uri:s}=await d.provider.getSocialRedirectUri({provider:e});if(!s)throw h?.close(),Error("Could not fetch the social redirect uri");if(h&&(h.location.href=s),l.CoreHelperUtil.isTelegram()){c.StorageUtil.setTelegramSocialProvider(e);let t=l.CoreHelperUtil.formatTelegramSocialLoginUrl(s);l.CoreHelperUtil.openHref(t,"_top")}clearTimeout(i)}}catch(o){h?.close();let t=l.CoreHelperUtil.parseError(o);n.SnackController.showError(t),s.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:e,message:t}})}}async function u(e){r.ChainController.setAccountProp("socialProvider",e,r.ChainController.state.activeChain),s.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_STARTED",properties:{provider:e}}),"farcaster"===e?await d():await h(e)}e.s(["executeSocialLogin",0,u],28182),e.i(12207);var p=e.i(8285),m=e.i(54479);e.i(74576);var g=e.i(20119);e.i(34051);var v=e.i(29389);e.i(39009);var b=e.i(59088),f=e.i(45975),y=p;e.i(52634);var w=e.i(62611);let C=w.css`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e["20"]};
    overflow: hidden;
  }

  wui-icon {
    width: 100%;
    height: 100%;
  }
`;var x=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let k=class extends y.LitElement{constructor(){super(...arguments),this.logo="google"}render(){return m.html`<wui-icon color="inherit" size="inherit" name=${this.logo}></wui-icon> `}};k.styles=[b.resetStyles,C],x([(0,g.property)()],k.prototype,"logo",void 0),k=x([(0,f.customElement)("wui-logo")],k),e.s([],96969);let $=w.css`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    text-transform: capitalize;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var P=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let E=class extends p.LitElement{constructor(){super(...arguments),this.logo="google",this.name="Continue with google",this.disabled=!1}render(){return m.html`
      <button ?disabled=${this.disabled} tabindex=${(0,v.ifDefined)(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          <wui-image ?boxed=${!0} logo=${this.logo}></wui-image>
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}};E.styles=[b.resetStyles,b.elementStyles,$],P([(0,g.property)()],E.prototype,"logo",void 0),P([(0,g.property)()],E.prototype,"name",void 0),P([(0,g.property)()],E.prototype,"tabIdx",void 0),P([(0,g.property)({type:Boolean})],E.prototype,"disabled",void 0),E=P([(0,f.customElement)("wui-list-social")],E),e.s([],55934)},63166,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(56350);e.i(34051);var i=e.i(29389),s=e.i(82283),a=e.i(55587);e.i(4041);var n=e.i(45975);e.i(62238),e.i(29084);var l=t,c=e.i(20119),d=e.i(51887),h=e.i(86259),u=e.i(49454),p=e.i(60334),m=e.i(21728),g=e.i(28182),v=e.i(27302);e.i(55934);var b=e.i(42991),f=e.i(62611);let y=f.css`
  :host {
    margin-top: ${({spacing:e})=>e["1"]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1)
      ${({spacing:e})=>e["2"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`;var w=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let C=class extends l.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=u.ConnectorController.state.connectors,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.remoteFeatures=s.OptionsController.state.remoteFeatures,this.isPwaLoading=!1,this.hasExceededUsageLimit=h.ApiController.state.plan.hasExceededUsageLimit,this.unsubscribe.push(u.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>"AUTH"===e.type)}),s.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}connectedCallback(){super.connectedCallback(),this.handlePwaFrameLoad()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.remoteFeatures?.socials||[],t=!!this.authConnector,r=e?.length,i="ConnectSocials"===m.RouterController.state.view;return t&&r||i?(i&&!r&&(e=p.ConstantsUtil.DEFAULT_SOCIALS),o.html` <wui-flex flexDirection="column" gap="2">
      ${e.map(e=>o.html`<wui-list-social
            @click=${()=>{this.onSocialClick(e)}}
            data-testid=${`social-selector-${e}`}
            name=${e}
            logo=${e}
            ?disabled=${this.isPwaLoading}
          ></wui-list-social>`)}
    </wui-flex>`):null}async onSocialClick(e){this.hasExceededUsageLimit?m.RouterController.push("UsageExceeded"):e&&await (0,g.executeSocialLogin)(e)}async handlePwaFrameLoad(){if(v.CoreHelperUtil.isPWA()){this.isPwaLoading=!0;try{this.authConnector?.provider instanceof b.W3mFrameProvider&&await this.authConnector.provider.init()}catch(e){d.AlertController.open({displayMessage:"Error loading embedded wallet in PWA",debugMessage:e.message},"error")}finally{this.isPwaLoading=!1}}}};C.styles=y,w([(0,c.property)()],C.prototype,"tabIdx",void 0),w([(0,r.state)()],C.prototype,"connectors",void 0),w([(0,r.state)()],C.prototype,"authConnector",void 0),w([(0,r.state)()],C.prototype,"remoteFeatures",void 0),w([(0,r.state)()],C.prototype,"isPwaLoading",void 0),w([(0,r.state)()],C.prototype,"hasExceededUsageLimit",void 0),C=w([(0,n.customElement)("w3m-social-login-list")],C);let x=f.css`
  wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    transition: opacity ${({durations:e})=>e.md}
      ${({easings:e})=>e["ease-out-power-1"]};
    will-change: opacity;
  }

  wui-flex::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`;var k=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let $=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.checked=a.OptionsStateController.state.isLegalCheckboxChecked,this.unsubscribe.push(a.OptionsStateController.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=s.OptionsController.state,r=s.OptionsController.state.features?.legalCheckbox,a=!!(e||t)&&!!r&&!this.checked;return o.html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","3","3","3"]}
        gap="01"
        class=${(0,i.ifDefined)(a?"disabled":void 0)}
      >
        <w3m-social-login-list tabIdx=${(0,i.ifDefined)(a?-1:void 0)}></w3m-social-login-list>
      </wui-flex>
    `}};$.styles=x,k([(0,r.state)()],$.prototype,"checked",void 0),$=k([(0,n.customElement)("w3m-connect-socials-view")],$),e.s(["W3mConnectSocialsView",0,$],97802);var P=t,E=e.i(60398),j=e.i(71080),S=e.i(53157),O=e.i(3468),R=e.i(11424),_=e.i(58331),L=e.i(39403);e.i(46650),e.i(95157),e.i(96969),e.i(49536);var A=e.i(35568),T=e.i(42904);let z=f.css`
  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: ${({borderRadius:e})=>e["8"]};
  }
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }
  wui-flex:first-child:not(:only-child) {
    position: relative;
  }
  wui-loading-thumbnail {
    position: absolute;
  }
  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e["1"]} * -1);
    bottom: calc(${({spacing:e})=>e["1"]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition: all ${({easings:e})=>e["ease-out-power-2"]}
      ${({durations:e})=>e.lg};
  }
  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e["4"]};
  }
  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }
  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e["ease-out-power-2"]} both;
  }
  .capitalize {
    text-transform: capitalize;
  }
`;var I=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let U=class extends P.LitElement{constructor(){super(),this.unsubscribe=[],this.socialProvider=E.ChainController.getAccountData()?.socialProvider,this.socialWindow=E.ChainController.getAccountData()?.socialWindow,this.error=!1,this.connecting=!1,this.message="Connect in the provider window",this.remoteFeatures=s.OptionsController.state.remoteFeatures,this.address=E.ChainController.getAccountData()?.address,this.connectionsByNamespace=j.ConnectionController.getConnections(E.ChainController.state.activeChain),this.hasMultipleConnections=this.connectionsByNamespace.length>0,this.authConnector=u.ConnectorController.getAuthConnector(),this.handleSocialConnection=async e=>{if(e.data?.resultUri)if(e.origin===T.ConstantsUtil.SECURE_SITE_ORIGIN){window.removeEventListener("message",this.handleSocialConnection,!1);try{if(this.authConnector&&!this.connecting){this.connecting=!0;let t=this.parseURLError(e.data.resultUri);if(t)return void this.handleSocialError(t);this.closeSocialWindow(),this.updateMessage();let o=e.data.resultUri;this.socialProvider&&S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_REQUEST_USER_DATA",properties:{provider:this.socialProvider}}),await j.ConnectionController.connectExternal({id:this.authConnector.id,type:this.authConnector.type,socialUri:o},this.authConnector.chain),this.socialProvider&&(_.StorageUtil.setConnectedSocialProvider(this.socialProvider),S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_SUCCESS",properties:{provider:this.socialProvider}}))}}catch(e){this.error=!0,this.updateMessage(),this.socialProvider&&S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:this.socialProvider,message:v.CoreHelperUtil.parseError(e)}})}}else m.RouterController.goBack(),R.SnackController.showError("Untrusted Origin"),this.socialProvider&&S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:this.socialProvider,message:"Untrusted Origin"}})},A.ErrorUtil.EmbeddedWalletAbortController.signal.addEventListener("abort",()=>{this.closeSocialWindow()}),this.unsubscribe.push(E.ChainController.subscribeChainProp("accountState",e=>{if(e&&(this.socialProvider=e.socialProvider,e.socialWindow&&(this.socialWindow=e.socialWindow),e.address)){let t=this.remoteFeatures?.multiWallet;e.address!==this.address&&(this.hasMultipleConnections&&t?(m.RouterController.replace("ProfileWallets"),R.SnackController.showSuccess("New Wallet Added"),this.address=e.address):(O.ModalController.state.open||s.OptionsController.state.enableEmbedded)&&O.ModalController.close())}}),s.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e})),this.authConnector&&this.connectSocial()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),window.removeEventListener("message",this.handleSocialConnection,!1),E.ChainController.state.activeCaipAddress||!this.socialProvider||this.connecting||S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_CANCELED",properties:{provider:this.socialProvider}}),this.closeSocialWindow()}render(){return o.html`
      <wui-flex
        data-error=${(0,i.ifDefined)(this.error)}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo=${(0,i.ifDefined)(this.socialProvider)}></wui-logo>
          ${this.error?null:this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary"
            >Log in with
            <span class="capitalize">${this.socialProvider??"Social"}</span></wui-text
          >
          <wui-text align="center" variant="lg-regular" color=${this.error?"error":"secondary"}
            >${this.message}</wui-text
          ></wui-flex
        >
      </wui-flex>
    `}loaderTemplate(){let e=L.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return o.html`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}parseURLError(e){try{let t="error=",o=e.indexOf(t);if(-1===o)return null;return e.substring(o+t.length)}catch{return null}}connectSocial(){let e=setInterval(()=>{this.socialWindow?.closed&&(this.connecting||"ConnectingSocial"!==m.RouterController.state.view||m.RouterController.goBack(),clearInterval(e))},1e3);window.addEventListener("message",this.handleSocialConnection,!1)}updateMessage(){this.error?this.message="Something went wrong":this.connecting?this.message="Retrieving user data":this.message="Connect in the provider window"}handleSocialError(e){this.error=!0,this.updateMessage(),this.socialProvider&&S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:this.socialProvider,message:e}}),this.closeSocialWindow()}closeSocialWindow(){this.socialWindow&&(this.socialWindow.close(),E.ChainController.setAccountProp("socialWindow",void 0,E.ChainController.state.activeChain))}};U.styles=z,I([(0,r.state)()],U.prototype,"socialProvider",void 0),I([(0,r.state)()],U.prototype,"socialWindow",void 0),I([(0,r.state)()],U.prototype,"error",void 0),I([(0,r.state)()],U.prototype,"connecting",void 0),I([(0,r.state)()],U.prototype,"message",void 0),I([(0,r.state)()],U.prototype,"remoteFeatures",void 0),U=I([(0,n.customElement)("w3m-connecting-social-view")],U),e.s(["W3mConnectingSocialView",0,U],62403);var D=t;e.i(34420),e.i(43452),e.i(32965),e.i(80313);let W=f.css`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: ${({borderRadius:e})=>e["8"]};
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e["1"]} * -1);
    bottom: calc(${({spacing:e})=>e["1"]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var N=function(e,t,o,r){var i,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(s<3?i(a):s>3?i(t,o,a):i(t,o))||a);return s>3&&a&&Object.defineProperty(t,o,a),a};let F=class extends D.LitElement{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.socialProvider=E.ChainController.getAccountData()?.socialProvider,this.uri=E.ChainController.getAccountData()?.farcasterUrl,this.ready=!1,this.loading=!1,this.remoteFeatures=s.OptionsController.state.remoteFeatures,this.authConnector=u.ConnectorController.getAuthConnector(),this.forceUpdate=()=>{this.requestUpdate()},this.unsubscribe.push(E.ChainController.subscribeChainProp("accountState",e=>{this.socialProvider=e?.socialProvider,this.uri=e?.farcasterUrl,this.connectFarcaster()}),s.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e})),window.addEventListener("resize",this.forceUpdate)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.timeout),window.removeEventListener("resize",this.forceUpdate),!E.ChainController.state.activeCaipAddress&&this.socialProvider&&(this.uri||this.loading)&&S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_CANCELED",properties:{provider:this.socialProvider}})}render(){return this.onRenderProxy(),o.html`${this.platformTemplate()}`}platformTemplate(){return v.CoreHelperUtil.isMobile()?o.html`${this.mobileTemplate()}`:o.html`${this.desktopTemplate()}`}desktopTemplate(){return this.loading?o.html`${this.loadingTemplate()}`:o.html`${this.qrTemplate()}`}qrTemplate(){return o.html` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${["0","5","5","5"]}
      gap="5"
    >
      <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

      <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
      ${this.copyTemplate()}
    </wui-flex>`}loadingTemplate(){return o.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["5","5","5","5"]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo="farcaster"></wui-logo>
          ${this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="md-medium" color="primary">
            Loading user data
          </wui-text>
          <wui-text align="center" variant="sm-regular" color="secondary">
            Please wait a moment while we load your data.
          </wui-text>
        </wui-flex>
      </wui-flex>
    `}mobileTemplate(){return o.html` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${["10","5","5","5"]}
      gap="5"
    >
      <wui-flex justifyContent="center" alignItems="center">
        <wui-logo logo="farcaster"></wui-logo>
        ${this.loaderTemplate()}
        <wui-icon-box
          color="error"
          icon="close"
          size="sm"
        ></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text align="center" variant="md-medium" color="primary"
          >Continue in Farcaster</span></wui-text
        >
        <wui-text align="center" variant="sm-regular" color="secondary"
          >Accept connection request in the app</wui-text
        ></wui-flex
      >
      ${this.mobileLinkTemplate()}
    </wui-flex>`}loaderTemplate(){let e=L.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return o.html`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}async connectFarcaster(){if(this.authConnector)try{await this.authConnector?.provider.connectFarcaster(),this.socialProvider&&(_.StorageUtil.setConnectedSocialProvider(this.socialProvider),S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_REQUEST_USER_DATA",properties:{provider:this.socialProvider}})),this.loading=!0;let e=j.ConnectionController.getConnections(this.authConnector.chain).length>0;await j.ConnectionController.connectExternal(this.authConnector,this.authConnector.chain);let t=this.remoteFeatures?.multiWallet;this.socialProvider&&S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_SUCCESS",properties:{provider:this.socialProvider}}),this.loading=!1,e&&t?(m.RouterController.replace("ProfileWallets"),R.SnackController.showSuccess("New Wallet Added")):O.ModalController.close()}catch(e){this.socialProvider&&S.EventsController.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:this.socialProvider,message:v.CoreHelperUtil.parseError(e)}}),m.RouterController.goBack(),R.SnackController.showError(e)}}mobileLinkTemplate(){return o.html`<wui-button
      size="md"
      ?loading=${this.loading}
      ?disabled=${!this.uri||this.loading}
      @click=${()=>{this.uri&&v.CoreHelperUtil.openHref(this.uri,"_blank")}}
    >
      Open farcaster</wui-button
    >`}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let e=this.getBoundingClientRect().width-40,t=L.ThemeController.state.themeVariables["--apkt-qr-color"]??L.ThemeController.state.themeVariables["--w3m-qr-color"];return o.html` <wui-qr-code
      size=${e}
      theme=${L.ThemeController.state.themeMode}
      uri=${this.uri}
      ?farcaster=${!0}
      data-testid="wui-qr-code"
      color=${(0,i.ifDefined)(t)}
    ></wui-qr-code>`}copyTemplate(){let e=!this.uri||!this.ready;return o.html`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="sm" color="default" slot="iconRight" name="copy"></wui-icon>
      Copy link
    </wui-button>`}onCopyUri(){try{this.uri&&(v.CoreHelperUtil.copyToClopboard(this.uri),R.SnackController.showSuccess("Link copied"))}catch{R.SnackController.showError("Failed to copy")}}};F.styles=W,N([(0,r.state)()],F.prototype,"socialProvider",void 0),N([(0,r.state)()],F.prototype,"uri",void 0),N([(0,r.state)()],F.prototype,"ready",void 0),N([(0,r.state)()],F.prototype,"loading",void 0),N([(0,r.state)()],F.prototype,"remoteFeatures",void 0),F=N([(0,n.customElement)("w3m-connecting-farcaster-view")],F),e.s(["W3mConnectingFarcasterView",0,F],1728),e.s([],59552),e.i(59552),e.i(97802),e.i(62403),e.i(1728),e.s(["W3mConnectSocialsView",0,$,"W3mConnectingFarcasterView",0,F,"W3mConnectingSocialView",0,U],63166)},82012,e=>{e.v(t=>Promise.all(["static/chunks/04ico-_gjm27w.js"].map(t=>e.l(t))).then(()=>t(96403)))},40171,e=>{e.v(t=>Promise.all(["static/chunks/11v3m7g373ehs.js"].map(t=>e.l(t))).then(()=>t(69592)))},10729,e=>{e.v(t=>Promise.all(["static/chunks/0xc5ogy.4cqt6.js"].map(t=>e.l(t))).then(()=>t(86977)))},80342,e=>{e.v(t=>Promise.all(["static/chunks/0_mewu7cnpsno.js"].map(t=>e.l(t))).then(()=>t(32833)))},95724,e=>{e.v(t=>Promise.all(["static/chunks/11wkp7hpvh7tf.js"].map(t=>e.l(t))).then(()=>t(72412)))},52792,e=>{e.v(t=>Promise.all(["static/chunks/0g3ui2wv8r~wc.js"].map(t=>e.l(t))).then(()=>t(26763)))},96302,e=>{e.v(t=>Promise.all(["static/chunks/0j0k6c8ggdklr.js"].map(t=>e.l(t))).then(()=>t(43229)))},44243,e=>{e.v(t=>Promise.all(["static/chunks/07wddbwvy22f0.js"].map(t=>e.l(t))).then(()=>t(12721)))},59668,e=>{e.v(t=>Promise.all(["static/chunks/09ba7-_iffhw0.js"].map(t=>e.l(t))).then(()=>t(36682)))},41373,e=>{e.v(t=>Promise.all(["static/chunks/10gk0blv0it_k.js"].map(t=>e.l(t))).then(()=>t(51383)))},69595,e=>{e.v(t=>Promise.all(["static/chunks/0bta-jrs6~00o.js"].map(t=>e.l(t))).then(()=>t(4289)))},33052,e=>{e.v(t=>Promise.all(["static/chunks/0762bbcc5~n~v.js"].map(t=>e.l(t))).then(()=>t(56357)))},280,e=>{e.v(t=>Promise.all(["static/chunks/0zft.mxso0wdv.js"].map(t=>e.l(t))).then(()=>t(78319)))},92833,e=>{e.v(t=>Promise.all(["static/chunks/0tdapn46a87b2.js"].map(t=>e.l(t))).then(()=>t(61289)))},17096,e=>{e.v(t=>Promise.all(["static/chunks/0oeos-plb2q06.js"].map(t=>e.l(t))).then(()=>t(26703)))},5963,e=>{e.v(t=>Promise.all(["static/chunks/0vhj_1cq1owug.js"].map(t=>e.l(t))).then(()=>t(9953)))},48774,e=>{e.v(t=>Promise.all(["static/chunks/0vm3duhzxw-u2.js"].map(t=>e.l(t))).then(()=>t(32295)))},50090,e=>{e.v(t=>Promise.all(["static/chunks/12wk3fvygoqg~.js"].map(t=>e.l(t))).then(()=>t(52019)))},38711,e=>{e.v(t=>Promise.all(["static/chunks/1408kbi9bcza3.js"].map(t=>e.l(t))).then(()=>t(64871)))},50621,e=>{e.v(t=>Promise.all(["static/chunks/0881hmc9re8px.js"].map(t=>e.l(t))).then(()=>t(59021)))},5462,e=>{e.v(t=>Promise.all(["static/chunks/04f2_hmveaqeu.js"].map(t=>e.l(t))).then(()=>t(65788)))},70963,e=>{e.v(t=>Promise.all(["static/chunks/0zhiq_0493.r0.js"].map(t=>e.l(t))).then(()=>t(17729)))},56906,e=>{e.v(t=>Promise.all(["static/chunks/0o7t79qo-g.qk.js"].map(t=>e.l(t))).then(()=>t(34056)))},78023,e=>{e.v(t=>Promise.all(["static/chunks/0p-trm74a~_nw.js"].map(t=>e.l(t))).then(()=>t(71507)))},69039,e=>{e.v(t=>Promise.all(["static/chunks/015dz_0fuvoul.js"].map(t=>e.l(t))).then(()=>t(2658)))},63605,e=>{e.v(t=>Promise.all(["static/chunks/0jt_ui_som86b.js"].map(t=>e.l(t))).then(()=>t(39621)))},42324,e=>{e.v(t=>Promise.all(["static/chunks/16ae95zbkbei2.js"].map(t=>e.l(t))).then(()=>t(11923)))},84968,e=>{e.v(t=>Promise.all(["static/chunks/139-5-~k-a9_a.js"].map(t=>e.l(t))).then(()=>t(74571)))},44020,e=>{e.v(t=>Promise.all(["static/chunks/0sj204xziysfx.js"].map(t=>e.l(t))).then(()=>t(84535)))},50711,e=>{e.v(t=>Promise.all(["static/chunks/0mb5g5c08bg3_.js"].map(t=>e.l(t))).then(()=>t(15680)))},56601,e=>{e.v(t=>Promise.all(["static/chunks/04ao4kqg7-71z.js"].map(t=>e.l(t))).then(()=>t(1958)))},81254,e=>{e.v(t=>Promise.all(["static/chunks/0ylfzksb.ysq3.js"].map(t=>e.l(t))).then(()=>t(11420)))},79893,e=>{e.v(t=>Promise.all(["static/chunks/11vp.ou5.wgk..js"].map(t=>e.l(t))).then(()=>t(52452)))},1514,e=>{e.v(t=>Promise.all(["static/chunks/15_vj4ft3pkw2.js"].map(t=>e.l(t))).then(()=>t(35252)))},44980,e=>{e.v(t=>Promise.all(["static/chunks/0abw.we2fvq85.js"].map(t=>e.l(t))).then(()=>t(80835)))},84074,e=>{e.v(t=>Promise.all(["static/chunks/0qu2ipod_3dre.js"].map(t=>e.l(t))).then(()=>t(94301)))},67422,e=>{e.v(t=>Promise.all(["static/chunks/0trdrklutxs6s.js"].map(t=>e.l(t))).then(()=>t(89931)))},13200,e=>{e.v(t=>Promise.all(["static/chunks/0wufvuse0m1df.js"].map(t=>e.l(t))).then(()=>t(69097)))},48479,e=>{e.v(t=>Promise.all(["static/chunks/039hmx6plo.3u.js"].map(t=>e.l(t))).then(()=>t(88299)))},67369,e=>{e.v(t=>Promise.all(["static/chunks/0avogfle0agse.js"].map(t=>e.l(t))).then(()=>t(66712)))},77793,e=>{e.v(t=>Promise.all(["static/chunks/0xub8so4d47.0.js"].map(t=>e.l(t))).then(()=>t(71960)))},4447,e=>{e.v(t=>Promise.all(["static/chunks/144lv8k~l5496.js"].map(t=>e.l(t))).then(()=>t(65425)))},93690,e=>{e.v(t=>Promise.all(["static/chunks/0acgxj--f7i8u.js"].map(t=>e.l(t))).then(()=>t(65891)))},77385,e=>{e.v(t=>Promise.all(["static/chunks/0qk6uu2q1tw_v.js"].map(t=>e.l(t))).then(()=>t(84131)))},65739,e=>{e.v(t=>Promise.all(["static/chunks/12lr98o1.yd7g.js"].map(t=>e.l(t))).then(()=>t(9900)))},80304,e=>{e.v(t=>Promise.all(["static/chunks/10lvb6.5.uxa9.js"].map(t=>e.l(t))).then(()=>t(45017)))},9957,e=>{e.v(t=>Promise.all(["static/chunks/0.7amhpjej0na.js"].map(t=>e.l(t))).then(()=>t(44919)))},22236,e=>{e.v(t=>Promise.all(["static/chunks/0z~mfwxrvgs-s.js"].map(t=>e.l(t))).then(()=>t(6501)))},40934,e=>{e.v(t=>Promise.all(["static/chunks/0c.ugbg-cm92~.js"].map(t=>e.l(t))).then(()=>t(13559)))},71802,e=>{e.v(t=>Promise.all(["static/chunks/0u00gqq-1y.-7.js"].map(t=>e.l(t))).then(()=>t(94384)))},57792,e=>{e.v(t=>Promise.all(["static/chunks/0l23c_y.nej82.js"].map(t=>e.l(t))).then(()=>t(76208)))},7885,e=>{e.v(t=>Promise.all(["static/chunks/047hyf3ib.ncs.js"].map(t=>e.l(t))).then(()=>t(56529)))}]);