(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,69609,e=>{"use strict";e.i(64380),e.s([])},83026,e=>{"use strict";e.i(12207);var t=e.i(8285),r=e.i(54479);e.i(74576);var i=e.i(56350);e.i(34051);var o=e.i(29389),s=e.i(41845),n=e.i(3468),a=e.i(30121),l=e.i(82283),c=e.i(55587);e.i(4041);var u=e.i(45975);e.i(62238),e.i(43053),e.i(49536),e.i(29084);var p=e.i(62611);let m=p.css`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`;var d=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let h=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=a.OnRampController.state.paymentCurrency,this.currencies=a.OnRampController.state.paymentCurrencies,this.currencyImages=s.AssetController.state.currencyImages,this.checked=c.OptionsStateController.state.isLegalCheckboxChecked,this.unsubscribe.push(a.OnRampController.subscribe(e=>{this.selectedCurrency=e.paymentCurrency,this.currencies=e.paymentCurrencies}),s.AssetController.subscribeKey("currencyImages",e=>this.currencyImages=e),c.OptionsStateController.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state,i=l.OptionsController.state.features?.legalCheckbox,s=!!(e||t)&&!!i&&!this.checked;return r.html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","3","3","3"]}
        gap="2"
        class=${(0,o.ifDefined)(s?"disabled":void 0)}
      >
        ${this.currenciesTemplate(s)}
      </wui-flex>
    `}currenciesTemplate(e=!1){return this.currencies.map(t=>r.html`
        <wui-list-item
          imageSrc=${(0,o.ifDefined)(this.currencyImages?.[t.id])}
          @click=${()=>this.selectCurrency(t)}
          variant="image"
          tabIdx=${(0,o.ifDefined)(e?-1:void 0)}
        >
          <wui-text variant="md-medium" color="primary">${t.id}</wui-text>
        </wui-list-item>
      `)}selectCurrency(e){e&&(a.OnRampController.setPaymentCurrency(e),n.ModalController.close())}};h.styles=m,d([(0,i.state)()],h.prototype,"selectedCurrency",void 0),d([(0,i.state)()],h.prototype,"currencies",void 0),d([(0,i.state)()],h.prototype,"currencyImages",void 0),d([(0,i.state)()],h.prototype,"checked",void 0),h=d([(0,u.customElement)("w3m-onramp-fiat-select-view")],h),e.s(["W3mOnrampFiatSelectView",0,h],31349);var y=t,w=e.i(60398),f=e.i(27302),v=e.i(53157),g=e.i(21728),b=e.i(64126),k=e.i(79484),C=t,x=e.i(20119),P=e.i(36220);e.i(43452),e.i(69609),e.i(21147),e.i(57650);let $=p.css`
  button {
    padding: ${({spacing:e})=>e["3"]};
    border-radius: ${({borderRadius:e})=>e["4"]};
    border: none;
    outline: none;
    background-color: ${({tokens:e})=>e.core.glass010};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: ${({spacing:e})=>e["3"]};
    transition: background-color ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: background-color;
    cursor: pointer;
  }

  button:hover {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .provider-image {
    width: ${({spacing:e})=>e["10"]};
    min-width: ${({spacing:e})=>e["10"]};
    height: ${({spacing:e})=>e["10"]};
    border-radius: calc(
      ${({borderRadius:e})=>e["4"]} - calc(${({spacing:e})=>e["3"]} / 2)
    );
    position: relative;
    overflow: hidden;
  }

  .network-icon {
    width: ${({spacing:e})=>e["3"]};
    height: ${({spacing:e})=>e["3"]};
    border-radius: calc(${({spacing:e})=>e["3"]} / 2);
    overflow: hidden;
    box-shadow:
      0 0 0 3px ${({tokens:e})=>e.theme.foregroundPrimary},
      0 0 0 3px ${({tokens:e})=>e.theme.backgroundPrimary};
    transition: box-shadow ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  button:hover .network-icon {
    box-shadow:
      0 0 0 3px ${({tokens:e})=>e.core.glass010},
      0 0 0 3px ${({tokens:e})=>e.theme.backgroundPrimary};
  }
`;var j=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let R=class extends C.LitElement{constructor(){super(...arguments),this.disabled=!1,this.color="inherit",this.label="",this.feeRange="",this.loading=!1,this.onClick=null}render(){return r.html`
      <button ?disabled=${this.disabled} @click=${this.onClick} ontouchstart>
        <wui-visual name=${(0,o.ifDefined)(this.name)} class="provider-image"></wui-visual>
        <wui-flex flexDirection="column" gap="01">
          <wui-text variant="md-regular" color="primary">${this.label}</wui-text>
          <wui-flex alignItems="center" justifyContent="flex-start" gap="4">
            <wui-text variant="sm-medium" color="primary">
              <wui-text variant="sm-regular" color="secondary">Fees</wui-text>
              ${this.feeRange}
            </wui-text>
            <wui-flex gap="2">
              <wui-icon name="bank" size="sm" color="default"></wui-icon>
              <wui-icon name="card" size="sm" color="default"></wui-icon>
            </wui-flex>
            ${this.networksTemplate()}
          </wui-flex>
        </wui-flex>
        ${this.loading?r.html`<wui-loading-spinner color="secondary" size="md"></wui-loading-spinner>`:r.html`<wui-icon name="chevronRight" color="default" size="sm"></wui-icon>`}
      </button>
    `}networksTemplate(){let e=w.ChainController.getAllRequestedCaipNetworks(),t=e?.filter(e=>e?.assets?.imageId)?.slice(0,5);return r.html`
      <wui-flex class="networks">
        ${t?.map(e=>r.html`
            <wui-flex class="network-icon">
              <wui-image src=${(0,o.ifDefined)(P.AssetUtil.getNetworkImage(e))}></wui-image>
            </wui-flex>
          `)}
      </wui-flex>
    `}};R.styles=[$],j([(0,x.property)({type:Boolean})],R.prototype,"disabled",void 0),j([(0,x.property)()],R.prototype,"color",void 0),j([(0,x.property)()],R.prototype,"name",void 0),j([(0,x.property)()],R.prototype,"label",void 0),j([(0,x.property)()],R.prototype,"feeRange",void 0),j([(0,x.property)({type:Boolean})],R.prototype,"loading",void 0),j([(0,x.property)()],R.prototype,"onClick",void 0),R=j([(0,u.customElement)("w3m-onramp-provider-item")],R),e.i(50230);var O=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let I=class extends y.LitElement{constructor(){super(),this.unsubscribe=[],this.providers=a.OnRampController.state.providers,this.unsubscribe.push(a.OnRampController.subscribeKey("providers",e=>{this.providers=e}))}render(){return r.html`
      <wui-flex flexDirection="column" .padding=${["0","3","3","3"]} gap="2">
        ${this.onRampProvidersTemplate()}
      </wui-flex>
    `}onRampProvidersTemplate(){return this.providers.filter(e=>e.supportedChains.includes(w.ChainController.state.activeChain??"eip155")).map(e=>r.html`
          <w3m-onramp-provider-item
            label=${e.label}
            name=${e.name}
            feeRange=${e.feeRange}
            @click=${()=>{this.onClickProvider(e)}}
            ?disabled=${!e.url}
            data-testid=${`onramp-provider-${e.name}`}
          ></w3m-onramp-provider-item>
        `)}onClickProvider(e){a.OnRampController.setSelectedProvider(e),g.RouterController.push("BuyInProgress"),f.CoreHelperUtil.openHref(a.OnRampController.state.selectedProvider?.url||e.url,"popupWindow","width=600,height=800,scrollbars=yes"),v.EventsController.sendEvent({type:"track",event:"SELECT_BUY_PROVIDER",properties:{provider:e.name,isSmartAccount:(0,b.getPreferredAccountType)(w.ChainController.state.activeChain)===k.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}})}};O([(0,i.state)()],I.prototype,"providers",void 0),I=O([(0,u.customElement)("w3m-onramp-providers-view")],I),e.s(["W3mOnRampProvidersView",0,I],12292);var A=t;e.i(25416);let T=p.css`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`;var D=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let E=class extends A.LitElement{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=a.OnRampController.state.purchaseCurrencies,this.tokens=a.OnRampController.state.purchaseCurrencies,this.tokenImages=s.AssetController.state.tokenImages,this.checked=c.OptionsStateController.state.isLegalCheckboxChecked,this.unsubscribe.push(a.OnRampController.subscribe(e=>{this.selectedCurrency=e.purchaseCurrencies,this.tokens=e.purchaseCurrencies}),s.AssetController.subscribeKey("tokenImages",e=>this.tokenImages=e),c.OptionsStateController.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state,i=l.OptionsController.state.features?.legalCheckbox,s=!!(e||t)&&!!i&&!this.checked;return r.html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","3","3","3"]}
        gap="2"
        class=${(0,o.ifDefined)(s?"disabled":void 0)}
      >
        ${this.currenciesTemplate(s)}
      </wui-flex>
    `}currenciesTemplate(e=!1){return this.tokens.map(t=>r.html`
        <wui-list-item
          imageSrc=${(0,o.ifDefined)(this.tokenImages?.[t.symbol])}
          @click=${()=>this.selectToken(t)}
          variant="image"
          tabIdx=${(0,o.ifDefined)(e?-1:void 0)}
        >
          <wui-flex gap="1" alignItems="center">
            <wui-text variant="md-medium" color="primary">${t.name}</wui-text>
            <wui-text variant="sm-regular" color="secondary">${t.symbol}</wui-text>
          </wui-flex>
        </wui-list-item>
      `)}selectToken(e){e&&(a.OnRampController.setPurchaseCurrency(e),n.ModalController.close())}};E.styles=T,D([(0,i.state)()],E.prototype,"selectedCurrency",void 0),D([(0,i.state)()],E.prototype,"tokens",void 0),D([(0,i.state)()],E.prototype,"tokenImages",void 0),D([(0,i.state)()],E.prototype,"checked",void 0),E=D([(0,u.customElement)("w3m-onramp-token-select-view")],E),e.s(["W3mOnrampTokensView",0,E],96775);var q=t,z=e.i(71080),L=e.i(11424),S=e.i(39403);e.i(34420),e.i(46650),e.i(10380),e.i(95157);let W=p.css`
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

  wui-visual {
    border-radius: calc(
      ${({borderRadius:e})=>e["1"]} * 9 - ${({borderRadius:e})=>e["3"]}
    );
    position: relative;
    overflow: hidden;
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

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: ${({spacing:e})=>e["01"]} ${({spacing:e})=>e["2"]};
  }
`;var B=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let _=class extends q.LitElement{constructor(){super(),this.unsubscribe=[],this.selectedOnRampProvider=a.OnRampController.state.selectedProvider,this.uri=z.ConnectionController.state.wcUri,this.ready=!1,this.showRetry=!1,this.buffering=!1,this.error=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(a.OnRampController.subscribeKey("selectedProvider",e=>{this.selectedOnRampProvider=e}))}disconnectedCallback(){this.intervalId&&clearInterval(this.intervalId)}render(){let e="Continue in external window";this.error?e="Buy failed":this.selectedOnRampProvider&&(e=`Buy in ${this.selectedOnRampProvider?.label}`);let t=this.error?"Buy can be declined from your side or due to and error on the provider app":"We’ll notify you once your Buy is processed";return r.html`
      <wui-flex
        data-error=${(0,o.ifDefined)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-visual
            name=${(0,o.ifDefined)(this.selectedOnRampProvider?.name)}
            size="lg"
            class="provider-image"
          >
          </wui-visual>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["4","0","0","0"]}
        >
          <wui-text variant="md-medium" color=${this.error?"error":"primary"}>
            ${e}
          </wui-text>
          <wui-text align="center" variant="sm-medium" color="secondary">${t}</wui-text>
        </wui-flex>

        ${this.error?this.tryAgainTemplate():null}
      </wui-flex>

      <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
        <wui-link @click=${this.onCopyUri} color="secondary">
          <wui-icon size="sm" color="default" slot="iconLeft" name="copy"></wui-icon>
          Copy link
        </wui-link>
      </wui-flex>
    `}onTryAgain(){this.selectedOnRampProvider&&(this.error=!1,f.CoreHelperUtil.openHref(this.selectedOnRampProvider.url,"popupWindow","width=600,height=800,scrollbars=yes"))}tryAgainTemplate(){return this.selectedOnRampProvider?.url?r.html`<wui-button size="md" variant="accent" @click=${this.onTryAgain.bind(this)}>
      <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
      Try again
    </wui-button>`:null}loaderTemplate(){let e=S.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return r.html`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){if(!this.selectedOnRampProvider?.url){L.SnackController.showError("No link found"),g.RouterController.goBack();return}try{f.CoreHelperUtil.copyToClopboard(this.selectedOnRampProvider.url),L.SnackController.showSuccess("Link copied")}catch{L.SnackController.showError("Failed to copy")}}};_.styles=W,B([(0,i.state)()],_.prototype,"intervalId",void 0),B([(0,i.state)()],_.prototype,"selectedOnRampProvider",void 0),B([(0,i.state)()],_.prototype,"uri",void 0),B([(0,i.state)()],_.prototype,"ready",void 0),B([(0,i.state)()],_.prototype,"showRetry",void 0),B([(0,i.state)()],_.prototype,"buffering",void 0),B([(0,i.state)()],_.prototype,"error",void 0),B([(0,x.property)({type:Boolean})],_.prototype,"isMobile",void 0),B([(0,x.property)()],_.prototype,"onRetry",void 0),_=B([(0,u.customElement)("w3m-buy-in-progress-view")],_),e.s(["W3mBuyInProgressView",0,_],4364);var U=t;let V=class extends U.LitElement{render(){return r.html`
      <wui-flex
        flexDirection="column"
        .padding=${["6","10","5","10"]}
        alignItems="center"
        gap="5"
      >
        <wui-visual name="onrampCard"></wui-visual>
        <wui-flex flexDirection="column" gap="2" alignItems="center">
          <wui-text align="center" variant="md-medium" color="primary">
            Quickly and easily buy digital assets!
          </wui-text>
          <wui-text align="center" variant="sm-regular" color="secondary">
            Simply select your preferred onramp provider and add digital assets to your account
            using your credit card or bank transfer
          </wui-text>
        </wui-flex>
        <wui-button @click=${g.RouterController.goBack}>
          <wui-icon size="sm" color="inherit" name="add" slot="iconLeft"></wui-icon>
          Buy
        </wui-button>
      </wui-flex>
    `}};V=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n}([(0,u.customElement)("w3m-what-is-a-buy-view")],V),e.s(["W3mWhatIsABuyView",0,V],40768);var K=t,M=t;e.i(6957);let F=p.css`
  :host {
    width: 100%;
  }

  wui-loading-spinner {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .currency-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e["2"]};
    height: 40px;
    padding: ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["2"]}
      ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["2"]};
    min-width: 95px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundPrimary};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    cursor: pointer;
  }

  .currency-container > wui-image {
    height: 24px;
    width: 24px;
    border-radius: 50%;
  }
`;var N=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let H=class extends M.LitElement{constructor(){super(),this.unsubscribe=[],this.type="Token",this.value=0,this.currencies=[],this.selectedCurrency=this.currencies?.[0],this.currencyImages=s.AssetController.state.currencyImages,this.tokenImages=s.AssetController.state.tokenImages,this.unsubscribe.push(a.OnRampController.subscribeKey("purchaseCurrency",e=>{e&&"Fiat"!==this.type&&(this.selectedCurrency=this.formatPurchaseCurrency(e))}),a.OnRampController.subscribeKey("paymentCurrency",e=>{e&&"Token"!==this.type&&(this.selectedCurrency=this.formatPaymentCurrency(e))}),a.OnRampController.subscribe(e=>{"Fiat"===this.type?this.currencies=e.purchaseCurrencies.map(this.formatPurchaseCurrency):this.currencies=e.paymentCurrencies.map(this.formatPaymentCurrency)}),s.AssetController.subscribe(e=>{this.currencyImages={...e.currencyImages},this.tokenImages={...e.tokenImages}}))}firstUpdated(){a.OnRampController.getAvailableCurrencies()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.selectedCurrency?.symbol||"",t=this.currencyImages[e]||this.tokenImages[e];return r.html`<wui-input-text type="number" size="lg" value=${this.value}>
      ${this.selectedCurrency?r.html` <wui-flex
            class="currency-container"
            justifyContent="space-between"
            alignItems="center"
            gap="1"
            @click=${()=>n.ModalController.open({view:`OnRamp${this.type}Select`})}
          >
            <wui-image src=${(0,o.ifDefined)(t)}></wui-image>
            <wui-text color="primary">${this.selectedCurrency.symbol}</wui-text>
          </wui-flex>`:r.html`<wui-loading-spinner></wui-loading-spinner>`}
    </wui-input-text>`}formatPaymentCurrency(e){return{name:e.id,symbol:e.id}}formatPurchaseCurrency(e){return{name:e.name,symbol:e.symbol}}};H.styles=F,N([(0,x.property)({type:String})],H.prototype,"type",void 0),N([(0,x.property)({type:Number})],H.prototype,"value",void 0),N([(0,i.state)()],H.prototype,"currencies",void 0),N([(0,i.state)()],H.prototype,"selectedCurrency",void 0),N([(0,i.state)()],H.prototype,"currencyImages",void 0),N([(0,i.state)()],H.prototype,"tokenImages",void 0),H=N([(0,u.customElement)("w3m-onramp-input")],H);let Q=p.css`
  :host > wui-flex {
    width: 100%;
    max-width: 360px;
  }

  :host > wui-flex > wui-flex {
    border-radius: ${({borderRadius:e})=>e["8"]};
    width: 100%;
  }

  .amounts-container {
    width: 100%;
  }
`;var X=function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let Y={USD:"$",EUR:"€",GBP:"£"},G=[100,250,500,1e3],J=class extends K.LitElement{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.caipAddress=w.ChainController.state.activeCaipAddress,this.loading=n.ModalController.state.loading,this.paymentCurrency=a.OnRampController.state.paymentCurrency,this.paymentAmount=a.OnRampController.state.paymentAmount,this.purchaseAmount=a.OnRampController.state.purchaseAmount,this.quoteLoading=a.OnRampController.state.quotesLoading,this.unsubscribe.push(w.ChainController.subscribeKey("activeCaipAddress",e=>this.caipAddress=e),n.ModalController.subscribeKey("loading",e=>{this.loading=e}),a.OnRampController.subscribe(e=>{this.paymentCurrency=e.paymentCurrency,this.paymentAmount=e.paymentAmount,this.purchaseAmount=e.purchaseAmount,this.quoteLoading=e.quotesLoading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return r.html`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <w3m-onramp-input
            type="Fiat"
            @inputChange=${this.onPaymentAmountChange.bind(this)}
            .value=${this.paymentAmount||0}
          ></w3m-onramp-input>
          <w3m-onramp-input
            type="Token"
            .value=${this.purchaseAmount||0}
            .loading=${this.quoteLoading}
          ></w3m-onramp-input>
          <wui-flex justifyContent="space-evenly" class="amounts-container" gap="2">
            ${G.map(e=>r.html`<wui-button
                  variant=${this.paymentAmount===e?"accent-secondary":"neutral-secondary"}
                  size="md"
                  textVariant="md-medium"
                  fullWidth
                  @click=${()=>this.selectPresetAmount(e)}
                  >${`${Y[this.paymentCurrency?.id||"USD"]} ${e}`}</wui-button
                >`)}
          </wui-flex>
          ${this.templateButton()}
        </wui-flex>
      </wui-flex>
    `}templateButton(){return this.caipAddress?r.html`<wui-button
          @click=${this.getQuotes.bind(this)}
          variant="accent-primary"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Get quotes
        </wui-button>`:r.html`<wui-button
          @click=${this.openModal.bind(this)}
          variant="accent"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Connect wallet
        </wui-button>`}getQuotes(){this.loading||n.ModalController.open({view:"OnRampProviders"})}openModal(){n.ModalController.open({view:"Connect"})}async onPaymentAmountChange(e){a.OnRampController.setPaymentAmount(Number(e.detail)),await a.OnRampController.getQuote()}async selectPresetAmount(e){a.OnRampController.setPaymentAmount(e),await a.OnRampController.getQuote()}};J.styles=Q,X([(0,x.property)({type:Boolean})],J.prototype,"disabled",void 0),X([(0,i.state)()],J.prototype,"caipAddress",void 0),X([(0,i.state)()],J.prototype,"loading",void 0),X([(0,i.state)()],J.prototype,"paymentCurrency",void 0),X([(0,i.state)()],J.prototype,"paymentAmount",void 0),X([(0,i.state)()],J.prototype,"purchaseAmount",void 0),X([(0,i.state)()],J.prototype,"quoteLoading",void 0),J=X([(0,u.customElement)("w3m-onramp-widget")],J),e.s(["W3mOnrampWidget",0,J],9520),e.s([],26206),e.i(26206),e.i(31349),e.i(12292),e.i(96775),e.i(4364),e.i(40768),e.i(9520),e.s(["W3mBuyInProgressView",0,_,"W3mOnRampProvidersView",0,I,"W3mOnrampFiatSelectView",0,h,"W3mOnrampTokensView",0,E,"W3mOnrampWidget",0,J,"W3mWhatIsABuyView",0,V],83026)},82012,e=>{e.v(t=>Promise.all(["static/chunks/04ico-_gjm27w.js"].map(t=>e.l(t))).then(()=>t(96403)))},40171,e=>{e.v(t=>Promise.all(["static/chunks/11v3m7g373ehs.js"].map(t=>e.l(t))).then(()=>t(69592)))},10729,e=>{e.v(t=>Promise.all(["static/chunks/0xc5ogy.4cqt6.js"].map(t=>e.l(t))).then(()=>t(86977)))},80342,e=>{e.v(t=>Promise.all(["static/chunks/0_mewu7cnpsno.js"].map(t=>e.l(t))).then(()=>t(32833)))},95724,e=>{e.v(t=>Promise.all(["static/chunks/11wkp7hpvh7tf.js"].map(t=>e.l(t))).then(()=>t(72412)))},52792,e=>{e.v(t=>Promise.all(["static/chunks/0g3ui2wv8r~wc.js"].map(t=>e.l(t))).then(()=>t(26763)))},96302,e=>{e.v(t=>Promise.all(["static/chunks/0j0k6c8ggdklr.js"].map(t=>e.l(t))).then(()=>t(43229)))},44243,e=>{e.v(t=>Promise.all(["static/chunks/07wddbwvy22f0.js"].map(t=>e.l(t))).then(()=>t(12721)))},59668,e=>{e.v(t=>Promise.all(["static/chunks/09ba7-_iffhw0.js"].map(t=>e.l(t))).then(()=>t(36682)))},41373,e=>{e.v(t=>Promise.all(["static/chunks/10gk0blv0it_k.js"].map(t=>e.l(t))).then(()=>t(51383)))},69595,e=>{e.v(t=>Promise.all(["static/chunks/0bta-jrs6~00o.js"].map(t=>e.l(t))).then(()=>t(4289)))},33052,e=>{e.v(t=>Promise.all(["static/chunks/0762bbcc5~n~v.js"].map(t=>e.l(t))).then(()=>t(56357)))},280,e=>{e.v(t=>Promise.all(["static/chunks/0zft.mxso0wdv.js"].map(t=>e.l(t))).then(()=>t(78319)))},92833,e=>{e.v(t=>Promise.all(["static/chunks/0tdapn46a87b2.js"].map(t=>e.l(t))).then(()=>t(61289)))},17096,e=>{e.v(t=>Promise.all(["static/chunks/0oeos-plb2q06.js"].map(t=>e.l(t))).then(()=>t(26703)))},5963,e=>{e.v(t=>Promise.all(["static/chunks/0vhj_1cq1owug.js"].map(t=>e.l(t))).then(()=>t(9953)))},48774,e=>{e.v(t=>Promise.all(["static/chunks/0vm3duhzxw-u2.js"].map(t=>e.l(t))).then(()=>t(32295)))},50090,e=>{e.v(t=>Promise.all(["static/chunks/12wk3fvygoqg~.js"].map(t=>e.l(t))).then(()=>t(52019)))},38711,e=>{e.v(t=>Promise.all(["static/chunks/1408kbi9bcza3.js"].map(t=>e.l(t))).then(()=>t(64871)))},50621,e=>{e.v(t=>Promise.all(["static/chunks/0881hmc9re8px.js"].map(t=>e.l(t))).then(()=>t(59021)))},5462,e=>{e.v(t=>Promise.all(["static/chunks/04f2_hmveaqeu.js"].map(t=>e.l(t))).then(()=>t(65788)))},70963,e=>{e.v(t=>Promise.all(["static/chunks/0zhiq_0493.r0.js"].map(t=>e.l(t))).then(()=>t(17729)))},56906,e=>{e.v(t=>Promise.all(["static/chunks/0o7t79qo-g.qk.js"].map(t=>e.l(t))).then(()=>t(34056)))},78023,e=>{e.v(t=>Promise.all(["static/chunks/0p-trm74a~_nw.js"].map(t=>e.l(t))).then(()=>t(71507)))},69039,e=>{e.v(t=>Promise.all(["static/chunks/015dz_0fuvoul.js"].map(t=>e.l(t))).then(()=>t(2658)))},63605,e=>{e.v(t=>Promise.all(["static/chunks/0jt_ui_som86b.js"].map(t=>e.l(t))).then(()=>t(39621)))},42324,e=>{e.v(t=>Promise.all(["static/chunks/16ae95zbkbei2.js"].map(t=>e.l(t))).then(()=>t(11923)))},84968,e=>{e.v(t=>Promise.all(["static/chunks/139-5-~k-a9_a.js"].map(t=>e.l(t))).then(()=>t(74571)))},44020,e=>{e.v(t=>Promise.all(["static/chunks/0sj204xziysfx.js"].map(t=>e.l(t))).then(()=>t(84535)))},50711,e=>{e.v(t=>Promise.all(["static/chunks/0mb5g5c08bg3_.js"].map(t=>e.l(t))).then(()=>t(15680)))},56601,e=>{e.v(t=>Promise.all(["static/chunks/04ao4kqg7-71z.js"].map(t=>e.l(t))).then(()=>t(1958)))},81254,e=>{e.v(t=>Promise.all(["static/chunks/0ylfzksb.ysq3.js"].map(t=>e.l(t))).then(()=>t(11420)))},79893,e=>{e.v(t=>Promise.all(["static/chunks/11vp.ou5.wgk..js"].map(t=>e.l(t))).then(()=>t(52452)))},1514,e=>{e.v(t=>Promise.all(["static/chunks/15_vj4ft3pkw2.js"].map(t=>e.l(t))).then(()=>t(35252)))},44980,e=>{e.v(t=>Promise.all(["static/chunks/0abw.we2fvq85.js"].map(t=>e.l(t))).then(()=>t(80835)))},84074,e=>{e.v(t=>Promise.all(["static/chunks/0qu2ipod_3dre.js"].map(t=>e.l(t))).then(()=>t(94301)))},67422,e=>{e.v(t=>Promise.all(["static/chunks/0trdrklutxs6s.js"].map(t=>e.l(t))).then(()=>t(89931)))},13200,e=>{e.v(t=>Promise.all(["static/chunks/0wufvuse0m1df.js"].map(t=>e.l(t))).then(()=>t(69097)))},48479,e=>{e.v(t=>Promise.all(["static/chunks/039hmx6plo.3u.js"].map(t=>e.l(t))).then(()=>t(88299)))},67369,e=>{e.v(t=>Promise.all(["static/chunks/0avogfle0agse.js"].map(t=>e.l(t))).then(()=>t(66712)))},77793,e=>{e.v(t=>Promise.all(["static/chunks/0xub8so4d47.0.js"].map(t=>e.l(t))).then(()=>t(71960)))},4447,e=>{e.v(t=>Promise.all(["static/chunks/144lv8k~l5496.js"].map(t=>e.l(t))).then(()=>t(65425)))},93690,e=>{e.v(t=>Promise.all(["static/chunks/0acgxj--f7i8u.js"].map(t=>e.l(t))).then(()=>t(65891)))},77385,e=>{e.v(t=>Promise.all(["static/chunks/0qk6uu2q1tw_v.js"].map(t=>e.l(t))).then(()=>t(84131)))},65739,e=>{e.v(t=>Promise.all(["static/chunks/12lr98o1.yd7g.js"].map(t=>e.l(t))).then(()=>t(9900)))},80304,e=>{e.v(t=>Promise.all(["static/chunks/10lvb6.5.uxa9.js"].map(t=>e.l(t))).then(()=>t(45017)))},9957,e=>{e.v(t=>Promise.all(["static/chunks/0.7amhpjej0na.js"].map(t=>e.l(t))).then(()=>t(44919)))},22236,e=>{e.v(t=>Promise.all(["static/chunks/0z~mfwxrvgs-s.js"].map(t=>e.l(t))).then(()=>t(6501)))},40934,e=>{e.v(t=>Promise.all(["static/chunks/0c.ugbg-cm92~.js"].map(t=>e.l(t))).then(()=>t(13559)))},71802,e=>{e.v(t=>Promise.all(["static/chunks/0u00gqq-1y.-7.js"].map(t=>e.l(t))).then(()=>t(94384)))},57792,e=>{e.v(t=>Promise.all(["static/chunks/0l23c_y.nej82.js"].map(t=>e.l(t))).then(()=>t(76208)))},7885,e=>{e.v(t=>Promise.all(["static/chunks/047hyf3ib.ncs.js"].map(t=>e.l(t))).then(()=>t(56529)))}]);