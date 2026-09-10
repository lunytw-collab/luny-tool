(function(){
  "use strict";
  /* 2026-09-09 公開成捲貼紙基礎報價樣本；原頁標示未稅。LUNY 捲裝規則費另列入。 */
  var MATRIX={
    3:{2000:1415,5000:1716,8000:2017,10000:2217,15000:2719,20000:3220},
    4:{2000:1563,5000:2085,8000:2608,10000:2956,15000:3827,20000:4698},
    5:{2000:1730,5000:2503,8000:3276,10000:3791,15000:5079,20000:6367},
    6:{2000:1980,5000:3129,8000:4277,10000:5042,15000:6956,20000:8870},
    7:{2000:2102,5000:3432,8000:4763,10000:5650,15000:7867,20000:10085},
    8:{2000:2558,5000:4575,8000:6592,10000:7937,15000:11300,20000:14660},
    10:{2000:3718,5000:7472,8000:11227,10000:13730,15000:19987,20000:26244},
    12:{2000:4204,5000:8687,8000:13171,10000:16160,15000:23632,20000:31104},
    15:{2000:8651,5000:19805,8000:30958,10000:38394,15000:56984,20000:75573},
    16:{2000:9137,5000:21019,8000:32902,10000:40824,15000:60629,20000:80433},
    20:{2000:11081,5000:25879,8000:40678,10000:50544,15000:75209,20000:99873},
    25:{2000:13511,5000:31954,8000:50398,10000:62694,15000:93434,20000:124173},
    30:{2000:15941,5000:38029,8000:60118,10000:74844,15000:111659,20000:148473}
  };
  var SIDE_KEYS=Object.keys(MATRIX).map(Number).sort(function(a,b){return a-b;});
  var QTY_KEYS=[2000,5000,8000,10000,15000,20000];
  var MODULE_SIDE={"88":3,"56":4,"35":5,"24":6,"22":6.5,"20":7,"16":7.5,"15":7.5,"12":8,"10":9,"9":9.5,"8":10,"7":11,"6":12,"M3_MEDIUM_14X12":13,"4":15,"M4_LARGE_15X15":15,"3":16,"M2_LARGE_20X15":17.5,"M2_SQUARE_18X18":18,"2":20,"1":25};
  var FACTORS={
    artpaper:{"無":1,"上膜":1.10},lowResidueArtpaper:{"無":1,"上膜":1.10},shtte:{"無":1},
    pearlescent:{"無":1.77,"亮膜":1.97,"霧膜":1.97},
    normalPearlescent:{"無":1.32,"亮膜":1.47,"霧膜":1.47},
    lowResiduePearlescent:{"無":1.32,"亮膜":1.47,"霧膜":1.47},
    transparent:{"亮膜":1.84,"霧膜":1.84},glossSilver:{"亮膜":1.68},matteSilver:{"亮膜":1.68}
  };
  function bounds(keys,value){var v=Number(value)||0;if(v<=keys[0])return[keys[0],keys[0]];for(var i=1;i<keys.length;i++){if(v<=keys[i])return[keys[i-1],keys[i]];}return[keys[keys.length-1],keys[keys.length-1]];}
  function lerp(a,b,t){return Number(a)+(Number(b)-Number(a))*t;}
  function priceForSideAtAnchor(side,qty){var b=bounds(SIDE_KEYS,side),lo=b[0],hi=b[1];if(lo===hi)return MATRIX[lo][qty];return lerp(MATRIX[lo][qty],MATRIX[hi][qty],(side-lo)/(hi-lo));}
  function basePrice(side,qty){var q=Math.max(2000,Number(qty)||2000),b=bounds(QTY_KEYS,q),lo=b[0],hi=b[1];if(q>20000){var p15=priceForSideAtAnchor(side,15000),p20=priceForSideAtAnchor(side,20000);return p20+(q-20000)*(p20-p15)/5000;}if(lo===hi)return priceForSideAtAnchor(side,lo);return lerp(priceForSideAtAnchor(side,lo),priceForSideAtAnchor(side,hi),(q-lo)/(hi-lo));}
  function factorFor(material,finish){var map=FACTORS[material]||{"無":1};return Number(map[finish]||map["無"]||1);}
  var table=window.LUNY_PRICING_TABLE||{};
  Object.keys(table).forEach(function(material){Object.keys(table[material]||{}).forEach(function(finish){(table[material][finish]||[]).forEach(function(item){var side=MODULE_SIDE[String(item.module)]||5;Object.keys(item.price||{}).forEach(function(qty){var q=Number(qty)||0;if(q<2000){item.price[qty]=0;return;}item.price[qty]=Math.max(0,Math.round(basePrice(side,q)*factorFor(material,finish)));});});});});
  window.LUNY_ROLL_PRICING_META={version:"luny-roll-reference-20260910-v2",currency:"TWD",minimumQuantity:2000,minimumDieMm:30,coreInnerDiameterCm:7.6,gapMm:3,edgeMarginMm:1.5,rollBasicFee:0,specifiedSplitFee:1000,specifiedSplitDefault:false,sourcePage:"https://everprinter.com/product/pdt-82",sourcePriceDisplay:"未稅"};
})();
