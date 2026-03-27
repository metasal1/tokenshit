(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,34051,29389,t=>{"use strict";var e=t.i(54479);t.s(["ifDefined",0,t=>t??e.nothing],29389),t.s([],34051)},64380,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(34051);var i=t.i(29389),a=t.i(59088),n=t.i(45975),s=t.i(62611);let c=s.css`
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
`;var l=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let d=class extends e.LitElement{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let t={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?r.html`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?r.html`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:r.html`<img src=${(0,i.ifDefined)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};d.styles=[a.resetStyles,c],l([(0,o.property)()],d.prototype,"src",void 0),l([(0,o.property)()],d.prototype,"logo",void 0),l([(0,o.property)()],d.prototype,"icon",void 0),l([(0,o.property)()],d.prototype,"iconColor",void 0),l([(0,o.property)()],d.prototype,"alt",void 0),l([(0,o.property)()],d.prototype,"size",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"boxed",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"rounded",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"fullSize",void 0),d=l([(0,n.customElement)("wui-image")],d),t.s([],64380)},83227,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119),i=t.i(62611),a=t.i(59088),n=t.i(45975),s=t.i(15193);let c=s.css`
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
`;var l=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let d=class extends e.LitElement{constructor(){super(...arguments),this.color="primary",this.size="lg"}render(){let t={primary:i.vars.tokens.theme.textPrimary,secondary:i.vars.tokens.theme.textSecondary,tertiary:i.vars.tokens.theme.textTertiary,invert:i.vars.tokens.theme.textInvert,error:i.vars.tokens.core.textError,warning:i.vars.tokens.core.textWarning,"accent-primary":i.vars.tokens.core.textAccentPrimary};return this.style.cssText=`
      --local-color: ${"inherit"===this.color?"inherit":t[this.color]};
      `,this.dataset.size=this.size,r.html`<svg viewBox="0 0 16 17" fill="none">
      <path
        d="M8.75 2.65625V4.65625C8.75 4.85516 8.67098 5.04593 8.53033 5.18658C8.38968 5.32723 8.19891 5.40625 8 5.40625C7.80109 5.40625 7.61032 5.32723 7.46967 5.18658C7.32902 5.04593 7.25 4.85516 7.25 4.65625V2.65625C7.25 2.45734 7.32902 2.26657 7.46967 2.12592C7.61032 1.98527 7.80109 1.90625 8 1.90625C8.19891 1.90625 8.38968 1.98527 8.53033 2.12592C8.67098 2.26657 8.75 2.45734 8.75 2.65625ZM14 7.90625H12C11.8011 7.90625 11.6103 7.98527 11.4697 8.12592C11.329 8.26657 11.25 8.45734 11.25 8.65625C11.25 8.85516 11.329 9.04593 11.4697 9.18658C11.6103 9.32723 11.8011 9.40625 12 9.40625H14C14.1989 9.40625 14.3897 9.32723 14.5303 9.18658C14.671 9.04593 14.75 8.85516 14.75 8.65625C14.75 8.45734 14.671 8.26657 14.5303 8.12592C14.3897 7.98527 14.1989 7.90625 14 7.90625ZM11.3588 10.9544C11.289 10.8846 11.2062 10.8293 11.115 10.7915C11.0239 10.7538 10.9262 10.7343 10.8275 10.7343C10.7288 10.7343 10.6311 10.7538 10.54 10.7915C10.4488 10.8293 10.366 10.8846 10.2963 10.9544C10.2265 11.0241 10.1711 11.107 10.1334 11.1981C10.0956 11.2893 10.0762 11.387 10.0762 11.4856C10.0762 11.5843 10.0956 11.682 10.1334 11.7731C10.1711 11.8643 10.2265 11.9471 10.2963 12.0169L11.7106 13.4312C11.8515 13.5721 12.0426 13.6513 12.2419 13.6513C12.4411 13.6513 12.6322 13.5721 12.7731 13.4312C12.914 13.2904 12.9932 13.0993 12.9932 12.9C12.9932 12.7007 12.914 12.5096 12.7731 12.3687L11.3588 10.9544ZM8 11.9062C7.80109 11.9062 7.61032 11.9853 7.46967 12.1259C7.32902 12.2666 7.25 12.4573 7.25 12.6562V14.6562C7.25 14.8552 7.32902 15.0459 7.46967 15.1866C7.61032 15.3272 7.80109 15.4062 8 15.4062C8.19891 15.4062 8.38968 15.3272 8.53033 15.1866C8.67098 15.0459 8.75 14.8552 8.75 14.6562V12.6562C8.75 12.4573 8.67098 12.2666 8.53033 12.1259C8.38968 11.9853 8.19891 11.9062 8 11.9062ZM4.64125 10.9544L3.22688 12.3687C3.08598 12.5096 3.00682 12.7007 3.00682 12.9C3.00682 13.0993 3.08598 13.2904 3.22688 13.4312C3.36777 13.5721 3.55887 13.6513 3.75813 13.6513C3.95738 13.6513 4.14848 13.5721 4.28937 13.4312L5.70375 12.0169C5.84465 11.876 5.9238 11.6849 5.9238 11.4856C5.9238 11.2864 5.84465 11.0953 5.70375 10.9544C5.56285 10.8135 5.37176 10.7343 5.1725 10.7343C4.97324 10.7343 4.78215 10.8135 4.64125 10.9544ZM4.75 8.65625C4.75 8.45734 4.67098 8.26657 4.53033 8.12592C4.38968 7.98527 4.19891 7.90625 4 7.90625H2C1.80109 7.90625 1.61032 7.98527 1.46967 8.12592C1.32902 8.26657 1.25 8.45734 1.25 8.65625C1.25 8.85516 1.32902 9.04593 1.46967 9.18658C1.61032 9.32723 1.80109 9.40625 2 9.40625H4C4.19891 9.40625 4.38968 9.32723 4.53033 9.18658C4.67098 9.04593 4.75 8.85516 4.75 8.65625ZM4.2875 3.88313C4.1466 3.74223 3.95551 3.66307 3.75625 3.66307C3.55699 3.66307 3.3659 3.74223 3.225 3.88313C3.0841 4.02402 3.00495 4.21512 3.00495 4.41438C3.00495 4.61363 3.0841 4.80473 3.225 4.94562L4.64125 6.35813C4.78215 6.49902 4.97324 6.57818 5.1725 6.57818C5.37176 6.57818 5.56285 6.49902 5.70375 6.35813C5.84465 6.21723 5.9238 6.02613 5.9238 5.82688C5.9238 5.62762 5.84465 5.43652 5.70375 5.29563L4.2875 3.88313Z"
        fill="currentColor"
      />
    </svg>`}};d.styles=[a.resetStyles,c],l([(0,o.property)()],d.prototype,"color",void 0),l([(0,o.property)()],d.prototype,"size",void 0),d=l([(0,n.customElement)("wui-loading-spinner")],d),t.s([],83227)},12190,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(34051);var i=t.i(29389);t.i(52634);var a=t.i(59088),n=t.i(45975),s=t.i(62611);let c=s.css`
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
`;var l=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let d=class extends e.LitElement{constructor(){super(...arguments),this.icon="copy",this.size="md",this.padding="1",this.color="default"}render(){return this.dataset.padding=this.padding,this.dataset.color=this.color,r.html`
      <wui-icon size=${(0,i.ifDefined)(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `}};d.styles=[a.resetStyles,a.elementStyles,c],l([(0,o.property)()],d.prototype,"icon",void 0),l([(0,o.property)()],d.prototype,"size",void 0),l([(0,o.property)()],d.prototype,"padding",void 0),l([(0,o.property)()],d.prototype,"color",void 0),d=l([(0,n.customElement)("wui-icon-box")],d),t.s([],12190)},34420,24947,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(52634),t.i(83227),t.i(39009);var i=t.i(59088),a=t.i(45975),n=t.i(62611);let s=n.css`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({spacing:t})=>t[2]};
    transition:
      scale ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-1"]},
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      border-radius ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]};
    will-change: scale, background-color, border-radius;
    cursor: pointer;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({borderRadius:t})=>t[2]};
    padding: 0 ${({spacing:t})=>t[2]};
    height: 28px;
  }

  button[data-size='md'] {
    border-radius: ${({borderRadius:t})=>t[3]};
    padding: 0 ${({spacing:t})=>t[4]};
    height: 38px;
  }

  button[data-size='lg'] {
    border-radius: ${({borderRadius:t})=>t[4]};
    padding: 0 ${({spacing:t})=>t[5]};
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent-primary'] {
    background-color: ${({tokens:t})=>t.core.backgroundAccentPrimary};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='accent-secondary'] {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button[data-variant='neutral-primary'] {
    background-color: ${({tokens:t})=>t.theme.backgroundInvert};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='neutral-secondary'] {
    background-color: transparent;
    border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-variant='neutral-tertiary'] {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-variant='error-primary'] {
    background-color: ${({tokens:t})=>t.core.textError};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({tokens:t})=>t.core.backgroundError};
    color: ${({tokens:t})=>t.core.textError};
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
`;var c=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let l={lg:"lg-regular-mono",md:"md-regular-mono",sm:"sm-regular-mono"},d={lg:"md",md:"md",sm:"sm"},u=class extends e.LitElement{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="accent-primary"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
     `;let t=this.textVariant??l[this.size];return r.html`
      <button data-variant=${this.variant} data-size=${this.size} ?disabled=${this.disabled}>
        ${this.loadingTemplate()}
        <slot name="iconLeft"></slot>
        <wui-text variant=${t} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}loadingTemplate(){if(this.loading){let t=d[this.size],e="neutral-primary"===this.variant||"accent-primary"===this.variant?"invert":"primary";return r.html`<wui-loading-spinner color=${e} size=${t}></wui-loading-spinner>`}return null}};u.styles=[i.resetStyles,i.elementStyles,s],c([(0,o.property)()],u.prototype,"size",void 0),c([(0,o.property)({type:Boolean})],u.prototype,"disabled",void 0),c([(0,o.property)({type:Boolean})],u.prototype,"fullWidth",void 0),c([(0,o.property)({type:Boolean})],u.prototype,"loading",void 0),c([(0,o.property)()],u.prototype,"variant",void 0),c([(0,o.property)()],u.prototype,"textVariant",void 0),u=c([(0,a.customElement)("wui-button")],u),t.s([],24947),t.s([],34420)},43452,t=>{"use strict";t.i(52634),t.s([])},64576,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119),i=t.i(45975),a=t.i(62611);let n=a.css`
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
`;var s=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let c=class extends e.LitElement{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",r.html`<slot></slot>`}};c.styles=[n],s([(0,o.property)()],c.prototype,"width",void 0),s([(0,o.property)()],c.prototype,"height",void 0),s([(0,o.property)()],c.prototype,"variant",void 0),s([(0,o.property)({type:Boolean})],c.prototype,"rounded",void 0),c=s([(0,i.customElement)("wui-shimmer")],c),t.s([],64576)},80313,t=>{"use strict";t.i(64576),t.s([])},43053,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(34051);var i=t.i(29389);t.i(83227),t.i(39009);var a=t.i(59088),n=t.i(45975),s=t.i(62611);let c=s.css`
  :host {
    width: 100%;
  }

  :host([data-type='primary']) > button {
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  :host([data-type='secondary']) > button {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:t})=>t[3]};
    width: 100%;
    border-radius: ${({borderRadius:t})=>t[4]};
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      scale ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color, scale;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-image {
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  @media (hover: hover) {
    :host([data-type='primary']) > button:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    }

    :host([data-type='secondary']) > button:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var l=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let d=class extends e.LitElement{constructor(){super(...arguments),this.type="primary",this.imageSrc="google",this.imageSize=void 0,this.loading=!1,this.boxColor="foregroundPrimary",this.disabled=!1,this.rightIcon=!0,this.boxed=!0,this.rounded=!1,this.fullSize=!1}render(){return this.dataset.rounded=this.rounded?"true":"false",this.dataset.type=this.type,r.html`
      <button
        ?disabled=${!!this.loading||!!this.disabled}
        data-loading=${this.loading}
        tabindex=${(0,i.ifDefined)(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `}templateLeftIcon(){return this.icon?r.html`<wui-image
        icon=${this.icon}
        iconColor=${(0,i.ifDefined)(this.iconColor)}
        ?boxed=${this.boxed}
        ?rounded=${this.rounded}
        boxColor=${this.boxColor}
      ></wui-image>`:r.html`<wui-image
      ?boxed=${this.boxed}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      size=${(0,i.ifDefined)(this.imageSize)}
      src=${this.imageSrc}
      boxColor=${this.boxColor}
    ></wui-image>`}templateRightIcon(){return this.rightIcon?this.loading?r.html`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:r.html`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`:null}};d.styles=[a.resetStyles,a.elementStyles,c],l([(0,o.property)()],d.prototype,"type",void 0),l([(0,o.property)()],d.prototype,"imageSrc",void 0),l([(0,o.property)()],d.prototype,"imageSize",void 0),l([(0,o.property)()],d.prototype,"icon",void 0),l([(0,o.property)()],d.prototype,"iconColor",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"loading",void 0),l([(0,o.property)()],d.prototype,"tabIdx",void 0),l([(0,o.property)()],d.prototype,"boxColor",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"rightIcon",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"boxed",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"rounded",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"fullSize",void 0),d=l([(0,n.customElement)("wui-list-item")],d),t.s([],43053)},79929,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(39009);var i=t.i(59088),a=t.i(45975),n=t.i(62611);let s=n.css`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 1px;
    background-color: ${({tokens:t})=>t.theme.borderPrimary};
    justify-content: center;
    align-items: center;
  }

  :host > wui-text {
    position: absolute;
    padding: 0px 8px;
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color;
  }

  :host([data-bg-color='primary']) > wui-text {
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  :host([data-bg-color='secondary']) > wui-text {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }
`;var c=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let l=class extends e.LitElement{constructor(){super(...arguments),this.text="",this.bgColor="primary"}render(){return this.dataset.bgColor=this.bgColor,r.html`${this.template()}`}template(){return this.text?r.html`<wui-text variant="md-regular" color="secondary">${this.text}</wui-text>`:null}};l.styles=[i.resetStyles,s],c([(0,o.property)()],l.prototype,"text",void 0),c([(0,o.property)()],l.prototype,"bgColor",void 0),l=c([(0,a.customElement)("wui-separator")],l),t.s([],79929)},7170,67980,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(52634);var i=t.i(59088),a=t.i(45975),n=t.i(62611);let s=n.css`
  button {
    background-color: transparent;
    padding: ${({spacing:t})=>t[1]};
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  button[data-variant='accent']:hover:enabled,
  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='primary']:hover:enabled,
  button[data-variant='primary']:focus-visible,
  button[data-variant='secondary']:hover:enabled,
  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  button[data-size='xs'] > wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='xs'],
  button[data-size='sm'] {
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='md'],
  button[data-size='lg'] {
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='md'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button:disabled {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:hover:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
  }

  button:focus-visible:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
`;var c=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let l=class extends e.LitElement{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.icon="copy",this.iconColor="default",this.variant="accent"}render(){return r.html`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${({accent:"accent-primary",primary:"inverse",secondary:"default"})[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};l.styles=[i.resetStyles,i.elementStyles,s],c([(0,o.property)()],l.prototype,"size",void 0),c([(0,o.property)({type:Boolean})],l.prototype,"disabled",void 0),c([(0,o.property)()],l.prototype,"icon",void 0),c([(0,o.property)()],l.prototype,"iconColor",void 0),c([(0,o.property)()],l.prototype,"variant",void 0),l=c([(0,a.customElement)("wui-icon-link")],l),t.s([],67980),t.s([],7170)},10380,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(52634),t.i(39009);var i=t.i(59088),a=t.i(45975),n=t.i(62611);let s=n.css`
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
`;var c=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let l={sm:"sm-medium",md:"md-medium"},d={accent:"accent-primary",secondary:"secondary"},u=class extends e.LitElement{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.variant="accent",this.icon=void 0}render(){return r.html`
      <button ?disabled=${this.disabled} data-variant=${this.variant}>
        <slot name="iconLeft"></slot>
        <wui-text
          color=${d[this.variant]}
          variant=${l[this.size]}
        >
          <slot></slot>
        </wui-text>
        ${this.iconTemplate()}
      </button>
    `}iconTemplate(){return this.icon?r.html`<wui-icon name=${this.icon} size="sm"></wui-icon>`:null}};u.styles=[i.resetStyles,i.elementStyles,s],c([(0,o.property)()],u.prototype,"size",void 0),c([(0,o.property)({type:Boolean})],u.prototype,"disabled",void 0),c([(0,o.property)()],u.prototype,"variant",void 0),c([(0,o.property)()],u.prototype,"icon",void 0),u=c([(0,a.customElement)("wui-link")],u),t.s([],10380)},46650,t=>{"use strict";t.i(12190),t.s([])},84326,65090,t=>{"use strict";var e=t.i(54479);let{I:r}=e._$LH;var o=t.i(91909);let i=(t,e)=>{let r=t._$AN;if(void 0===r)return!1;for(let t of r)t._$AO?.(e,!1),i(t,e);return!0},a=t=>{let e,r;do{if(void 0===(e=t._$AM))break;(r=e._$AN).delete(t),t=e}while(0===r?.size)},n=t=>{for(let e;e=t._$AM;t=e){let r=e._$AN;if(void 0===r)e._$AN=r=new Set;else if(r.has(t))break;r.add(t),l(e)}};function s(t){void 0!==this._$AN?(a(this),this._$AM=t,n(this)):this._$AM=t}function c(t,e=!1,r=0){let o=this._$AH,n=this._$AN;if(void 0!==n&&0!==n.size)if(e)if(Array.isArray(o))for(let t=r;t<o.length;t++)i(o[t],!1),a(o[t]);else null!=o&&(i(o,!1),a(o));else i(this,t)}let l=t=>{t.type==o.PartType.CHILD&&(t._$AP??=c,t._$AQ??=s)};class d extends o.Directive{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,r){super._$AT(t,e,r),n(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(i(this,t),a(this))}setValue(t){if(void 0===this._$Ct.strings)this._$Ct._$AI(t,this);else{let e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}class u{}let p=new WeakMap,h=(0,o.directive)(class extends d{render(t){return e.nothing}update(t,[r]){let o=r!==this.G;return o&&void 0!==this.G&&this.rt(void 0),(o||this.lt!==this.ct)&&(this.G=r,this.ht=t.options?.host,this.rt(this.ct=t.element)),e.nothing}rt(t){if(this.isConnected||(t=void 0),"function"==typeof this.G){let e=this.ht??globalThis,r=p.get(e);void 0===r&&(r=new WeakMap,p.set(e,r)),void 0!==r.get(this.G)&&this.G.call(this.ht,void 0),r.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?p.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});t.s(["createRef",0,()=>new u,"ref",0,h],65090),t.s([],84326)},35902,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119);t.i(34051);var i=t.i(29389);t.i(84326);var a=t.i(65090);t.i(52634),t.i(39009);var n=t.i(59088),s=t.i(45975),c=t.i(62611);let l=c.css`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:t})=>t[3]};
    color: ${({tokens:t})=>t.theme.textPrimary};
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:t})=>t[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
    padding: ${({spacing:t})=>t[3]} ${({spacing:t})=>t[3]}
      ${({spacing:t})=>t[3]} ${({spacing:t})=>t[10]};
    font-size: ${({textSize:t})=>t.large};
    line-height: ${({typography:t})=>t["lg-regular"].lineHeight};
    letter-spacing: ${({typography:t})=>t["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:t})=>t.regular};
    font-family: ${({fontFamily:t})=>t.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:t})=>t[4]} ${({spacing:t})=>t[3]}
      ${({spacing:t})=>t[4]} ${({spacing:t})=>t[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:t})=>t[4]};
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:t})=>t[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:t})=>t[2]};
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:t})=>t[12]};
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
`;var d=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let u=class extends e.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,a.createRef)(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return r.html` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${(0,a.ref)(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${(0,i.ifDefined)(this.enterKeyHint)}
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
      </button>`:null}templateError(){return this.errorText?r.html`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?r.html`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};u.styles=[n.resetStyles,n.elementStyles,l],d([(0,o.property)()],u.prototype,"icon",void 0),d([(0,o.property)({type:Boolean})],u.prototype,"disabled",void 0),d([(0,o.property)({type:Boolean})],u.prototype,"loading",void 0),d([(0,o.property)()],u.prototype,"placeholder",void 0),d([(0,o.property)()],u.prototype,"type",void 0),d([(0,o.property)()],u.prototype,"value",void 0),d([(0,o.property)()],u.prototype,"errorText",void 0),d([(0,o.property)()],u.prototype,"warningText",void 0),d([(0,o.property)()],u.prototype,"onSubmit",void 0),d([(0,o.property)()],u.prototype,"size",void 0),d([(0,o.property)({attribute:!1})],u.prototype,"onKeyDown",void 0),u=d([(0,s.customElement)("wui-input-text")],u),t.s([],35902)},6957,t=>{"use strict";t.i(35902),t.s([])},23838,t=>{"use strict";t.i(12207);var e=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(20119),i=t.i(75457);t.i(52634),t.i(64380),t.i(39009),t.i(73944);var a=t.i(59088),n=t.i(45975),s=t.i(62611);let c=s.css`
  :host {
    width: 100%;
  }

  button {
    padding: ${({spacing:t})=>t[3]};
    display: flex;
    gap: ${({spacing:t})=>t[3]};
    justify-content: space-between;
    width: 100%;
    border-radius: ${({borderRadius:t})=>t[4]};
    background-color: transparent;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }

  button:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  button[data-clickable='false'] {
    pointer-events: none;
    background-color: transparent;
  }

  wui-image,
  wui-icon {
    width: ${({spacing:t})=>t[10]};
    height: ${({spacing:t})=>t[10]};
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t[16]};
  }

  .token-name-container {
    flex: 1;
  }
`;var l=function(t,e,r,o){var i,a=arguments.length,n=a<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,r,n):i(e,r))||n);return a>3&&n&&Object.defineProperty(e,r,n),n};let d=class extends e.LitElement{constructor(){super(...arguments),this.tokenName="",this.tokenImageUrl="",this.tokenValue=0,this.tokenAmount="0.0",this.tokenCurrency="",this.clickable=!1}render(){return r.html`
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
              ${i.NumberUtil.formatNumberToLocalString(this.tokenAmount,4)} ${this.tokenCurrency}
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
            ${i.NumberUtil.formatNumberToLocalString(this.tokenAmount,4)}
          </wui-text>
        </wui-flex>
      </button>
    `}visualTemplate(){return this.tokenName&&this.tokenImageUrl?r.html`<wui-image alt=${this.tokenName} src=${this.tokenImageUrl}></wui-image>`:r.html`<wui-icon name="coinPlaceholder" color="default"></wui-icon>`}};d.styles=[a.resetStyles,a.elementStyles,c],l([(0,o.property)()],d.prototype,"tokenName",void 0),l([(0,o.property)()],d.prototype,"tokenImageUrl",void 0),l([(0,o.property)({type:Number})],d.prototype,"tokenValue",void 0),l([(0,o.property)()],d.prototype,"tokenAmount",void 0),l([(0,o.property)()],d.prototype,"tokenCurrency",void 0),l([(0,o.property)({type:Boolean})],d.prototype,"clickable",void 0),d=l([(0,n.customElement)("wui-list-token")],d),t.s([],23838)},49694,t=>{"use strict";var e=t.i(65801),r=t.i(42710),o=t.i(75457),i=t.i(64126),a=t.i(60334),n=t.i(27302),s=t.i(24141),c=t.i(24742),l=t.i(60398),d=t.i(53157),u=t.i(82283),p=t.i(11424);let h={paymentAsset:null,amount:null,tokenAmount:0,priceLoading:!1,error:null,exchanges:[],isLoading:!1,currentPayment:void 0,isPaymentInProgress:!1,paymentId:"",assets:[]},g=(0,e.proxy)(h),y={state:g,subscribe:t=>(0,e.subscribe)(g,()=>t(g)),subscribeKey:(t,e)=>(0,r.subscribeKey)(g,t,e),resetState(){Object.assign(g,{...h})},async getAssetsForNetwork(t){let e=(0,s.getPaymentAssetsForNetwork)(t),r=await y.getAssetsImageAndPrice(e),o=e.map(t=>{let e="native"===t.asset?(0,i.getActiveNetworkTokenAddress)():`${t.network}:${t.asset}`,o=r.find(t=>t.fungibles?.[0]?.address?.toLowerCase()===e.toLowerCase());return{...t,price:o?.fungibles?.[0]?.price||1,metadata:{...t.metadata,iconUrl:o?.fungibles?.[0]?.iconUrl}}});return g.assets=o,o},async getAssetsImageAndPrice(t){let e=t.map(t=>"native"===t.asset?(0,i.getActiveNetworkTokenAddress)():`${t.network}:${t.asset}`);return await Promise.all(e.map(t=>c.BlockchainApiController.fetchTokenPrice({addresses:[t]})))},getTokenAmount(){if(!g?.paymentAsset?.price)throw Error("Cannot get token price");let t=o.NumberUtil.bigNumber(g.amount??0).round(8),e=o.NumberUtil.bigNumber(g.paymentAsset.price).round(8);return t.div(e).round(8).toNumber()},setAmount(t){g.amount=t,g.paymentAsset?.price&&(g.tokenAmount=y.getTokenAmount())},setPaymentAsset(t){g.paymentAsset=t},isPayWithExchangeEnabled:()=>u.OptionsController.state.remoteFeatures?.payWithExchange,isPayWithExchangeSupported:()=>y.isPayWithExchangeEnabled()&&l.ChainController.state.activeCaipNetwork&&a.ConstantsUtil.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(l.ChainController.state.activeCaipNetwork.chainNamespace),async fetchExchanges(){try{let t=y.isPayWithExchangeSupported();if(!g.paymentAsset||!t){g.exchanges=[],g.isLoading=!1;return}g.isLoading=!0;let e=await (0,s.getExchanges)({page:0,asset:(0,s.formatCaip19Asset)(g.paymentAsset.network,g.paymentAsset.asset),amount:g.amount?.toString()??"0"});g.exchanges=e.exchanges.slice(0,2)}catch(t){throw p.SnackController.showError("Unable to get exchanges"),Error("Unable to get exchanges")}finally{g.isLoading=!1}},async getPayUrl(t,e){try{let r=Number(e.amount),o=await (0,s.getPayUrl)({exchangeId:t,asset:(0,s.formatCaip19Asset)(e.network,e.asset),amount:r.toString(),recipient:`${e.network}:${e.recipient}`});return d.EventsController.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{exchange:{id:t},configuration:{network:e.network,asset:e.asset,recipient:e.recipient,amount:r},currentPayment:{type:"exchange",exchangeId:t},source:"fund-from-exchange",headless:!1}}),o}catch(t){if(t instanceof Error&&t.message.includes("is not supported"))throw Error("Asset not supported");throw Error(t.message)}},async handlePayWithExchange(t){try{let e=l.ChainController.getAccountData()?.address;if(!e)throw Error("No account connected");if(!g.paymentAsset)throw Error("No payment asset selected");let r=n.CoreHelperUtil.returnOpenHref("","popupWindow","scrollbar=yes,width=480,height=720");if(!r)throw Error("Could not create popup window");g.isPaymentInProgress=!0,g.paymentId=crypto.randomUUID(),g.currentPayment={type:"exchange",exchangeId:t};let{network:o,asset:i}=g.paymentAsset,a={network:o,asset:i,amount:g.tokenAmount,recipient:e},s=await y.getPayUrl(t,a);if(!s){try{r.close()}catch(t){console.error("Unable to close popup window",t)}throw Error("Unable to initiate payment")}g.currentPayment.sessionId=s.sessionId,g.currentPayment.status="IN_PROGRESS",g.currentPayment.exchangeId=t,r.location.href=s.url}catch(t){g.error="Unable to initiate payment",p.SnackController.showError(g.error)}},async waitUntilComplete({exchangeId:t,sessionId:e,paymentId:r,retries:o=20}){let i=await y.getBuyStatus(t,e,r);if("SUCCESS"===i.status||"FAILED"===i.status)return i;if(0===o)throw Error("Unable to get deposit status");return await new Promise(t=>{setTimeout(t,5e3)}),y.waitUntilComplete({exchangeId:t,sessionId:e,paymentId:r,retries:o-1})},async getBuyStatus(t,e,r){try{if(!g.currentPayment)throw Error("No current payment");let o=await (0,s.getBuyStatus)({sessionId:e,exchangeId:t});if(g.currentPayment.status=o.status,"SUCCESS"===o.status||"FAILED"===o.status){let t=l.ChainController.getAccountData()?.address;g.currentPayment.result=o.txHash,g.isPaymentInProgress=!1,d.EventsController.sendEvent({type:"track",event:"SUCCESS"===o.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===o.status?n.CoreHelperUtil.parseError(g.error):void 0,source:"fund-from-exchange",paymentId:r,configuration:{network:g.paymentAsset?.network||"",asset:g.paymentAsset?.asset||"",recipient:t||"",amount:g.amount??0},currentPayment:{type:"exchange",exchangeId:g.currentPayment?.exchangeId,sessionId:g.currentPayment?.sessionId,result:o.txHash}}})}return o}catch(t){return{status:"UNKNOWN",txHash:""}}},reset(){g.currentPayment=void 0,g.isPaymentInProgress=!1,g.paymentId="",g.paymentAsset=null,g.amount=0,g.tokenAmount=0,g.priceLoading=!1,g.error=null,g.exchanges=[],g.isLoading=!1}};t.s(["ExchangeController",0,y])}]);