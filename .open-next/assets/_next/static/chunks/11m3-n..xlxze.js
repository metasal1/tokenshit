(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,38822,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(20119);e.i(84326);var i=e.i(65090),n=e.i(62611),a=e.i(59088),s=e.i(12699),l=e.i(45975);let c=n.css`
  :host {
    position: relative;
    display: inline-block;
  }

  :host([data-error='true']) > input {
    color: ${({tokens:e})=>e.core.textError};
  }

  :host([data-error='false']) > input {
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  input {
    background: transparent;
    height: auto;
    box-sizing: border-box;
    color: ${({tokens:e})=>e.theme.textPrimary};
    font-feature-settings: 'case' on;
    font-size: ${({textSize:e})=>e.h4};
    caret-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    line-height: ${({typography:e})=>e["h4-regular-mono"].lineHeight};
    letter-spacing: ${({typography:e})=>e["h4-regular-mono"].letterSpacing};
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    font-family: ${({fontFamily:e})=>e.mono};
  }

  :host([data-width-variant='auto']) input {
    width: 100%;
  }

  :host([data-width-variant='fit']) input {
    width: 1ch;
  }

  .wui-input-amount-fit-mirror {
    position: absolute;
    visibility: hidden;
    white-space: pre;
    font-size: var(--local-font-size);
    line-height: 130%;
    letter-spacing: -1.28px;
    font-family: ${({fontFamily:e})=>e.mono};
  }

  .wui-input-amount-fit-width {
    display: inline-block;
    position: relative;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input::placeholder {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }
`;var u=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let d=class extends t.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,i.createRef)(),this.disabled=!1,this.value="",this.placeholder="0",this.widthVariant="auto",this.maxDecimals=void 0,this.maxIntegers=void 0,this.fontSize="h4",this.error=!1}firstUpdated(){this.resizeInput()}updated(){this.style.setProperty("--local-font-size",n.vars.textSize[this.fontSize]),this.resizeInput()}render(){return(this.dataset.widthVariant=this.widthVariant,this.dataset.error=String(this.error),this.inputElementRef?.value&&this.value&&(this.inputElementRef.value.value=this.value),"auto"===this.widthVariant)?this.inputTemplate():o.html`
      <div class="wui-input-amount-fit-width">
        <span class="wui-input-amount-fit-mirror"></span>
        ${this.inputTemplate()}
      </div>
    `}inputTemplate(){return o.html`<input
      ${(0,i.ref)(this.inputElementRef)}
      type="text"
      inputmode="decimal"
      pattern="[0-9,.]*"
      placeholder=${this.placeholder}
      ?disabled=${this.disabled}
      autofocus
      value=${this.value??""}
      @input=${this.dispatchInputChangeEvent.bind(this)}
    />`}dispatchInputChangeEvent(){this.inputElementRef.value&&(this.inputElementRef.value.value=s.UiHelperUtil.maskInput({value:this.inputElementRef.value.value,decimals:this.maxDecimals,integers:this.maxIntegers}),this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value.value,bubbles:!0,composed:!0})),this.resizeInput())}resizeInput(){if("fit"===this.widthVariant){let e=this.inputElementRef.value;if(e){let t=e.previousElementSibling;t&&(t.textContent=e.value||"0",e.style.width=`${t.offsetWidth}px`)}}}};d.styles=[a.resetStyles,a.elementStyles,c],u([(0,r.property)({type:Boolean})],d.prototype,"disabled",void 0),u([(0,r.property)({type:String})],d.prototype,"value",void 0),u([(0,r.property)({type:String})],d.prototype,"placeholder",void 0),u([(0,r.property)({type:String})],d.prototype,"widthVariant",void 0),u([(0,r.property)({type:Number})],d.prototype,"maxDecimals",void 0),u([(0,r.property)({type:Number})],d.prototype,"maxIntegers",void 0),u([(0,r.property)({type:String})],d.prototype,"fontSize",void 0),u([(0,r.property)({type:Boolean})],d.prototype,"error",void 0),d=u([(0,l.customElement)("wui-input-amount")],d),e.s([],38822)},47755,e=>{"use strict";var t=e.i(65801),o=e.i(42710),r=e.i(75457),i=e.i(1564),n=e.i(79484),a=e.i(18887),s=e.i(64126),l=e.i(60334),c=e.i(27302),u=e.i(64717);let d={getGasPriceInEther:(e,t)=>Number(t*e)/1e18,getGasPriceInUSD(e,t,o){let i=d.getGasPriceInEther(t,o);return r.NumberUtil.bigNumber(e).times(i).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:o,toTokenAmount:i}){let n=r.NumberUtil.bigNumber(e).times(t),a=r.NumberUtil.bigNumber(i).times(o);return n.minus(a).div(n).times(100).toNumber()},getMaxSlippage(e,t){let o=r.NumberUtil.bigNumber(e).div(100);return r.NumberUtil.multiply(t,o).toNumber()},getProviderFee:(e,t=.0085)=>r.NumberUtil.bigNumber(e).times(t).toString(),isInsufficientNetworkTokenForGas:(e,t)=>!!r.NumberUtil.bigNumber(e).eq(0)||r.NumberUtil.bigNumber(r.NumberUtil.bigNumber(t||"0")).gt(e),isInsufficientSourceTokenForSwap(e,t,o){let i=o?.find(e=>e.address===t)?.quantity?.numeric;return r.NumberUtil.bigNumber(i||"0").lt(e)}};var p=e.i(92279),m=e.i(51887),g=e.i(24742),h=e.i(60398),k=e.i(71080),T=e.i(49454),w=e.i(53157),b=e.i(21728),f=e.i(11424);let v={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:l.ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},y=(0,t.proxy)({...v}),S={state:y,subscribe:e=>(0,t.subscribe)(y,()=>e(y)),subscribeKey:(e,t)=>(0,o.subscribeKey)(y,e,t),getParams(){let e=h.ChainController.state.activeChain,t=h.ChainController.getAccountData(e)?.caipAddress??h.ChainController.state.activeCaipAddress,o=c.CoreHelperUtil.getPlainAddress(t),n=(0,s.getActiveNetworkTokenAddress)(),a=T.ConnectorController.getConnectorId(h.ChainController.state.activeChain);if(!o)throw Error("No address found to swap the tokens from.");let l=!y.toToken?.address||!y.toToken?.decimals,u=!y.sourceToken?.address||!y.sourceToken?.decimals||!r.NumberUtil.bigNumber(y.sourceTokenAmount).gt(0),d=!y.sourceTokenAmount;return{networkAddress:n,fromAddress:o,fromCaipAddress:t,sourceTokenAddress:y.sourceToken?.address,toTokenAddress:y.toToken?.address,toTokenAmount:y.toTokenAmount,toTokenDecimals:y.toToken?.decimals,sourceTokenAmount:y.sourceTokenAmount,sourceTokenDecimals:y.sourceToken?.decimals,invalidToToken:l,invalidSourceToken:u,invalidSourceTokenAmount:d,availableToSwap:t&&!l&&!u&&!d,isAuthConnector:a===i.ConstantsUtil.CONNECTOR_ID.AUTH}},async setSourceToken(e){if(!e){y.sourceToken=e,y.sourceTokenAmount="",y.sourceTokenPriceInUSD=0;return}y.sourceToken=e,await A.setTokenPrice(e.address,"sourceToken")},setSourceTokenAmount(e){y.sourceTokenAmount=e},async setToToken(e){if(!e){y.toToken=e,y.toTokenAmount="",y.toTokenPriceInUSD=0;return}y.toToken=e,await A.setTokenPrice(e.address,"toToken")},setToTokenAmount(e){y.toTokenAmount=e?r.NumberUtil.toFixed(e,6):""},async setTokenPrice(e,t){let o=y.tokensPriceMap[e]||0;o||(y.loadingPrices=!0,o=await A.getAddressPrice(e)),"sourceToken"===t?y.sourceTokenPriceInUSD=o:"toToken"===t&&(y.toTokenPriceInUSD=o),y.loadingPrices&&(y.loadingPrices=!1),A.getParams().availableToSwap&&!y.switchingTokens&&A.swapTokens()},async switchTokens(){if(!y.initializing&&y.initialized&&!y.switchingTokens){y.switchingTokens=!0;try{let e=y.toToken?{...y.toToken}:void 0,t=y.sourceToken?{...y.sourceToken}:void 0,o=e&&""===y.toTokenAmount?"1":y.toTokenAmount;A.setSourceTokenAmount(o),A.setToTokenAmount(""),await A.setSourceToken(e),await A.setToToken(t),y.switchingTokens=!1,A.swapTokens()}catch(e){throw y.switchingTokens=!1,e}}},resetState(){y.myTokensWithBalance=v.myTokensWithBalance,y.tokensPriceMap=v.tokensPriceMap,y.initialized=v.initialized,y.initializing=v.initializing,y.switchingTokens=v.switchingTokens,y.sourceToken=v.sourceToken,y.sourceTokenAmount=v.sourceTokenAmount,y.sourceTokenPriceInUSD=v.sourceTokenPriceInUSD,y.toToken=v.toToken,y.toTokenAmount=v.toTokenAmount,y.toTokenPriceInUSD=v.toTokenPriceInUSD,y.networkPrice=v.networkPrice,y.networkTokenSymbol=v.networkTokenSymbol,y.networkBalanceInUSD=v.networkBalanceInUSD,y.inputError=v.inputError},resetValues(){let{networkAddress:e}=A.getParams(),t=y.tokens?.find(t=>t.address===e);A.setSourceToken(t),A.setToToken(void 0)},getApprovalLoadingState:()=>y.loadingApprovalTransaction,clearError(){y.transactionError=void 0},async initializeState(){if(!y.initializing){if(y.initializing=!0,!y.initialized)try{await A.fetchTokens(),y.initialized=!0}catch(e){y.initialized=!1,f.SnackController.showError("Failed to initialize swap"),b.RouterController.goBack()}y.initializing=!1}},async fetchTokens(){let{networkAddress:e}=A.getParams();await A.getNetworkTokenPrice(),await A.getMyTokensWithBalance();let t=y.myTokensWithBalance?.find(t=>t.address===e);t&&(y.networkTokenSymbol=t.symbol,A.setSourceToken(t),A.setSourceTokenAmount("0"))},async getTokenList(){let e=h.ChainController.state.activeCaipNetwork?.caipNetworkId;if(y.caipNetworkId!==e||!y.tokens)try{y.tokensLoading=!0;let t=await u.SwapApiUtil.getTokenList(e);y.tokens=t,y.caipNetworkId=e,y.popularTokens=t.sort((e,t)=>e.symbol<t.symbol?-1:+(e.symbol>t.symbol));let o=(e&&l.ConstantsUtil.SUGGESTED_TOKENS_BY_CHAIN?.[e]||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e),r=(l.ConstantsUtil.SWAP_SUGGESTED_TOKENS||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e).filter(e=>!o.some(t=>t.address===e.address));y.suggestedTokens=[...o,...r]}catch(e){y.tokens=[],y.popularTokens=[],y.suggestedTokens=[]}finally{y.tokensLoading=!1}},async getAddressPrice(e){let t=y.tokensPriceMap[e];if(t)return t;let o=await g.BlockchainApiController.fetchTokenPrice({addresses:[e]}),r=o?.fungibles||[],i=[...y.tokens||[],...y.myTokensWithBalance||[]],n=i?.find(t=>t.address===e)?.symbol,a=parseFloat((r.find(e=>e.symbol.toLowerCase()===n?.toLowerCase())?.price||0).toString());return y.tokensPriceMap[e]=a,a},async getNetworkTokenPrice(){let{networkAddress:e}=A.getParams(),t=await g.BlockchainApiController.fetchTokenPrice({addresses:[e]}).catch(()=>(f.SnackController.showError("Failed to fetch network token price"),{fungibles:[]})),o=t.fungibles?.[0],r=o?.price.toString()||"0";y.tokensPriceMap[e]=parseFloat(r),y.networkTokenSymbol=o?.symbol||"",y.networkPrice=r},async getMyTokensWithBalance(e){let t=await a.BalanceUtil.getMyTokensWithBalance({forceUpdate:e,caipNetwork:h.ChainController.state.activeCaipNetwork,address:h.ChainController.getAccountData()?.address}),o=u.SwapApiUtil.mapBalancesToSwapTokens(t);o&&(await A.getInitialGasPrice(),A.setBalances(o))},setBalances(e){let{networkAddress:t}=A.getParams(),o=h.ChainController.state.activeCaipNetwork;if(!o)return;let i=e.find(e=>e.address===t);e.forEach(e=>{y.tokensPriceMap[e.address]=e.price||0}),y.myTokensWithBalance=e.filter(e=>e.address.startsWith(o.caipNetworkId)),y.networkBalanceInUSD=i?r.NumberUtil.multiply(i.quantity.numeric,i.price).toString():"0"},async getInitialGasPrice(){let e=await u.SwapApiUtil.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch(h.ChainController.state?.activeCaipNetwork?.chainNamespace){case i.ConstantsUtil.CHAIN.SOLANA:return y.gasFee=e.standard??"0",y.gasPriceInUSD=r.NumberUtil.multiply(e.standard,y.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(y.gasFee),gasPriceInUSD:Number(y.gasPriceInUSD)};case i.ConstantsUtil.CHAIN.EVM:default:let t=e.standard??"0",o=BigInt(t),n=BigInt(15e4),a=d.getGasPriceInUSD(y.networkPrice,n,o);return y.gasFee=t,y.gasPriceInUSD=a,{gasPrice:o,gasPriceInUSD:a}}},async swapTokens(){let e=h.ChainController.getAccountData()?.address,t=y.sourceToken,o=y.toToken,i=r.NumberUtil.bigNumber(y.sourceTokenAmount).gt(0);if(i||A.setToTokenAmount(""),!o||!t||y.loadingPrices||!i||!e)return;y.loadingQuote=!0;let n=r.NumberUtil.bigNumber(y.sourceTokenAmount).times(10**t.decimals).round(0).toFixed(0);try{let i=await g.BlockchainApiController.fetchSwapQuote({userAddress:e,from:t.address,to:o.address,gasPrice:y.gasFee,amount:n.toString()});y.loadingQuote=!1;let a=i?.quotes?.[0]?.toAmount;if(!a)return void m.AlertController.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");let s=r.NumberUtil.bigNumber(a).div(10**o.decimals).toString();A.setToTokenAmount(s),A.hasInsufficientToken(y.sourceTokenAmount,t.address)?y.inputError="Insufficient balance":(y.inputError=void 0,A.setTransactionDetails())}catch(t){let e=await u.SwapApiUtil.handleSwapError(t);y.loadingQuote=!1,y.inputError=e||"Insufficient balance"}},async getTransaction(){let{fromCaipAddress:e,availableToSwap:t}=A.getParams(),o=y.sourceToken,r=y.toToken;if(e&&t&&o&&r&&!y.loadingQuote)try{let t;return y.loadingBuildTransaction=!0,t=await u.SwapApiUtil.fetchSwapAllowance({userAddress:e,tokenAddress:o.address,sourceTokenAmount:y.sourceTokenAmount,sourceTokenDecimals:o.decimals})?await A.createSwapTransaction():await A.createAllowanceTransaction(),y.loadingBuildTransaction=!1,y.fetchError=!1,t}catch(e){b.RouterController.goBack(),f.SnackController.showError("Failed to check allowance"),y.loadingBuildTransaction=!1,y.approvalTransaction=void 0,y.swapTransaction=void 0,y.fetchError=!0;return}},async createAllowanceTransaction(){let{fromCaipAddress:e,sourceTokenAddress:t,toTokenAddress:o}=A.getParams();if(e&&o){if(!t)throw Error("createAllowanceTransaction - No source token address found.");try{let r=await g.BlockchainApiController.generateApproveCalldata({from:t,to:o,userAddress:e}),i=c.CoreHelperUtil.getPlainAddress(r.tx.from);if(!i)throw Error("SwapController:createAllowanceTransaction - address is required");let n={data:r.tx.data,to:i,gasPrice:BigInt(r.tx.eip155.gasPrice),value:BigInt(r.tx.value),toAmount:y.toTokenAmount};return y.swapTransaction=void 0,y.approvalTransaction={data:n.data,to:n.to,gasPrice:n.gasPrice,value:n.value,toAmount:n.toAmount},{data:n.data,to:n.to,gasPrice:n.gasPrice,value:n.value,toAmount:n.toAmount}}catch(e){b.RouterController.goBack(),f.SnackController.showError("Failed to create approval transaction"),y.approvalTransaction=void 0,y.swapTransaction=void 0,y.fetchError=!0;return}}},async createSwapTransaction(){let{networkAddress:e,fromCaipAddress:t,sourceTokenAmount:o}=A.getParams(),r=y.sourceToken,i=y.toToken;if(!t||!o||!r||!i)return;let n=k.ConnectionController.parseUnits(o,r.decimals)?.toString();try{let o=await g.BlockchainApiController.generateSwapCalldata({userAddress:t,from:r.address,to:i.address,amount:n,disableEstimate:!0}),a=r.address===e,s=BigInt(o.tx.eip155.gas),l=BigInt(o.tx.eip155.gasPrice),u=c.CoreHelperUtil.getPlainAddress(o.tx.to);if(!u)throw Error("SwapController:createSwapTransaction - address is required");let p={data:o.tx.data,to:u,gas:s,gasPrice:l,value:a?BigInt(n??"0"):BigInt("0"),toAmount:y.toTokenAmount};return y.gasPriceInUSD=d.getGasPriceInUSD(y.networkPrice,s,l),y.approvalTransaction=void 0,y.swapTransaction=p,p}catch(e){b.RouterController.goBack(),f.SnackController.showError("Failed to create transaction"),y.approvalTransaction=void 0,y.swapTransaction=void 0,y.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){f.SnackController.showLoading("Approve limit increase in your wallet"),b.RouterController.replace("SwapPreview")},async sendTransactionForApproval(e){let{fromAddress:t,isAuthConnector:o}=A.getParams();y.loadingApprovalTransaction=!0,o?b.RouterController.pushTransactionStack({onSuccess:A.onEmbeddedWalletApprovalSuccess}):f.SnackController.showLoading("Approve limit increase in your wallet");try{await k.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:i.ConstantsUtil.CHAIN.EVM}),await A.swapTokens(),await A.getTransaction(),y.approvalTransaction=void 0,y.loadingApprovalTransaction=!1}catch(e){y.transactionError=e?.displayMessage,y.loadingApprovalTransaction=!1,f.SnackController.showError(e?.displayMessage||"Transaction error"),w.EventsController.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:h.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:A.state.sourceToken?.symbol||"",swapToToken:A.state.toToken?.symbol||"",swapFromAmount:A.state.sourceTokenAmount||"",swapToAmount:A.state.toTokenAmount||"",isSmartAccount:(0,s.getPreferredAccountType)(i.ConstantsUtil.CHAIN.EVM)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){if(!e)return;let{fromAddress:t,toTokenAmount:o,isAuthConnector:a}=A.getParams();y.loadingTransaction=!0;let l=`Swapping ${y.sourceToken?.symbol} to ${r.NumberUtil.formatNumberToLocalString(o,3)} ${y.toToken?.symbol}`,c=`Swapped ${y.sourceToken?.symbol} to ${r.NumberUtil.formatNumberToLocalString(o,3)} ${y.toToken?.symbol}`;a?b.RouterController.pushTransactionStack({onSuccess(){b.RouterController.replace("Account"),f.SnackController.showLoading(l),S.resetState()}}):f.SnackController.showLoading("Confirm transaction in your wallet");try{let o=[y.sourceToken?.address,y.toToken?.address].join(","),r=await k.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:i.ConstantsUtil.CHAIN.EVM});return y.loadingTransaction=!1,f.SnackController.showSuccess(c),w.EventsController.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:h.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:A.state.sourceToken?.symbol||"",swapToToken:A.state.toToken?.symbol||"",swapFromAmount:A.state.sourceTokenAmount||"",swapToAmount:A.state.toTokenAmount||"",isSmartAccount:(0,s.getPreferredAccountType)(i.ConstantsUtil.CHAIN.EVM)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),S.resetState(),a||b.RouterController.replace("Account"),S.getMyTokensWithBalance(o),r}catch(e){y.transactionError=e?.displayMessage,y.loadingTransaction=!1,f.SnackController.showError(e?.displayMessage||"Transaction error"),w.EventsController.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:h.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:A.state.sourceToken?.symbol||"",swapToToken:A.state.toToken?.symbol||"",swapFromAmount:A.state.sourceTokenAmount||"",swapToAmount:A.state.toTokenAmount||"",isSmartAccount:(0,s.getPreferredAccountType)(i.ConstantsUtil.CHAIN.EVM)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken:(e,t)=>d.isInsufficientSourceTokenForSwap(e,t,y.myTokensWithBalance),setTransactionDetails(){let{toTokenAddress:e,toTokenDecimals:t}=A.getParams();e&&t&&(y.gasPriceInUSD=d.getGasPriceInUSD(y.networkPrice,BigInt(y.gasFee),BigInt(15e4)),y.priceImpact=d.getPriceImpact({sourceTokenAmount:y.sourceTokenAmount,sourceTokenPriceInUSD:y.sourceTokenPriceInUSD,toTokenPriceInUSD:y.toTokenPriceInUSD,toTokenAmount:y.toTokenAmount}),y.maxSlippage=d.getMaxSlippage(y.slippage,y.toTokenAmount),y.providerFee=d.getProviderFee(y.sourceTokenAmount))}},A=(0,p.withErrorBoundary)(S);e.s(["SwapController",0,A],47755)},97521,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var r=e.i(20119);e.i(52634),e.i(64380),e.i(64576),e.i(39009),e.i(73944);var i=e.i(59088),n=e.i(45975),a=e.i(62611);let s=a.css`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-text {
    padding-left: ${({spacing:e})=>e[1]};
    padding-right: ${({spacing:e})=>e[1]};
  }

  .left-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    border: 1px solid ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] .token-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .token-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .token-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .chain-image {
    width: 12px;
    height: 12px;
    bottom: 2px;
    right: -4px;
  }

  button[data-size='md'] .chain-image {
    width: 10px;
    height: 10px;
    bottom: 2px;
    right: -4px;
  }

  button[data-size='sm'] .chain-image {
    width: 8px;
    height: 8px;
    bottom: 2px;
    right: -3px;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    opacity: 0.5;
  }
`;var l=function(e,t,o,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(a=(n<3?i(a):n>3?i(t,o,a):i(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let c={lg:"lg-regular",md:"lg-regular",sm:"md-regular"},u={lg:"lg",md:"md",sm:"sm"},d=class extends t.LitElement{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.text="",this.loading=!1}render(){return this.loading?o.html` <wui-flex alignItems="center" gap="01" padding="01">
        <wui-shimmer width="20px" height="20px"></wui-shimmer>
        <wui-shimmer width="32px" height="18px" borderRadius="4xs"></wui-shimmer>
      </wui-flex>`:o.html`
      <button ?disabled=${this.disabled} data-size=${this.size}>
        ${this.imageTemplate()} ${this.textTemplate()}
      </button>
    `}imageTemplate(){if(this.imageSrc&&this.chainImageSrc)return o.html`<wui-flex class="left-image-container">
        <wui-image src=${this.imageSrc} class="token-image"></wui-image>
        <wui-image src=${this.chainImageSrc} class="chain-image"></wui-image>
      </wui-flex>`;if(this.imageSrc)return o.html`<wui-image src=${this.imageSrc} class="token-image"></wui-image>`;let e=u[this.size];return o.html`<wui-flex class="left-icon-container">
      <wui-icon size=${e} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}textTemplate(){let e=c[this.size];return o.html`<wui-text color="primary" variant=${e}
      >${this.text}</wui-text
    >`}};d.styles=[i.resetStyles,i.elementStyles,s],l([(0,r.property)()],d.prototype,"size",void 0),l([(0,r.property)()],d.prototype,"imageSrc",void 0),l([(0,r.property)()],d.prototype,"chainImageSrc",void 0),l([(0,r.property)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,r.property)()],d.prototype,"text",void 0),l([(0,r.property)({type:Boolean})],d.prototype,"loading",void 0),d=l([(0,n.customElement)("wui-token-button")],d),e.s([],97521)}]);