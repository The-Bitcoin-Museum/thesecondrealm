

class Formatter {

  static BITCOIN_TO_SATOSHIS = 100000000;

  /**
   * Format the coordinates
   */
  static formatCoord(value, format) {
    let fmtValue = null;
    switch (format) {
      case 'ord':
        fmtValue = Formatter.numberToFixedDecimalsStr(value, 0, false);
        fmtValue = Formatter.numberWithCommas(fmtValue);
        break
      case 'card':
        fmtValue = Formatter.numberToFixedDecimalsStr(value, 0, false);
        fmtValue = Formatter.numberWithCommas(fmtValue);
        break
      case 'datehour':
        fmtValue = Formatter.formatDate(value);
        break
      case 'size':
        fmtValue = Formatter.formatSize(value);
        break
      case 'vsize':
        fmtValue = Formatter.formatVsize(value);
        break
      case 'amount':
        fmtValue = Formatter.formatAmount(value, 0, false);
        break
      case 'feeratesize':
        fmtValue = Formatter.formatFeesSize(value);
        break
      case 'feeratevsize':
        fmtValue = Formatter.formatFeesVsize(value);
        break
      case 'percentage':
        fmtValue = Formatter.formatPercentage(value, 2);
        break
      case 'bdd':
        fmtValue = Formatter.formatBdd(value, 0, false);
        break
      default:
        fmtValue = Formatter.numberWithCommas(value);
    }
    return fmtValue;
  }

  
  static formatDate(x) {
    if (x == null) {
      return null; 
    }
    let ts = new Date(x*1000);
    ts = ts.toISOString();
    ts = ts.replace('T', ' ').replace('.000Z', '');
    return ts;
  }


  static formatAmount(x, nbDecimals, removeTrailingZeros) {
    if (x == null) {
      return null;
    }
    if (nbDecimals == null) {
      nbDecimals = 8;
    }
    if (removeTrailingZeros == null) {
      removeTrailingZeros = true;
    }
    let btcAmount = x / Formatter.BITCOIN_TO_SATOSHIS;
    let result = Formatter.numberToFixedDecimalsStr(
      btcAmount,
      nbDecimals,
      removeTrailingZeros
    );
    result = Formatter.numberWithCommas(result);
    result += ' BTC';
    return result;
  }

  
  static formatFeesSize(x) {
    let result = x / 1000;
    result = Formatter.numberToFixedDecimalsStr(result, 0, false);
    result += ' sat/byte';
    return result;
  }


  static formatFeesVsize(v) {
    let result = v / 1000;
    result = Formatter.numberToFixedDecimalsStr(result, 0, false);
    result += ' sat/vbyte';
    return result;
  }


  static formatBdd(bdd, nbDecimals, removeTrailingZeros) {
    if (nbDecimals == null) {
      nbDecimals = 2;
    }
    if (removeTrailingZeros == null) {
      removeTrailingZeros = false;
    }
    let result = Formatter.numberToFixedDecimalsStr(
      bdd,
      nbDecimals,
      removeTrailingZeros
    );
    result = Formatter.numberWithCommas(result);
    result += ' BTC.DAYS';
    return result;
  }

  static formatSize(x) {
    let result = Formatter.numberToFixedDecimalsStr(x, 0, false);
    result = Formatter.numberWithCommas(result);
    result += ' bytes';
    return result;
  }

  static formatVsize(x) {
    let result = Formatter.numberToFixedDecimalsStr(x, 0, false);
    result = Formatter.numberWithCommas(result);
    result += ' vbytes';
    return result;
  }


  static formatPercentage(v, nbDecimals) {
    if (nbDecimals == null) {
      nbDecimals = 4;
    }    
    let result = Formatter.numberToFixedDecimalsStr(v, nbDecimals);
    result += '%';
    return result;
  }


  static numberToFixedDecimalsStr(x, nbDecimals, removeTrailingZeros) {
    if (nbDecimals == null || !nbDecimals) {
      nbDecimals = 0;
    }
    if (removeTrailingZeros == null) {
      removeTrailingZeros = true;
    }
    const regexp = /\.?0+$/;
    let result = null;              
    if (x != null) {
      result = x.toFixed(nbDecimals);
      if (removeTrailingZeros) {
        result = result.replace(regexp, '');
      }
    }
    return result;
  }


  static numberWithCommas(x) {
    if (x == null) {
      return null;
    }
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    let parts = x.toString().split('.');
    parts[0] = parts[0].replace(regexp, ',');
    return parts.join('.');
  }

}

export { Formatter };
