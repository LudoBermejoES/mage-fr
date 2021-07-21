// Import Helpers
import * as utils from '../utils/utils.js'
import { log } from "../utils/utils.js";
import { Trait, ExtendedTrait } from "../utils/classes.js";

const TROWSETTINGS_BLANDROLL = 1;
const TROWSETTINGS_DEDUCTFAILURE = 2;
const TROWSETTINGS_DFXPLODESUCCESS = 3;

/**
 * 
 * 
 */
export class DiceThrow {

  /** @override */
  constructor(args) {
    const {document=null, traitsToRoll=[], options={}} = args;
    if ( !document ) { return; }
    if ( document.isEmbedded && !document.isRollable ) { return; }

    this._app = null;
    this._document = document;
    this._traitsToRoll = traitsToRoll;
    this._options = options;
    this.initialize();
  }

  initialize() {
    //todo : use options to modify values / mods
    this.dicePoolMods = {
      userMod: 0,
    };
    this.thresholdBase = game.settings.get("mage-fr", "baseRollThreshold");
    this.thresholdMods = {//not so sure about that
      userMod: 0,
    };
    this.throwSettings = TROWSETTINGS_DEDUCTFAILURE;
    //todo : maybe have a success mods array + extended rolls

    this._initTraits();
    this.prepareData();
  }

  prepareData() {
    this.dicePoolBase = this.getDicePoolBase();
    this.dicePoolMods.healthMod = this.getHealthMod(),
    this.dicePoolMods.untrainedMMod = this.getUntrainedMod()
    this.dicePoolTotal = Math.max(this.dicePoolBase + this.dicePoolMod, 1);
  }

  static fromMacro(macroParams) {
    //todo : create new instance from macro parameters
  }

  getMacroParameters() {
    //todo : return parameters needed to populate a macro
  }


  _initTraits() {
    this.xTraitsToRoll = this._document.extendTraits(this._traitsToRoll);
  }

  get actor() {
    return this._document.isEmbedded ? this._document.parent : this._document;
  }

  get app() {
    //todo add game setting to prevent players from editing their throws
    if ( !this._app ) {
      const cls = CONFIG.M20E.diceThrowApp;
      this._app = new cls (this, {
        editable: game.user.isGM || true 
      });
    }
    return this._app;
  }

  get dicePoolMalus() {
    return Object.values(this.dicePoolMods).reduce((acc, cur) => {
      return acc + ( cur < 0 ? cur : 0);
    }, 0);
  }

  get dicePoolBonus() {
    return Object.values(this.dicePoolMods).reduce((acc, cur) => {
      return acc + ( cur > 0 ? cur : 0);
    }, 0);
  }

  get dicePoolMod() {
    return Object.values(this.dicePoolMods).reduce((acc, cur) => {
      return acc + cur;
    }, 0);
  }

  getDicePoolBase() {
    if ( this.isEffectRoll() ) {
      //dice pool base is just arete
      return this._document.data.data.arete;
    } else {
      //dice pool base is sum of all values
      return this.xTraitsToRoll.reduce((acc, cur) => {
        return acc + cur.value;
      }, 0);
    }
  }

  getHealthMod() {
    return game.settings.get("mage-fr", "useHealthMalus") ?
      (this.actor.data.data.health.malus * -1) : 0;
  }

  getUntrainedMod() {
    let untrainedMalus = 0;
    const settings = game.settings.get("mage-fr", "untrainedMalus");
    if ( settings === "000" ) { return 0; }
    const subTypes = {talent: 0, skill: 1, knowledge: 2};
    //check if untrained ability
    this.xTraitsToRoll.forEach( trait => {
      if ( trait.category === "abilities" && trait.value === 0 ) {
        //get specific game setting relative to untrained abilities
        const item = this.actor.items.get(trait.itemId);
        if ( !item ) {
          //todo : localize
          ui.notifications.error(`M20E | Can't find item with Id : ${trait.itemId} on actor ${this.actor.name} !`);
          return untrainedMalus;
        }
        untrainedMalus -= parseInt(settings.substr(subTypes[item.data.data.subType],1));
      }
    })
    return untrainedMalus;
  }

  get flavor() {
    return this._getFlavor(true);
  }

  _getFlavor(useParadigm = false) {
    //ⓈⓊ🅢🅤
  }

  isEffectRoll(){
    return this._traitsToRoll.length !== 0 && this._traitsToRoll.reduce((acc, cur) => {
      return acc && cur.category === 'spheres'
    }, true);
  }

  getExplodeSuccess(){
    let xplodeSuccess = false;
    //xplodeSuccess = xplodeSuccess || (game.settings.get("mage-fr", "roteRule") && isRote);
    if(game.settings.get("mage-fr", "specialisationRule")){
      this.xTraitsToRoll.forEach(function (xTrait) {
          xplodeSuccess = xplodeSuccess || (xTrait.useSpec === true);
      })
    }
    return xplodeSuccess;
  }

  async throwDice() {

  }

  removeTrait(index){
    this._traitsToRoll.splice(index, 1);
    this.xTraitsToRoll.splice(index, 1);
    this.update();
  }

  update() {
    //recalc shit
    this.prepareData();
    //render
    this.render(true);
  }

  render(force=false) {
    this.app.render(force);
  }

}