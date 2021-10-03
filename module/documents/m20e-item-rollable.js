//
import M20eItem from './m20e-item.js'
import M20eThrow from '../throw.js'
import DiceThrower from '../dice-thrower.js'

// Import Helpers
import * as utils from '../utils.js'
import { log } from "../utils.js";

/**
 * @extends {M20eItem}
 */
export default class M20eRollableItem extends M20eItem {

  /** @override */
  constructor(data, context) {
    super(data, context);
  }

  /** @override */
  prepareData() {
    super.prepareData();
    //recast each throw into a M20eThrow instance.(it will recast traitDatas into Traits as well)
    this.data.data.throws = this.data.data.throws.map( throwData => {
      return throwData instanceof M20eThrow ? throwData : M20eThrow.fromData(throwData);
    });
  }

  /**
   * @override
   */
   _prepareOwnedItem() {
    super._prepareOwnedItem();
    const itemData = this.data;
    itemData.data.miniFlavor = this.getMiniFlavor();
    //itemData.data.isActuallyRollable = this._isActuallyRollable();
  }

  async addThrow() {
    const itemData = this.data;
    //check for the max throws authorized
    //todo put the value in config
    if ( itemData.data.throws.length >= 10 ) { return; }
    
    const throws = duplicate(itemData.data.throws);
    //create a new throw
    throws.push(new M20eThrow([
      //stats
    ], {
      //data
      name: game.i18n.localize('M20E.new.throw'),
      type: itemData.type
    }, {
      //options
      
    }));
    return await this.update({['data.throws']: throws});
  }

  async removeThrow(throwIndex) {
    const itemData = this.data;
    //check if index is within the range
    if ( throwIndex >= itemData.data.throws.length ) { return; }
    
    const throws = duplicate(itemData.data.throws);
    throws.splice(throwIndex, 1);
    return await this.update({['data.throws']: throws});
  }

  async moveUpThrow(throwIndex) {
    const itemData = this.data;
    //check if index is within the range
    if ( !throwIndex || throwIndex >= itemData.data.throws.length ) { return; }
    
    const throws = duplicate(itemData.data.throws);
    [throws[throwIndex-1], throws[throwIndex]] = [throws[throwIndex], throws[throwIndex-1]];
    return await this.update({['data.throws']: throws});
  }

  /* -------------------------------------------- */
  /*  Roll related                                */
  /* -------------------------------------------- */

  //get that's displayed on the actorsheet
  getMiniFlavor() {
    const itemData = this.data;
    let miniFlavor = '';
    if ( this.data.type === 'weapon' ) {
    //compute a string containing damages and damage type 
    //(TODO : damages should be number or stat + number)
      const damageType = game.i18n.localize(CONFIG.M20E.damageTypes[itemData.data.damageType]);
      miniFlavor = `dmg : ${itemData.data.damage}D - ${damageType}`;
    }
    return miniFlavor;
  }

  getStats(throwIndex) {
    return this.data.data.throws[throwIndex].stats;
  }

  getThrowFlavor(throwIndex=0) {
    return '';
  }

  _getFlavor(throwIndex=0) {
    return '';
  }

  /*_isActuallyRollable(actor=null) {
    actor = actor || this.actor;
    return this.data.data.throws.some( mageThrow => mageThrow.isRollable(actor));
  }*/

   /**
    * get traits from a rollable item for the specific throw index (ie rotes only have 1 throw so it's index 0)
    * create a new {@link DiceThrow} from traitsToRoll and either throw or open config App based on shiftkey status
    * 
    * @param  {Boolean} shiftKey
    * @param  {Number} throwIndex=0 
    */
   roll(shiftKey, throwIndex = 0) {
    const m20eThrow = M20eThrow.fromData(this.data.data.throws[throwIndex]);
    m20eThrow.options.throwIndex = throwIndex;
    const diceThrower = DiceThrower.create(this, m20eThrow);
    if ( !diceThrower ) { return; }
    if ( shiftKey ) {
      //throw right away
      diceThrower.throwDice();
    } else {
      //display dice throw dialog
      diceThrower.render(true);
    }
  }

  getMacroData(data) {
    const itemType = game.i18n.localize(`ITEM.Type${this.type.capitalize()}`);
    return {
      name : `${itemType} ${this.name}`,
      img: this.img,
      commandParameters : {
        data: {
          itemId: this.id,
          throwIndex: data.throwIndex || 0
        }
      }
    }
  }
}