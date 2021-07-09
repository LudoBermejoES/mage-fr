// Import Helpers
import * as utils from './utils.js'
import { log } from "./utils.js";

export const registerHandlebarsHelpers = function() {

  Handlebars.registerHelper('forLoop', function(nbIterr, loopInner) {
    let loopTotal = '';
    for ( let i = 0; i < nbIterr; i++ ) {
      loopTotal += loopInner.fn(i);
    }
    return loopTotal;
  })

  //github.com/adg29/concat.js
  Handlebars.registerHelper('concat', function() {
    let outStr = '';
    for ( const arg in arguments ) {
      if ( typeof arguments[arg] !== 'object' ) {
        outStr += arguments[arg];
      }
    }
    return outStr;
  })

 /**
 * Returns the paradigmic translation of the arguments
 * works like a localize(concat()) but substitutes the lexicon value if any
 * @param {object} arguments   First argument must be the paradigm data object
 */
  Handlebars.registerHelper('locadigm', function() {
    let concatStr = '';
    for(let i = 1; i< arguments.length -1; i++){
      if(typeof arguments[i] !== 'object'){
        concatStr += arguments[i]
      }
    }
    const paraData = arguments[0];
    try { //TODO : redo without try catch (hasProperty ?)
      const lexiconValue = foundry.utils.getProperty(paraData.lexicon, concatStr);
      if(!lexiconValue) throw '';
      return lexiconValue;
    } catch (e) {
      return game.i18n.localize(`M20E.${concatStr}`);
    }
  })

 /**
 * Adds a '+' sign in from of a positive value (no need for negative ones, obviously)
 * @param {number} num the number to be concatenated
 * @param {boolean} forceNegative forces a negative sign before a positive value
 */
  Handlebars.registerHelper('sign', function(num, forceNegative = false) {
    if ( num < 0 ) { return num; }
    return forceNegative ? `-${num}` : `+${num}`;
  })

  Handlebars.registerHelper('disabled', function(modifyValues) {
    return modifyValues ? '' : 'disabled';
  })

  Handlebars.registerHelper("clickableBullet", function(list, key, index) {
    if(!list){return;}
    //indexes are base 0
    return index < list[key].valueMax;
  })
  
  Handlebars.registerHelper("bulletState", function(value, index) {
    return (value > index) ? "active" : "";
  })

  Handlebars.registerHelper('in', function() {
    let entryToFind = arguments[0];
    for(let i = 1; i < arguments.length; i++){
      if(entryToFind === arguments[i]){return true;}
    }
    return false;
  })

  //
  Handlebars.registerHelper('res', function(resource, index) {
    if((resource.max - resource.aggravated) > index){ return 3;}
    if((resource.max - resource.lethal) > index){ return 2;}
    if((resource.max - resource.value) > index){ return 1;}
    return 0;
  })

  Handlebars.registerHelper('magepower', function(magepower, index) {
    let returnValue = 0;
    if(magepower.quintessence > index) return 1;
    if(utils.canSeeParadox() && (20 - magepower.paradox) <= index) return 2;
    return returnValue;
  })

}