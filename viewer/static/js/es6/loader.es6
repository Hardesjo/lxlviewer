import Thing from './views/thing';

export default class Loader {
  
  constructor() {
    this.views = [];
  }

  loadViews(views) {
    // Accepts list of class names.
    this.views.push(new Thing('Thing'));
  }
    
  initCommon() {
    console.log("Do something common");
  }
  
  initPage() {
    let bodyId = document.body.id;
        
    for(var i = 0; i < this.views.length; i++) {
      if (this.views[i].constructor.name.toLowerCase() == bodyId.toLowerCase()) {
        this.views[i].initialize();
        return true;
      }
    }
    console.log(bodyId + " not found in list of views.");
    return false;
  }
}
