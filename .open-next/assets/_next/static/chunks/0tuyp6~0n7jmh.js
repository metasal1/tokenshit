(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,38822,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var a=e.i(20119);e.i(84326);var i=e.i(65090),n=e.i(62611),r=e.i(59088),s=e.i(12699),l=e.i(45975);let c=n.css`
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
`;var u=function(e,t,o,a){var i,n=arguments.length,r=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,a);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(r=(n<3?i(r):n>3?i(t,o,r):i(t,o))||r);return n>3&&r&&Object.defineProperty(t,o,r),r};let p=class extends t.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,i.createRef)(),this.disabled=!1,this.value="",this.placeholder="0",this.widthVariant="auto",this.maxDecimals=void 0,this.maxIntegers=void 0,this.fontSize="h4",this.error=!1}firstUpdated(){this.resizeInput()}updated(){this.style.setProperty("--local-font-size",n.vars.textSize[this.fontSize]),this.resizeInput()}render(){return(this.dataset.widthVariant=this.widthVariant,this.dataset.error=String(this.error),this.inputElementRef?.value&&this.value&&(this.inputElementRef.value.value=this.value),"auto"===this.widthVariant)?this.inputTemplate():o.html`
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
    />`}dispatchInputChangeEvent(){this.inputElementRef.value&&(this.inputElementRef.value.value=s.UiHelperUtil.maskInput({value:this.inputElementRef.value.value,decimals:this.maxDecimals,integers:this.maxIntegers}),this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value.value,bubbles:!0,composed:!0})),this.resizeInput())}resizeInput(){if("fit"===this.widthVariant){let e=this.inputElementRef.value;if(e){let t=e.previousElementSibling;t&&(t.textContent=e.value||"0",e.style.width=`${t.offsetWidth}px`)}}}};p.styles=[r.resetStyles,r.elementStyles,c],u([(0,a.property)({type:Boolean})],p.prototype,"disabled",void 0),u([(0,a.property)({type:String})],p.prototype,"value",void 0),u([(0,a.property)({type:String})],p.prototype,"placeholder",void 0),u([(0,a.property)({type:String})],p.prototype,"widthVariant",void 0),u([(0,a.property)({type:Number})],p.prototype,"maxDecimals",void 0),u([(0,a.property)({type:Number})],p.prototype,"maxIntegers",void 0),u([(0,a.property)({type:String})],p.prototype,"fontSize",void 0),u([(0,a.property)({type:Boolean})],p.prototype,"error",void 0),p=u([(0,l.customElement)("wui-input-amount")],p),e.s([],38822)},47755,e=>{"use strict";var t=e.i(65801),o=e.i(42710),a=e.i(75457),i=e.i(1564),n=e.i(79484),r=e.i(18887),s=e.i(64126),l=e.i(60334),c=e.i(27302),u=e.i(64717);let p={getGasPriceInEther:(e,t)=>Number(t*e)/1e18,getGasPriceInUSD(e,t,o){let i=p.getGasPriceInEther(t,o);return a.NumberUtil.bigNumber(e).times(i).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:o,toTokenAmount:i}){let n=a.NumberUtil.bigNumber(e).times(t),r=a.NumberUtil.bigNumber(i).times(o);return n.minus(r).div(n).times(100).toNumber()},getMaxSlippage(e,t){let o=a.NumberUtil.bigNumber(e).div(100);return a.NumberUtil.multiply(t,o).toNumber()},getProviderFee:(e,t=.0085)=>a.NumberUtil.bigNumber(e).times(t).toString(),isInsufficientNetworkTokenForGas:(e,t)=>!!a.NumberUtil.bigNumber(e).eq(0)||a.NumberUtil.bigNumber(a.NumberUtil.bigNumber(t||"0")).gt(e),isInsufficientSourceTokenForSwap(e,t,o){let i=o?.find(e=>e.address===t)?.quantity?.numeric;return a.NumberUtil.bigNumber(i||"0").lt(e)}};var m=e.i(92279),d=e.i(51887),h=e.i(24742),k=e.i(60398),g=e.i(71080),T=e.i(49454),w=e.i(53157),v=e.i(21728),b=e.i(11424);let f={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:l.ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},y=(0,t.proxy)({...f}),P={state:y,subscribe:e=>(0,t.subscribe)(y,()=>e(y)),subscribeKey:(e,t)=>(0,o.subscribeKey)(y,e,t),getParams(){let e=k.ChainController.state.activeChain,t=k.ChainController.getAccountData(e)?.caipAddress??k.ChainController.state.activeCaipAddress,o=c.CoreHelperUtil.getPlainAddress(t),n=(0,s.getActiveNetworkTokenAddress)(),r=T.ConnectorController.getConnectorId(k.ChainController.state.activeChain);if(!o)throw Error("No address found to swap the tokens from.");let l=!y.toToken?.address||!y.toToken?.decimals,u=!y.sourceToken?.address||!y.sourceToken?.decimals||!a.NumberUtil.bigNumber(y.sourceTokenAmount).gt(0),p=!y.sourceTokenAmount;return{networkAddress:n,fromAddress:o,fromCaipAddress:t,sourceTokenAddress:y.sourceToken?.address,toTokenAddress:y.toToken?.address,toTokenAmount:y.toTokenAmount,toTokenDecimals:y.toToken?.decimals,sourceTokenAmount:y.sourceTokenAmount,sourceTokenDecimals:y.sourceToken?.decimals,invalidToToken:l,invalidSourceToken:u,invalidSourceTokenAmount:p,availableToSwap:t&&!l&&!u&&!p,isAuthConnector:r===i.ConstantsUtil.CONNECTOR_ID.AUTH}},async setSourceToken(e){if(!e){y.sourceToken=e,y.sourceTokenAmount="",y.sourceTokenPriceInUSD=0;return}y.sourceToken=e,await S.setTokenPrice(e.address,"sourceToken")},setSourceTokenAmount(e){y.sourceTokenAmount=e},async setToToken(e){if(!e){y.toToken=e,y.toTokenAmount="",y.toTokenPriceInUSD=0;return}y.toToken=e,await S.setTokenPrice(e.address,"toToken")},setToTokenAmount(e){y.toTokenAmount=e?a.NumberUtil.toFixed(e,6):""},async setTokenPrice(e,t){let o=y.tokensPriceMap[e]||0;o||(y.loadingPrices=!0,o=await S.getAddressPrice(e)),"sourceToken"===t?y.sourceTokenPriceInUSD=o:"toToken"===t&&(y.toTokenPriceInUSD=o),y.loadingPrices&&(y.loadingPrices=!1),S.getParams().availableToSwap&&!y.switchingTokens&&S.swapTokens()},async switchTokens(){if(!y.initializing&&y.initialized&&!y.switchingTokens){y.switchingTokens=!0;try{let e=y.toToken?{...y.toToken}:void 0,t=y.sourceToken?{...y.sourceToken}:void 0,o=e&&""===y.toTokenAmount?"1":y.toTokenAmount;S.setSourceTokenAmount(o),S.setToTokenAmount(""),await S.setSourceToken(e),await S.setToToken(t),y.switchingTokens=!1,S.swapTokens()}catch(e){throw y.switchingTokens=!1,e}}},resetState(){y.myTokensWithBalance=f.myTokensWithBalance,y.tokensPriceMap=f.tokensPriceMap,y.initialized=f.initialized,y.initializing=f.initializing,y.switchingTokens=f.switchingTokens,y.sourceToken=f.sourceToken,y.sourceTokenAmount=f.sourceTokenAmount,y.sourceTokenPriceInUSD=f.sourceTokenPriceInUSD,y.toToken=f.toToken,y.toTokenAmount=f.toTokenAmount,y.toTokenPriceInUSD=f.toTokenPriceInUSD,y.networkPrice=f.networkPrice,y.networkTokenSymbol=f.networkTokenSymbol,y.networkBalanceInUSD=f.networkBalanceInUSD,y.inputError=f.inputError},resetValues(){let{networkAddress:e}=S.getParams(),t=y.tokens?.find(t=>t.address===e);S.setSourceToken(t),S.setToToken(void 0)},getApprovalLoadingState:()=>y.loadingApprovalTransaction,clearError(){y.transactionError=void 0},async initializeState(){if(!y.initializing){if(y.initializing=!0,!y.initialized)try{await S.fetchTokens(),y.initialized=!0}catch(e){y.initialized=!1,b.SnackController.showError("Failed to initialize swap"),v.RouterController.goBack()}y.initializing=!1}},async fetchTokens(){let{networkAddress:e}=S.getParams();await S.getNetworkTokenPrice(),await S.getMyTokensWithBalance();let t=y.myTokensWithBalance?.find(t=>t.address===e);t&&(y.networkTokenSymbol=t.symbol,S.setSourceToken(t),S.setSourceTokenAmount("0"))},async getTokenList(){let e=k.ChainController.state.activeCaipNetwork?.caipNetworkId;if(y.caipNetworkId!==e||!y.tokens)try{y.tokensLoading=!0;let t=await u.SwapApiUtil.getTokenList(e);y.tokens=t,y.caipNetworkId=e,y.popularTokens=t.sort((e,t)=>e.symbol<t.symbol?-1:+(e.symbol>t.symbol));let o=(e&&l.ConstantsUtil.SUGGESTED_TOKENS_BY_CHAIN?.[e]||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e),a=(l.ConstantsUtil.SWAP_SUGGESTED_TOKENS||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e).filter(e=>!o.some(t=>t.address===e.address));y.suggestedTokens=[...o,...a]}catch(e){y.tokens=[],y.popularTokens=[],y.suggestedTokens=[]}finally{y.tokensLoading=!1}},async getAddressPrice(e){let t=y.tokensPriceMap[e];if(t)return t;let o=await h.BlockchainApiController.fetchTokenPrice({addresses:[e]}),a=o?.fungibles||[],i=[...y.tokens||[],...y.myTokensWithBalance||[]],n=i?.find(t=>t.address===e)?.symbol,r=parseFloat((a.find(e=>e.symbol.toLowerCase()===n?.toLowerCase())?.price||0).toString());return y.tokensPriceMap[e]=r,r},async getNetworkTokenPrice(){let{networkAddress:e}=S.getParams(),t=await h.BlockchainApiController.fetchTokenPrice({addresses:[e]}).catch(()=>(b.SnackController.showError("Failed to fetch network token price"),{fungibles:[]})),o=t.fungibles?.[0],a=o?.price.toString()||"0";y.tokensPriceMap[e]=parseFloat(a),y.networkTokenSymbol=o?.symbol||"",y.networkPrice=a},async getMyTokensWithBalance(e){let t=await r.BalanceUtil.getMyTokensWithBalance({forceUpdate:e,caipNetwork:k.ChainController.state.activeCaipNetwork,address:k.ChainController.getAccountData()?.address}),o=u.SwapApiUtil.mapBalancesToSwapTokens(t);o&&(await S.getInitialGasPrice(),S.setBalances(o))},setBalances(e){let{networkAddress:t}=S.getParams(),o=k.ChainController.state.activeCaipNetwork;if(!o)return;let i=e.find(e=>e.address===t);e.forEach(e=>{y.tokensPriceMap[e.address]=e.price||0}),y.myTokensWithBalance=e.filter(e=>e.address.startsWith(o.caipNetworkId)),y.networkBalanceInUSD=i?a.NumberUtil.multiply(i.quantity.numeric,i.price).toString():"0"},async getInitialGasPrice(){let e=await u.SwapApiUtil.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch(k.ChainController.state?.activeCaipNetwork?.chainNamespace){case i.ConstantsUtil.CHAIN.SOLANA:return y.gasFee=e.standard??"0",y.gasPriceInUSD=a.NumberUtil.multiply(e.standard,y.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(y.gasFee),gasPriceInUSD:Number(y.gasPriceInUSD)};case i.ConstantsUtil.CHAIN.EVM:default:let t=e.standard??"0",o=BigInt(t),n=BigInt(15e4),r=p.getGasPriceInUSD(y.networkPrice,n,o);return y.gasFee=t,y.gasPriceInUSD=r,{gasPrice:o,gasPriceInUSD:r}}},async swapTokens(){let e=k.ChainController.getAccountData()?.address,t=y.sourceToken,o=y.toToken,i=a.NumberUtil.bigNumber(y.sourceTokenAmount).gt(0);if(i||S.setToTokenAmount(""),!o||!t||y.loadingPrices||!i||!e)return;y.loadingQuote=!0;let n=a.NumberUtil.bigNumber(y.sourceTokenAmount).times(10**t.decimals).round(0).toFixed(0);try{let i=await h.BlockchainApiController.fetchSwapQuote({userAddress:e,from:t.address,to:o.address,gasPrice:y.gasFee,amount:n.toString()});y.loadingQuote=!1;let r=i?.quotes?.[0]?.toAmount;if(!r)return void d.AlertController.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");let s=a.NumberUtil.bigNumber(r).div(10**o.decimals).toString();S.setToTokenAmount(s),S.hasInsufficientToken(y.sourceTokenAmount,t.address)?y.inputError="Insufficient balance":(y.inputError=void 0,S.setTransactionDetails())}catch(t){let e=await u.SwapApiUtil.handleSwapError(t);y.loadingQuote=!1,y.inputError=e||"Insufficient balance"}},async getTransaction(){let{fromCaipAddress:e,availableToSwap:t}=S.getParams(),o=y.sourceToken,a=y.toToken;if(e&&t&&o&&a&&!y.loadingQuote)try{let t;return y.loadingBuildTransaction=!0,t=await u.SwapApiUtil.fetchSwapAllowance({userAddress:e,tokenAddress:o.address,sourceTokenAmount:y.sourceTokenAmount,sourceTokenDecimals:o.decimals})?await S.createSwapTransaction():await S.createAllowanceTransaction(),y.loadingBuildTransaction=!1,y.fetchError=!1,t}catch(e){v.RouterController.goBack(),b.SnackController.showError("Failed to check allowance"),y.loadingBuildTransaction=!1,y.approvalTransaction=void 0,y.swapTransaction=void 0,y.fetchError=!0;return}},async createAllowanceTransaction(){let{fromCaipAddress:e,sourceTokenAddress:t,toTokenAddress:o}=S.getParams();if(e&&o){if(!t)throw Error("createAllowanceTransaction - No source token address found.");try{let a=await h.BlockchainApiController.generateApproveCalldata({from:t,to:o,userAddress:e}),i=c.CoreHelperUtil.getPlainAddress(a.tx.from);if(!i)throw Error("SwapController:createAllowanceTransaction - address is required");let n={data:a.tx.data,to:i,gasPrice:BigInt(a.tx.eip155.gasPrice),value:BigInt(a.tx.value),toAmount:y.toTokenAmount};return y.swapTransaction=void 0,y.approvalTransaction={data:n.data,to:n.to,gasPrice:n.gasPrice,value:n.value,toAmount:n.toAmount},{data:n.data,to:n.to,gasPrice:n.gasPrice,value:n.value,toAmount:n.toAmount}}catch(e){v.RouterController.goBack(),b.SnackController.showError("Failed to create approval transaction"),y.approvalTransaction=void 0,y.swapTransaction=void 0,y.fetchError=!0;return}}},async createSwapTransaction(){let{networkAddress:e,fromCaipAddress:t,sourceTokenAmount:o}=S.getParams(),a=y.sourceToken,i=y.toToken;if(!t||!o||!a||!i)return;let n=g.ConnectionController.parseUnits(o,a.decimals)?.toString();try{let o=await h.BlockchainApiController.generateSwapCalldata({userAddress:t,from:a.address,to:i.address,amount:n,disableEstimate:!0}),r=a.address===e,s=BigInt(o.tx.eip155.gas),l=BigInt(o.tx.eip155.gasPrice),u=c.CoreHelperUtil.getPlainAddress(o.tx.to);if(!u)throw Error("SwapController:createSwapTransaction - address is required");let m={data:o.tx.data,to:u,gas:s,gasPrice:l,value:r?BigInt(n??"0"):BigInt("0"),toAmount:y.toTokenAmount};return y.gasPriceInUSD=p.getGasPriceInUSD(y.networkPrice,s,l),y.approvalTransaction=void 0,y.swapTransaction=m,m}catch(e){v.RouterController.goBack(),b.SnackController.showError("Failed to create transaction"),y.approvalTransaction=void 0,y.swapTransaction=void 0,y.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){b.SnackController.showLoading("Approve limit increase in your wallet"),v.RouterController.replace("SwapPreview")},async sendTransactionForApproval(e){let{fromAddress:t,isAuthConnector:o}=S.getParams();y.loadingApprovalTransaction=!0,o?v.RouterController.pushTransactionStack({onSuccess:S.onEmbeddedWalletApprovalSuccess}):b.SnackController.showLoading("Approve limit increase in your wallet");try{await g.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:i.ConstantsUtil.CHAIN.EVM}),await S.swapTokens(),await S.getTransaction(),y.approvalTransaction=void 0,y.loadingApprovalTransaction=!1}catch(e){y.transactionError=e?.displayMessage,y.loadingApprovalTransaction=!1,b.SnackController.showError(e?.displayMessage||"Transaction error"),w.EventsController.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:k.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:S.state.sourceToken?.symbol||"",swapToToken:S.state.toToken?.symbol||"",swapFromAmount:S.state.sourceTokenAmount||"",swapToAmount:S.state.toTokenAmount||"",isSmartAccount:(0,s.getPreferredAccountType)(i.ConstantsUtil.CHAIN.EVM)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){if(!e)return;let{fromAddress:t,toTokenAmount:o,isAuthConnector:r}=S.getParams();y.loadingTransaction=!0;let l=`Swapping ${y.sourceToken?.symbol} to ${a.NumberUtil.formatNumberToLocalString(o,3)} ${y.toToken?.symbol}`,c=`Swapped ${y.sourceToken?.symbol} to ${a.NumberUtil.formatNumberToLocalString(o,3)} ${y.toToken?.symbol}`;r?v.RouterController.pushTransactionStack({onSuccess(){v.RouterController.replace("Account"),b.SnackController.showLoading(l),P.resetState()}}):b.SnackController.showLoading("Confirm transaction in your wallet");try{let o=[y.sourceToken?.address,y.toToken?.address].join(","),a=await g.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:i.ConstantsUtil.CHAIN.EVM});return y.loadingTransaction=!1,b.SnackController.showSuccess(c),w.EventsController.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:k.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:S.state.sourceToken?.symbol||"",swapToToken:S.state.toToken?.symbol||"",swapFromAmount:S.state.sourceTokenAmount||"",swapToAmount:S.state.toTokenAmount||"",isSmartAccount:(0,s.getPreferredAccountType)(i.ConstantsUtil.CHAIN.EVM)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),P.resetState(),r||v.RouterController.replace("Account"),P.getMyTokensWithBalance(o),a}catch(e){y.transactionError=e?.displayMessage,y.loadingTransaction=!1,b.SnackController.showError(e?.displayMessage||"Transaction error"),w.EventsController.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:k.ChainController.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:S.state.sourceToken?.symbol||"",swapToToken:S.state.toToken?.symbol||"",swapFromAmount:S.state.sourceTokenAmount||"",swapToAmount:S.state.toTokenAmount||"",isSmartAccount:(0,s.getPreferredAccountType)(i.ConstantsUtil.CHAIN.EVM)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken:(e,t)=>p.isInsufficientSourceTokenForSwap(e,t,y.myTokensWithBalance),setTransactionDetails(){let{toTokenAddress:e,toTokenDecimals:t}=S.getParams();e&&t&&(y.gasPriceInUSD=p.getGasPriceInUSD(y.networkPrice,BigInt(y.gasFee),BigInt(15e4)),y.priceImpact=p.getPriceImpact({sourceTokenAmount:y.sourceTokenAmount,sourceTokenPriceInUSD:y.sourceTokenPriceInUSD,toTokenPriceInUSD:y.toTokenPriceInUSD,toTokenAmount:y.toTokenAmount}),y.maxSlippage=p.getMaxSlippage(y.slippage,y.toTokenAmount),y.providerFee=p.getProviderFee(y.sourceTokenAmount))}},S=(0,m.withErrorBoundary)(P);e.s(["SwapController",0,S],47755)},97521,e=>{"use strict";e.i(12207);var t=e.i(8285),o=e.i(54479);e.i(74576);var a=e.i(20119);e.i(52634),e.i(64380),e.i(64576),e.i(39009),e.i(73944);var i=e.i(59088),n=e.i(45975),r=e.i(62611);let s=r.css`
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
`;var l=function(e,t,o,a){var i,n=arguments.length,r=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,a);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(r=(n<3?i(r):n>3?i(t,o,r):i(t,o))||r);return n>3&&r&&Object.defineProperty(t,o,r),r};let c={lg:"lg-regular",md:"lg-regular",sm:"md-regular"},u={lg:"lg",md:"md",sm:"sm"},p=class extends t.LitElement{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.text="",this.loading=!1}render(){return this.loading?o.html` <wui-flex alignItems="center" gap="01" padding="01">
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
    >`}};p.styles=[i.resetStyles,i.elementStyles,s],l([(0,a.property)()],p.prototype,"size",void 0),l([(0,a.property)()],p.prototype,"imageSrc",void 0),l([(0,a.property)()],p.prototype,"chainImageSrc",void 0),l([(0,a.property)({type:Boolean})],p.prototype,"disabled",void 0),l([(0,a.property)()],p.prototype,"text",void 0),l([(0,a.property)({type:Boolean})],p.prototype,"loading",void 0),p=l([(0,n.customElement)("wui-token-button")],p),e.s([],97521)},82012,e=>{e.v(t=>Promise.all(["static/chunks/04ico-_gjm27w.js"].map(t=>e.l(t))).then(()=>t(96403)))},40171,e=>{e.v(t=>Promise.all(["static/chunks/11v3m7g373ehs.js"].map(t=>e.l(t))).then(()=>t(69592)))},10729,e=>{e.v(t=>Promise.all(["static/chunks/0xc5ogy.4cqt6.js"].map(t=>e.l(t))).then(()=>t(86977)))},80342,e=>{e.v(t=>Promise.all(["static/chunks/0_mewu7cnpsno.js"].map(t=>e.l(t))).then(()=>t(32833)))},95724,e=>{e.v(t=>Promise.all(["static/chunks/11wkp7hpvh7tf.js"].map(t=>e.l(t))).then(()=>t(72412)))},52792,e=>{e.v(t=>Promise.all(["static/chunks/0g3ui2wv8r~wc.js"].map(t=>e.l(t))).then(()=>t(26763)))},96302,e=>{e.v(t=>Promise.all(["static/chunks/0j0k6c8ggdklr.js"].map(t=>e.l(t))).then(()=>t(43229)))},44243,e=>{e.v(t=>Promise.all(["static/chunks/07wddbwvy22f0.js"].map(t=>e.l(t))).then(()=>t(12721)))},59668,e=>{e.v(t=>Promise.all(["static/chunks/09ba7-_iffhw0.js"].map(t=>e.l(t))).then(()=>t(36682)))},41373,e=>{e.v(t=>Promise.all(["static/chunks/10gk0blv0it_k.js"].map(t=>e.l(t))).then(()=>t(51383)))},69595,e=>{e.v(t=>Promise.all(["static/chunks/0bta-jrs6~00o.js"].map(t=>e.l(t))).then(()=>t(4289)))},33052,e=>{e.v(t=>Promise.all(["static/chunks/0762bbcc5~n~v.js"].map(t=>e.l(t))).then(()=>t(56357)))},280,e=>{e.v(t=>Promise.all(["static/chunks/0zft.mxso0wdv.js"].map(t=>e.l(t))).then(()=>t(78319)))},92833,e=>{e.v(t=>Promise.all(["static/chunks/0tdapn46a87b2.js"].map(t=>e.l(t))).then(()=>t(61289)))},17096,e=>{e.v(t=>Promise.all(["static/chunks/0oeos-plb2q06.js"].map(t=>e.l(t))).then(()=>t(26703)))},5963,e=>{e.v(t=>Promise.all(["static/chunks/0vhj_1cq1owug.js"].map(t=>e.l(t))).then(()=>t(9953)))},48774,e=>{e.v(t=>Promise.all(["static/chunks/0vm3duhzxw-u2.js"].map(t=>e.l(t))).then(()=>t(32295)))},50090,e=>{e.v(t=>Promise.all(["static/chunks/12wk3fvygoqg~.js"].map(t=>e.l(t))).then(()=>t(52019)))},38711,e=>{e.v(t=>Promise.all(["static/chunks/1408kbi9bcza3.js"].map(t=>e.l(t))).then(()=>t(64871)))},50621,e=>{e.v(t=>Promise.all(["static/chunks/0881hmc9re8px.js"].map(t=>e.l(t))).then(()=>t(59021)))},5462,e=>{e.v(t=>Promise.all(["static/chunks/04f2_hmveaqeu.js"].map(t=>e.l(t))).then(()=>t(65788)))},70963,e=>{e.v(t=>Promise.all(["static/chunks/0zhiq_0493.r0.js"].map(t=>e.l(t))).then(()=>t(17729)))},56906,e=>{e.v(t=>Promise.all(["static/chunks/0o7t79qo-g.qk.js"].map(t=>e.l(t))).then(()=>t(34056)))},78023,e=>{e.v(t=>Promise.all(["static/chunks/0p-trm74a~_nw.js"].map(t=>e.l(t))).then(()=>t(71507)))},69039,e=>{e.v(t=>Promise.all(["static/chunks/015dz_0fuvoul.js"].map(t=>e.l(t))).then(()=>t(2658)))},63605,e=>{e.v(t=>Promise.all(["static/chunks/0jt_ui_som86b.js"].map(t=>e.l(t))).then(()=>t(39621)))},42324,e=>{e.v(t=>Promise.all(["static/chunks/16ae95zbkbei2.js"].map(t=>e.l(t))).then(()=>t(11923)))},84968,e=>{e.v(t=>Promise.all(["static/chunks/139-5-~k-a9_a.js"].map(t=>e.l(t))).then(()=>t(74571)))},44020,e=>{e.v(t=>Promise.all(["static/chunks/0sj204xziysfx.js"].map(t=>e.l(t))).then(()=>t(84535)))},50711,e=>{e.v(t=>Promise.all(["static/chunks/0mb5g5c08bg3_.js"].map(t=>e.l(t))).then(()=>t(15680)))},56601,e=>{e.v(t=>Promise.all(["static/chunks/04ao4kqg7-71z.js"].map(t=>e.l(t))).then(()=>t(1958)))},81254,e=>{e.v(t=>Promise.all(["static/chunks/0ylfzksb.ysq3.js"].map(t=>e.l(t))).then(()=>t(11420)))},79893,e=>{e.v(t=>Promise.all(["static/chunks/11vp.ou5.wgk..js"].map(t=>e.l(t))).then(()=>t(52452)))},1514,e=>{e.v(t=>Promise.all(["static/chunks/15_vj4ft3pkw2.js"].map(t=>e.l(t))).then(()=>t(35252)))},44980,e=>{e.v(t=>Promise.all(["static/chunks/0abw.we2fvq85.js"].map(t=>e.l(t))).then(()=>t(80835)))},84074,e=>{e.v(t=>Promise.all(["static/chunks/0qu2ipod_3dre.js"].map(t=>e.l(t))).then(()=>t(94301)))},67422,e=>{e.v(t=>Promise.all(["static/chunks/0trdrklutxs6s.js"].map(t=>e.l(t))).then(()=>t(89931)))},13200,e=>{e.v(t=>Promise.all(["static/chunks/0wufvuse0m1df.js"].map(t=>e.l(t))).then(()=>t(69097)))},48479,e=>{e.v(t=>Promise.all(["static/chunks/039hmx6plo.3u.js"].map(t=>e.l(t))).then(()=>t(88299)))},67369,e=>{e.v(t=>Promise.all(["static/chunks/0avogfle0agse.js"].map(t=>e.l(t))).then(()=>t(66712)))},77793,e=>{e.v(t=>Promise.all(["static/chunks/0xub8so4d47.0.js"].map(t=>e.l(t))).then(()=>t(71960)))},4447,e=>{e.v(t=>Promise.all(["static/chunks/144lv8k~l5496.js"].map(t=>e.l(t))).then(()=>t(65425)))},93690,e=>{e.v(t=>Promise.all(["static/chunks/0acgxj--f7i8u.js"].map(t=>e.l(t))).then(()=>t(65891)))},77385,e=>{e.v(t=>Promise.all(["static/chunks/0qk6uu2q1tw_v.js"].map(t=>e.l(t))).then(()=>t(84131)))},65739,e=>{e.v(t=>Promise.all(["static/chunks/12lr98o1.yd7g.js"].map(t=>e.l(t))).then(()=>t(9900)))},80304,e=>{e.v(t=>Promise.all(["static/chunks/10lvb6.5.uxa9.js"].map(t=>e.l(t))).then(()=>t(45017)))},9957,e=>{e.v(t=>Promise.all(["static/chunks/0.7amhpjej0na.js"].map(t=>e.l(t))).then(()=>t(44919)))},22236,e=>{e.v(t=>Promise.all(["static/chunks/0z~mfwxrvgs-s.js"].map(t=>e.l(t))).then(()=>t(6501)))},40934,e=>{e.v(t=>Promise.all(["static/chunks/0c.ugbg-cm92~.js"].map(t=>e.l(t))).then(()=>t(13559)))},71802,e=>{e.v(t=>Promise.all(["static/chunks/0u00gqq-1y.-7.js"].map(t=>e.l(t))).then(()=>t(94384)))},57792,e=>{e.v(t=>Promise.all(["static/chunks/0l23c_y.nej82.js"].map(t=>e.l(t))).then(()=>t(76208)))},7885,e=>{e.v(t=>Promise.all(["static/chunks/047hyf3ib.ncs.js"].map(t=>e.l(t))).then(()=>t(56529)))}]);