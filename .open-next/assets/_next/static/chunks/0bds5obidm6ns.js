(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,93801,e=>{"use strict";e.i(12207);var t=e.i(8285),i=e.i(54479);e.i(74576);var r=e.i(56350),n=e.i(36220),o=e.i(60398),s=e.i(71080),l=e.i(60334),a=e.i(27302),c=e.i(3468),u=e.i(21728),d=e.i(94712),h=e.i(11424),p=e.i(47755),m=e.i(18887);e.i(4041);var f=e.i(45975);e.i(34420),e.i(62238),e.i(46650),e.i(79929);var w=t,g=e.i(20119);e.i(84326);var k=e.i(65090);e.i(43452),e.i(49536);var v=e.i(62611);let y=v.css`
  :host {
    width: 100%;
    height: 100px;
    border-radius: ${({borderRadius:e})=>e["5"]};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color;
    position: relative;
  }

  :host(:hover) {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    display: ruby;
    color: ${({tokens:e})=>e.theme.textPrimary};
    margin: 0 ${({spacing:e})=>e["2"]};
  }

  .instruction {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }

  .paste {
    display: inline-flex;
  }

  textarea {
    background: transparent;
    width: 100%;
    font-family: ${({fontFamily:e})=>e.regular};
    font-style: normal;
    font-size: ${({textSize:e})=>e.large};
    font-weight: ${({fontWeight:e})=>e.regular};
    line-height: ${({typography:e})=>e["lg-regular"].lineHeight};
    letter-spacing: ${({typography:e})=>e["lg-regular"].letterSpacing};
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    border: none;
    outline: none;
    appearance: none;
    resize: none;
    overflow: hidden;
  }
`;var x=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let b=class extends w.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,k.createRef)(),this.instructionElementRef=(0,k.createRef)(),this.readOnly=!1,this.instructionHidden=!!this.value,this.pasting=!1,this.onDebouncedSearch=a.CoreHelperUtil.debounce(async e=>{if(!e.length)return void this.setReceiverAddress("");let t=o.ChainController.state.activeChain;if(a.CoreHelperUtil.isAddress(e,t))return void this.setReceiverAddress(e);try{let t=await s.ConnectionController.getEnsAddress(e);if(t){d.SendController.setReceiverProfileName(e),d.SendController.setReceiverAddress(t);let i=await s.ConnectionController.getEnsAvatar(e);d.SendController.setReceiverProfileImageUrl(i||void 0)}}catch(t){this.setReceiverAddress(e)}finally{d.SendController.setLoading(!1)}})}firstUpdated(){this.value&&(this.instructionHidden=!0),this.checkHidden()}render(){return this.readOnly?i.html` <wui-flex
        flexDirection="column"
        justifyContent="center"
        gap="01"
        .padding=${["8","4","5","4"]}
      >
        <textarea
          spellcheck="false"
          ?disabled=${!0}
          autocomplete="off"
          .value=${this.value??""}
        >
           ${this.value??""}</textarea
        >
      </wui-flex>`:i.html` <wui-flex
      @click=${this.onBoxClick.bind(this)}
      flexDirection="column"
      justifyContent="center"
      gap="01"
      .padding=${["8","4","5","4"]}
    >
      <wui-text
        ${(0,k.ref)(this.instructionElementRef)}
        class="instruction"
        color="secondary"
        variant="md-medium"
      >
        Type or
        <wui-button
          class="paste"
          size="md"
          variant="neutral-secondary"
          iconLeft="copy"
          @click=${this.onPasteClick.bind(this)}
        >
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="copy"></wui-icon>
          Paste
        </wui-button>
        address
      </wui-text>
      <textarea
        spellcheck="false"
        ?disabled=${!this.instructionHidden}
        ${(0,k.ref)(this.inputElementRef)}
        @input=${this.onInputChange.bind(this)}
        @blur=${this.onBlur.bind(this)}
        .value=${this.value??""}
        autocomplete="off"
      >
${this.value??""}</textarea
      >
    </wui-flex>`}async focusInput(){this.instructionElementRef.value&&(this.instructionHidden=!0,await this.toggleInstructionFocus(!1),this.instructionElementRef.value.style.pointerEvents="none",this.inputElementRef.value?.focus(),this.inputElementRef.value&&(this.inputElementRef.value.selectionStart=this.inputElementRef.value.selectionEnd=this.inputElementRef.value.value.length))}async focusInstruction(){this.instructionElementRef.value&&(this.instructionHidden=!1,await this.toggleInstructionFocus(!0),this.instructionElementRef.value.style.pointerEvents="auto",this.inputElementRef.value?.blur())}async toggleInstructionFocus(e){this.instructionElementRef.value&&await this.instructionElementRef.value.animate([{opacity:+!e},{opacity:+!!e}],{duration:100,easing:"ease",fill:"forwards"}).finished}onBoxClick(){this.value||this.instructionHidden||this.focusInput()}onBlur(){this.value||!this.instructionHidden||this.pasting||this.focusInstruction()}checkHidden(){this.instructionHidden&&this.focusInput()}async onPasteClick(){this.pasting=!0;let e=await navigator.clipboard.readText();d.SendController.setReceiverAddress(e),this.focusInput()}onInputChange(e){let t=e.target;this.pasting=!1,this.value=e.target?.value,t.value&&!this.instructionHidden&&this.focusInput(),d.SendController.setLoading(!0),this.onDebouncedSearch(t.value)}setReceiverAddress(e){d.SendController.setReceiverAddress(e),d.SendController.setReceiverProfileName(void 0),d.SendController.setReceiverProfileImageUrl(void 0),d.SendController.setLoading(!1)}};b.styles=y,x([(0,g.property)()],b.prototype,"value",void 0),x([(0,g.property)({type:Boolean})],b.prototype,"readOnly",void 0),x([(0,r.state)()],b.prototype,"instructionHidden",void 0),x([(0,r.state)()],b.prototype,"pasting",void 0),b=x([(0,f.customElement)("w3m-input-address")],b);var C=t,$=e.i(75457),S=e.i(12699);e.i(38822),e.i(10380),e.i(97521);let A=v.css`
  :host {
    width: 100%;
    height: 100px;
    border-radius: ${({borderRadius:e})=>e["5"]};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color;
    transition: all ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.lg};
  }

  :host(:hover) {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  wui-input-amount {
    mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
  }

  .totalValue {
    width: 100%;
  }
`;var T=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let R=class extends C.LitElement{constructor(){super(...arguments),this.readOnly=!1,this.isInsufficientBalance=!1}render(){let e=this.readOnly||!this.token;return i.html` <wui-flex
      flexDirection="column"
      gap="01"
      .padding=${["5","3","4","3"]}
    >
      <wui-flex alignItems="center">
        <wui-input-amount
          @inputChange=${this.onInputChange.bind(this)}
          ?disabled=${e}
          .value=${this.sendTokenAmount?String(this.sendTokenAmount):""}
          ?error=${!!this.isInsufficientBalance}
        ></wui-input-amount>
        ${this.buttonTemplate()}
      </wui-flex>
      ${this.bottomTemplate()}
    </wui-flex>`}buttonTemplate(){return this.token?i.html`<wui-token-button
        text=${this.token.symbol}
        imageSrc=${this.token.iconUrl}
        @click=${this.handleSelectButtonClick.bind(this)}
      >
      </wui-token-button>`:i.html`<wui-button
      size="md"
      variant="neutral-secondary"
      @click=${this.handleSelectButtonClick.bind(this)}
      >Select token</wui-button
    >`}handleSelectButtonClick(){this.readOnly||u.RouterController.push("WalletSendSelectToken")}sendValueTemplate(){if(!this.readOnly&&this.token&&this.sendTokenAmount){let e=this.token.price*this.sendTokenAmount;return i.html`<wui-text class="totalValue" variant="sm-regular" color="secondary"
        >${e?`$${$.NumberUtil.formatNumberToLocalString(e,2)}`:"Incorrect value"}</wui-text
      >`}return null}maxAmountTemplate(){return this.token?i.html` <wui-text variant="sm-regular" color="secondary">
        ${S.UiHelperUtil.roundNumber(Number(this.token.quantity.numeric),6,5)}
      </wui-text>`:null}actionTemplate(){return this.token?i.html`<wui-link @click=${this.onMaxClick.bind(this)}>Max</wui-link>`:null}bottomTemplate(){return this.readOnly?null:i.html`<wui-flex alignItems="center" justifyContent="space-between">
      ${this.sendValueTemplate()}
      <wui-flex alignItems="center" gap="01" justifyContent="flex-end">
        ${this.maxAmountTemplate()} ${this.actionTemplate()}
      </wui-flex>
    </wui-flex>`}onInputChange(e){d.SendController.setTokenAmount(e.detail)}onMaxClick(){if(this.token){let e=$.NumberUtil.bigNumber(this.token.quantity.numeric);d.SendController.setTokenAmount(Number(e.toFixed(20)))}}};R.styles=A,T([(0,g.property)({type:Object})],R.prototype,"token",void 0),T([(0,g.property)({type:Boolean})],R.prototype,"readOnly",void 0),T([(0,g.property)({type:Number})],R.prototype,"sendTokenAmount",void 0),T([(0,g.property)({type:Boolean})],R.prototype,"isInsufficientBalance",void 0),R=T([(0,f.customElement)("w3m-input-token")],R);let P=v.css`
  :host {
    display: block;
  }

  wui-flex {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e["10"]} !important;
    border: 4px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  wui-button {
    --local-border-radius: ${({borderRadius:e})=>e["4"]} !important;
  }

  .inputContainer {
    height: fit-content;
  }
`;var E=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let N="Insufficient Funds",I="Preview Send",B=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.isTryingToChooseDifferentWallet=!1,this.token=d.SendController.state.token,this.sendTokenAmount=d.SendController.state.sendTokenAmount,this.receiverAddress=d.SendController.state.receiverAddress,this.receiverProfileName=d.SendController.state.receiverProfileName,this.loading=d.SendController.state.loading,this.params=u.RouterController.state.data?.send,this.caipAddress=o.ChainController.getAccountData()?.caipAddress,this.message=I,this.disconnecting=!1,this.token&&!this.params&&(this.fetchBalances(),this.fetchNetworkPrice());const e=o.ChainController.subscribeKey("activeCaipAddress",t=>{!t&&this.isTryingToChooseDifferentWallet&&(this.isTryingToChooseDifferentWallet=!1,c.ModalController.open({view:"Connect",data:{redirectView:"WalletSend"}}).catch(()=>null),e())});this.unsubscribe.push(o.ChainController.subscribeAccountStateProp("caipAddress",e=>{this.caipAddress=e}),d.SendController.subscribe(e=>{this.token=e.token,this.sendTokenAmount=e.sendTokenAmount,this.receiverAddress=e.receiverAddress,this.receiverProfileName=e.receiverProfileName,this.loading=e.loading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}async firstUpdated(){await this.handleSendParameters()}render(){this.getMessage();let e=!!this.params;return i.html` <wui-flex flexDirection="column" .padding=${["0","4","4","4"]}>
      <wui-flex class="inputContainer" gap="2" flexDirection="column">
        <w3m-input-token
          .token=${this.token}
          .sendTokenAmount=${this.sendTokenAmount}
          ?readOnly=${e}
          ?isInsufficientBalance=${this.message===N}
        ></w3m-input-token>
        <wui-icon-box size="md" variant="secondary" icon="arrowBottom"></wui-icon-box>
        <w3m-input-address
          ?readOnly=${e}
          .value=${this.receiverProfileName?this.receiverProfileName:this.receiverAddress}
        ></w3m-input-address>
      </wui-flex>
      ${this.buttonTemplate()}
    </wui-flex>`}async fetchBalances(){await d.SendController.fetchTokenBalance(),d.SendController.fetchNetworkBalance()}async fetchNetworkPrice(){await p.SwapController.getNetworkTokenPrice()}onButtonClick(){u.RouterController.push("WalletSendPreview",{send:this.params})}onFundWalletClick(){u.RouterController.push("FundWallet",{redirectView:"WalletSend"})}async onConnectDifferentWalletClick(){try{this.isTryingToChooseDifferentWallet=!0,this.disconnecting=!0,await s.ConnectionController.disconnect()}finally{this.disconnecting=!1}}getMessage(){this.message=I,this.receiverAddress&&!a.CoreHelperUtil.isAddress(this.receiverAddress,o.ChainController.state.activeChain)&&(this.message="Invalid Address"),this.receiverAddress||(this.message="Add Address"),this.sendTokenAmount&&this.token&&this.sendTokenAmount>Number(this.token.quantity.numeric)&&(this.message=N),this.sendTokenAmount||(this.message="Add Amount"),this.sendTokenAmount&&this.token?.price&&(this.sendTokenAmount*this.token.price||(this.message="Incorrect Value")),this.token||(this.message="Select Token")}buttonTemplate(){let e=!this.message.startsWith(I),t=this.message===N,r=!!this.params;return t&&!r?i.html`
        <wui-flex .margin=${["4","0","0","0"]} flexDirection="column" gap="4">
          <wui-button
            @click=${this.onFundWalletClick.bind(this)}
            size="lg"
            variant="accent-secondary"
            fullWidth
          >
            Fund Wallet
          </wui-button>

          <wui-separator data-testid="wui-separator" text="or"></wui-separator>

          <wui-button
            @click=${this.onConnectDifferentWalletClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
            fullWidth
            ?loading=${this.disconnecting}
          >
            Connect a different wallet
          </wui-button>
        </wui-flex>
      `:i.html`<wui-flex .margin=${["4","0","0","0"]}>
      <wui-button
        @click=${this.onButtonClick.bind(this)}
        ?disabled=${e}
        size="lg"
        variant="accent-primary"
        ?loading=${this.loading}
        fullWidth
      >
        ${this.message}
      </wui-button>
    </wui-flex>`}async handleSendParameters(){if(this.loading=!0,!this.params){this.loading=!1;return}let e=Number(this.params.amount);if(isNaN(e)){h.SnackController.showError("Invalid amount"),this.loading=!1;return}let{namespace:t,chainId:i,assetAddress:r}=this.params;if(!l.ConstantsUtil.SEND_PARAMS_SUPPORTED_CHAINS.includes(t)){h.SnackController.showError(`Chain "${t}" is not supported for send parameters`),this.loading=!1;return}let s=o.ChainController.getCaipNetworkById(i,t);if(!s){h.SnackController.showError(`Network with id "${i}" not found`),this.loading=!1;return}try{let{balance:t,name:i,symbol:o,decimals:l}=await m.BalanceUtil.fetchERC20Balance({caipAddress:this.caipAddress,assetAddress:r,caipNetwork:s});if(!i||!o||!l||!t)return void h.SnackController.showError("Token not found");d.SendController.setToken({name:i,symbol:o,chainId:s.id.toString(),address:`${s.chainNamespace}:${s.id}:${r}`,value:0,price:0,quantity:{decimals:l.toString(),numeric:t.toString()},iconUrl:n.AssetUtil.getTokenImage(o)??""}),d.SendController.setTokenAmount(e),d.SendController.setReceiverAddress(this.params.to)}catch(e){console.error("Failed to load token information:",e),h.SnackController.showError("Failed to load token information")}finally{this.loading=!1}}};B.styles=P,E([(0,r.state)()],B.prototype,"token",void 0),E([(0,r.state)()],B.prototype,"sendTokenAmount",void 0),E([(0,r.state)()],B.prototype,"receiverAddress",void 0),E([(0,r.state)()],B.prototype,"receiverProfileName",void 0),E([(0,r.state)()],B.prototype,"loading",void 0),E([(0,r.state)()],B.prototype,"params",void 0),E([(0,r.state)()],B.prototype,"caipAddress",void 0),E([(0,r.state)()],B.prototype,"message",void 0),E([(0,r.state)()],B.prototype,"disconnecting",void 0),B=E([(0,f.customElement)("w3m-wallet-send-view")],B),e.s(["W3mWalletSendView",0,B],58835);var O=t;e.i(6957),e.i(23838);let D=v.css`
  .contentContainer {
    height: 440px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }

  wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e["3"]};
  }
`;var j=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let U=class extends O.LitElement{constructor(){super(),this.unsubscribe=[],this.tokenBalances=d.SendController.state.tokenBalances,this.search="",this.onDebouncedSearch=a.CoreHelperUtil.debounce(e=>{this.search=e}),this.fetchBalancesAndNetworkPrice(),this.unsubscribe.push(d.SendController.subscribe(e=>{this.tokenBalances=e.tokenBalances}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `}async fetchBalancesAndNetworkPrice(){this.tokenBalances&&this.tokenBalances?.length!==0||(await this.fetchBalances(),await this.fetchNetworkPrice())}async fetchBalances(){await d.SendController.fetchTokenBalance(),d.SendController.fetchNetworkBalance()}async fetchNetworkPrice(){await p.SwapController.getNetworkTokenPrice()}templateSearchInput(){return i.html`
      <wui-flex gap="2" padding="3">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}templateTokens(){return this.tokens=this.tokenBalances?.filter(e=>e.chainId===o.ChainController.state.activeCaipNetwork?.caipNetworkId),this.search?this.filteredTokens=this.tokenBalances?.filter(e=>e.name.toLowerCase().includes(this.search.toLowerCase())):this.filteredTokens=this.tokens,i.html`
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${["0","3","0","3"]}
      >
        <wui-flex justifyContent="flex-start" .padding=${["4","3","3","3"]}>
          <wui-text variant="md-medium" color="secondary">Your tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${this.filteredTokens&&this.filteredTokens.length>0?this.filteredTokens.map(e=>i.html`<wui-list-token
                    @click=${this.handleTokenClick.bind(this,e)}
                    ?clickable=${!0}
                    tokenName=${e.name}
                    tokenImageUrl=${e.iconUrl}
                    tokenAmount=${e.quantity.numeric}
                    tokenValue=${e.value}
                    tokenCurrency=${e.symbol}
                  ></wui-list-token>`):i.html`<wui-flex
                .padding=${["20","0","0","0"]}
                alignItems="center"
                flexDirection="column"
                gap="4"
              >
                <wui-icon-box icon="coinPlaceholder" color="default" size="lg"></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="2"
                  flexDirection="column"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                  <wui-text variant="lg-regular" align="center" color="secondary">
                    Your tokens will appear here
                  </wui-text>
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `}onBuyClick(){u.RouterController.push("OnRampProviders")}onInputChange(e){this.onDebouncedSearch(e.detail)}handleTokenClick(e){d.SendController.setToken(e),d.SendController.setTokenAmount(void 0),u.RouterController.goBack()}};U.styles=D,j([(0,r.state)()],U.prototype,"tokenBalances",void 0),j([(0,r.state)()],U.prototype,"tokens",void 0),j([(0,r.state)()],U.prototype,"filteredTokens",void 0),j([(0,r.state)()],U.prototype,"search",void 0),U=j([(0,f.customElement)("w3m-wallet-send-select-token-view")],U),e.s(["W3mSendSelectTokenView",0,U],35989);var W=t,V=e.i(83075),z=e.i(92279),H=e.i(53157),L=t;e.i(52634),e.i(64380),e.i(39009),e.i(73944);var _=e.i(59088);e.i(21803);let F=v.css`
  :host {
    height: 32px;
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    border-radius: ${({borderRadius:e})=>e[32]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    padding: ${({spacing:e})=>e[1]};
    padding-left: ${({spacing:e})=>e[2]};
  }

  wui-avatar,
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-icon {
    border-radius: ${({borderRadius:e})=>e[16]};
  }
`;var M=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let K=class extends L.LitElement{constructor(){super(...arguments),this.text=""}render(){return i.html`<wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      ${this.imageTemplate()}`}imageTemplate(){return this.address?i.html`<wui-avatar address=${this.address} .imageSrc=${this.imageSrc}></wui-avatar>`:this.imageSrc?i.html`<wui-image src=${this.imageSrc}></wui-image>`:i.html`<wui-icon size="lg" color="inverse" name="networkPlaceholder"></wui-icon>`}};K.styles=[_.resetStyles,_.elementStyles,F],M([(0,g.property)({type:String})],K.prototype,"text",void 0),M([(0,g.property)({type:String})],K.prototype,"address",void 0),M([(0,g.property)({type:String})],K.prototype,"imageSrc",void 0),K=M([(0,f.customElement)("wui-preview-item")],K);var q=t;e.i(34051);var Y=e.i(29389),J=t;let Q=v.css`
  :host {
    display: flex;
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-image {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-icon {
    width: 20px;
    height: 20px;
  }
`;var G=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let X=class extends J.LitElement{constructor(){super(...arguments),this.imageSrc=void 0,this.textTitle="",this.textValue=void 0}render(){return i.html`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="primary"> ${this.textTitle} </wui-text>
        ${this.templateContent()}
      </wui-flex>
    `}templateContent(){return this.imageSrc?i.html`<wui-image src=${this.imageSrc} alt=${this.textTitle}></wui-image>`:this.textValue?i.html` <wui-text variant="md-regular" color="secondary"> ${this.textValue} </wui-text>`:i.html`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};X.styles=[_.resetStyles,_.elementStyles,Q],G([(0,g.property)()],X.prototype,"imageSrc",void 0),G([(0,g.property)()],X.prototype,"textTitle",void 0),G([(0,g.property)()],X.prototype,"textValue",void 0),X=G([(0,f.customElement)("wui-list-content")],X);let Z=v.css`
  :host {
    display: flex;
    width: auto;
    flex-direction: column;
    gap: ${({spacing:e})=>e["1"]};
    border-radius: ${({borderRadius:e})=>e["5"]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    padding: ${({spacing:e})=>e["3"]} ${({spacing:e})=>e["2"]}
      ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["2"]};
  }

  wui-list-content {
    width: -webkit-fill-available !important;
  }

  wui-text {
    padding: 0 ${({spacing:e})=>e["2"]};
  }

  wui-flex {
    margin-top: ${({spacing:e})=>e["2"]};
  }

  .network {
    cursor: pointer;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color;
  }

  .network:focus-visible {
    border: 1px solid ${({tokens:e})=>e.core.textAccentPrimary};
    background-color: ${({tokens:e})=>e.core.glass010};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent010};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent010};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent010};
  }

  .network:hover {
    background-color: ${({tokens:e})=>e.core.glass010};
  }

  .network:active {
    background-color: ${({tokens:e})=>e.core.glass010};
  }
`;var ee=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let et=class extends q.LitElement{constructor(){super(...arguments),this.params=u.RouterController.state.data?.send}render(){return i.html` <wui-text variant="sm-regular" color="secondary">Details</wui-text>
      <wui-flex flexDirection="column" gap="1">
        <wui-list-content
          textTitle="Address"
          textValue=${S.UiHelperUtil.getTruncateString({string:this.receiverAddress??"",charsStart:4,charsEnd:4,truncate:"middle"})}
        >
        </wui-list-content>
        ${this.networkTemplate()}
      </wui-flex>`}networkTemplate(){return this.caipNetwork?.name?i.html` <wui-list-content
        @click=${()=>this.onNetworkClick(this.caipNetwork)}
        class="network"
        textTitle="Network"
        imageSrc=${(0,Y.ifDefined)(n.AssetUtil.getNetworkImage(this.caipNetwork))}
      ></wui-list-content>`:null}onNetworkClick(e){e&&!this.params&&u.RouterController.push("Networks",{network:e})}};et.styles=Z,ee([(0,g.property)()],et.prototype,"receiverAddress",void 0),ee([(0,g.property)({type:Object})],et.prototype,"caipNetwork",void 0),ee([(0,r.state)()],et.prototype,"params",void 0),et=ee([(0,f.customElement)("w3m-wallet-send-details")],et);let ei=v.css`
  wui-avatar,
  wui-image {
    display: ruby;
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e["20"]};
  }

  .sendButton {
    width: 70%;
    --local-width: 100% !important;
    --local-border-radius: ${({borderRadius:e})=>e["4"]} !important;
  }

  .cancelButton {
    width: 30%;
    --local-width: 100% !important;
    --local-border-radius: ${({borderRadius:e})=>e["4"]} !important;
  }
`;var er=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};let en=class extends W.LitElement{constructor(){super(),this.unsubscribe=[],this.token=d.SendController.state.token,this.sendTokenAmount=d.SendController.state.sendTokenAmount,this.receiverAddress=d.SendController.state.receiverAddress,this.receiverProfileName=d.SendController.state.receiverProfileName,this.receiverProfileImageUrl=d.SendController.state.receiverProfileImageUrl,this.caipNetwork=o.ChainController.state.activeCaipNetwork,this.loading=d.SendController.state.loading,this.params=u.RouterController.state.data?.send,this.unsubscribe.push(d.SendController.subscribe(e=>{this.token=e.token,this.sendTokenAmount=e.sendTokenAmount,this.receiverAddress=e.receiverAddress,this.receiverProfileName=e.receiverProfileName,this.receiverProfileImageUrl=e.receiverProfileImageUrl,this.loading=e.loading}),o.ChainController.subscribeKey("activeCaipNetwork",e=>this.caipNetwork=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html` <wui-flex flexDirection="column" .padding=${["0","4","4","4"]}>
      <wui-flex gap="2" flexDirection="column" .padding=${["0","2","0","2"]}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="01">
            <wui-text variant="sm-regular" color="secondary">Send</wui-text>
            ${this.sendValueTemplate()}
          </wui-flex>
          <wui-preview-item
            text="${this.sendTokenAmount?S.UiHelperUtil.roundNumber(this.sendTokenAmount,6,5):"unknown"} ${this.token?.symbol}"
            .imageSrc=${this.token?.iconUrl}
          ></wui-preview-item>
        </wui-flex>
        <wui-flex>
          <wui-icon color="default" size="md" name="arrowBottom"></wui-icon>
        </wui-flex>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="sm-regular" color="secondary">To</wui-text>
          <wui-preview-item
            text="${this.receiverProfileName?S.UiHelperUtil.getTruncateString({string:this.receiverProfileName,charsStart:20,charsEnd:0,truncate:"end"}):S.UiHelperUtil.getTruncateString({string:this.receiverAddress?this.receiverAddress:"",charsStart:4,charsEnd:4,truncate:"middle"})}"
            address=${this.receiverAddress??""}
            .imageSrc=${this.receiverProfileImageUrl??void 0}
            .isAddress=${!0}
          ></wui-preview-item>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" .padding=${["6","0","0","0"]}>
        <w3m-wallet-send-details
          .caipNetwork=${this.caipNetwork}
          .receiverAddress=${this.receiverAddress}
        ></w3m-wallet-send-details>
        <wui-flex justifyContent="center" gap="1" .padding=${["3","0","0","0"]}>
          <wui-icon size="sm" color="default" name="warningCircle"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>
        <wui-flex justifyContent="center" gap="3" .padding=${["4","0","0","0"]}>
          <wui-button
            class="cancelButton"
            @click=${this.onCancelClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
          >
            Cancel
          </wui-button>
          <wui-button
            class="sendButton"
            @click=${this.onSendClick.bind(this)}
            size="lg"
            variant="accent-primary"
            .loading=${this.loading}
          >
            Send
          </wui-button>
        </wui-flex>
      </wui-flex></wui-flex
    >`}sendValueTemplate(){if(!this.params&&this.token&&this.sendTokenAmount){let e=this.token.price*this.sendTokenAmount;return i.html`<wui-text variant="md-regular" color="primary"
        >$${e.toFixed(2)}</wui-text
      >`}return null}async onSendClick(){if(!this.sendTokenAmount||!this.receiverAddress)return void h.SnackController.showError("Please enter a valid amount and receiver address");try{await d.SendController.sendToken(),this.params?u.RouterController.reset("WalletSendConfirmed"):(h.SnackController.showSuccess("Transaction started"),u.RouterController.replace("Account"))}catch(r){let e="Failed to send transaction",t=r instanceof z.AppKitError&&r.originalName===V.ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST,i=r instanceof z.AppKitError&&r.originalName===V.ErrorUtil.PROVIDER_RPC_ERROR_NAME.SEND_TRANSACTION_ERROR;(t||i)&&(e=r.message),H.EventsController.sendEvent({type:"track",event:t?"SEND_REJECTED":"SEND_ERROR",properties:d.SendController.getSdkEventProperties(r)}),h.SnackController.showError(e)}}onCancelClick(){u.RouterController.goBack()}};en.styles=ei,er([(0,r.state)()],en.prototype,"token",void 0),er([(0,r.state)()],en.prototype,"sendTokenAmount",void 0),er([(0,r.state)()],en.prototype,"receiverAddress",void 0),er([(0,r.state)()],en.prototype,"receiverProfileName",void 0),er([(0,r.state)()],en.prototype,"receiverProfileImageUrl",void 0),er([(0,r.state)()],en.prototype,"caipNetwork",void 0),er([(0,r.state)()],en.prototype,"loading",void 0),er([(0,r.state)()],en.prototype,"params",void 0),en=er([(0,f.customElement)("w3m-wallet-send-preview-view")],en),e.s(["W3mWalletSendPreviewView",0,en],36418);var eo=t;let es=v.css`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background-color: ${({spacing:e})=>e[16]};
    border: 8px solid ${({tokens:e})=>e.theme.borderPrimary};
    border-radius: ${({borderRadius:e})=>e.round};
  }
`,el=class extends eo.LitElement{constructor(){super(),this.unsubscribe=[],this.unsubscribe.push()}render(){return i.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${["1","3","4","3"]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="success" name="checkmark"></wui-icon>
        </wui-flex>

        <wui-text variant="h6-medium" color="primary">You successfully sent asset</wui-text>

        <wui-button
          fullWidth
          @click=${this.onCloseClick.bind(this)}
          size="lg"
          variant="neutral-secondary"
        >
          Close
        </wui-button>
      </wui-flex>
    `}onCloseClick(){c.ModalController.close()}};el.styles=es,el=function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s}([(0,f.customElement)("w3m-send-confirmed-view")],el),e.s(["W3mSendConfirmedView",0,el],47803),e.s([],83662),e.i(83662),e.i(58835),e.i(35989),e.i(36418),e.i(47803),e.s(["W3mSendConfirmedView",0,el,"W3mSendSelectTokenView",0,U,"W3mWalletSendPreviewView",0,en,"W3mWalletSendView",0,B],93801)}]);