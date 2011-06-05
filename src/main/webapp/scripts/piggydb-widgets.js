/*
 * Global utilities
 */
 
function getFragmentHeaders(fragmentId) {
  var headerClass = ".fragment-header";
  if (fragmentId != null) headerClass = headerClass + "-" + fragmentId;
  return jQuery(headerClass);
}


/* 
 *  Facebox based on facebox (http://famspam.com/facebox)
 */
function Facebox(id) {
  this.id = id;
  this.widget = jQuery('\
<div id="' + this.id + '" class="facebox"> \
  <div class="popup"> \
    <table> \
      <tbody> \
        <tr> \
          <td class="tl"/><td class="b"/><td class="tr"/> \
        </tr> \
        <tr> \
          <td class="b"/> \
          <td class="body"> \
           <div class="header"> \
             <a href="#" class="close"> \
             <img src="images/large-delete.gif" title="close" class="close_image" alt="X"/></a> \
           </div> \
           <div class="content"></div> \
          </td> \
          <td class="b"/> \
        </tr> \
        <tr> \
          <td class="bl"/><td class="b"/><td class="br"/> \
        </tr> \
      </tbody> \
    </table> \
  </div> \
</div>');
  this.body = this.widget.find('.body');
  this.content = this.widget.find('.content');
}
Facebox.prototype = {
  show: function(url) {
    this.init();  
    this.loading();
    
    var facebox = this;
    jQuery.get(url, function(data) { 
	    facebox.reveal(data);
	  });
  },
  
  showImage: function(url) {
    this.init();  
    this.loading();
   
    var maxWidth = jQuery(window).width() - 80;
    var maxHeight = jQuery(window).height() - 120;
    var image = new Image();
    var facebox = this;
    image.onload = function() {
      facebox.reveal('<div class="image"><img src="' + image.src + '" /></div>');
      var width = image.width < maxWidth ? image.width : maxWidth;
      var height = image.height < maxHeight ? image.height : maxHeight;
      if (width < maxWidth && height == maxHeight) width = Math.min(width + 15, maxWidth);
      if (height < maxHeight && width == maxWidth) height = Math.min(height + 15, maxHeight);
      facebox.content.css({
	      'width':  width,
	      'height': height
	    });   
    };
    image.src = url;
  },
  
  init: function() {
    jQuery('#' + this.id).remove();
    this.content.empty();
    this.widget.find(".close").click(this.onCloseClick);
    this.widget.appendTo(jQuery('body'));
  },
  
  loading: function () {
	  if (this.widget.find('.loading').length == 1) return true;

	  this.body.children().hide().end().
	      append('<div class="loading"><img src="images/load.gif"/></div>'); 
	  this.widget.show();
	},
	
	reveal: function (data) {
    this.content.append(data);
    this.widget.find('.loading').remove();
    this.body.children().fadeIn('normal');
	},

  onCloseClick: function () {
    var widget = jQuery(this).closest(".facebox");
	  widget.fadeOut(function() {
	    widget.find('.loading').remove();
	  });
	  return false;
	}
};


/* 
 *  Selected Fragments
 */
function SelectedFragments(
   id, 
   fragmentUrlPrefix, 
   clearConfirmMessage,
   callback_add,
   callback_remove,
   callback_clear) {
   
  this.widget = jQuery('#' + id);
  this.content = this.widget.find(".content");
  this.ul = this.content.children("ul");
  if (this.ul.size() == 0) this.ul = jQuery('<ul>').appendTo(this.content);
  this.fragmentUrlPrefix = fragmentUrlPrefix;
  this.clearConfirmMessage = clearConfirmMessage;
  this.callback_add = callback_add;
  this.callback_remove = callback_remove;
  this.callback_clear = callback_clear;
  this.update();
}
SelectedFragments.prototype = {
  CLASS_FRAGMENT_SELECTED: "selected-fragment",
  
  size: function() {
    return this.widget.find(".content li").size();
  },
  
  add: function(id, title) {
    this.callback_add(id);
  
    // Fragment headers
    var headers = getFragmentHeaders(id);
    var allCheckboxes = headers.find("input.fragment-checkbox");
    headers.addClass(this.CLASS_FRAGMENT_SELECTED);
    allCheckboxes.attr("checked", "checked");
  
    // Selection widget
    var urlPrefix = this.fragmentUrlPrefix;
    var li = jQuery('<li id="selected-fragment-' + id + '">').prependTo(this.ul);
    li.html(jQuery("#tpl-selected-fragment-entry").html());
	  var directive = { 
      'a.fragment-link' : function(arg) {
	      return '#' + arg.context.id;
	    },
      'a.fragment-link[href]' : function(arg) {
        return urlPrefix + arg.context.id;
      },
      'a.remove[onclick]' : function(arg) {
        return "selectedFragments.remove('" + arg.context.id + "'); return false;";
      }
    };
    li.autoRender({"id": id, "title": escapeHtml(title)}, directive);
    this.update();
  },
  
  remove: function(id) {
    this.callback_remove(id);
  
    // Fragment headers
    var headers = getFragmentHeaders(id);
    var allCheckboxes = headers.find("input.fragment-checkbox");
    headers.removeClass(this.CLASS_FRAGMENT_SELECTED);
    allCheckboxes.removeAttr("checked");
  
    // Selection widget
    jQuery('#selected-fragment-' + id).remove();
    this.update();
  },
  
  clear: function() {
    if (!window.confirm(this.clearConfirmMessage)) return false;
        
    this.callback_clear();
        
    // Fragment headers
    var headers = getFragmentHeaders(null);
    var allCheckboxes = headers.find("input.fragment-checkbox");
    headers.removeClass(this.CLASS_FRAGMENT_SELECTED);
    allCheckboxes.removeAttr("checked");
    
    // Selection widget
    this.ul.empty();
    this.update();
  },
  
  update: function() {
    if (this.size() > 0) {
      this.widget.show();
    }
    else {
      this.widget.fadeOut();
    }
  }
};


function ShowHideToggle(id, target, putState) {
  this.id = id;
  this.target = target;
  this.putState = putState;
  this.onShow = null;
  
  this.widget = jQuery('#' + id);
  this.icon = this.widget.children("img");
   
  var outer = this;
  this.widget.click(function() {
    outer.onToggleClick();
    return false;
  });
}
ShowHideToggle.prototype = {
  SHOW: "down",
  HIDE: "up",
  
  onToggleClick: function() {
    var iconSrc = this.icon.attr("src");
    var stateKey = "state." + this.id;
    if (iconSrc.indexOf(this.SHOW) != -1) {
      this.icon.attr("src", iconSrc.replace(this.SHOW, this.HIDE));
      this.target.slideDown("fast");
      this.putState(stateKey, "shown");
      if (this.onShow) this.onShow();
    }
    else if (iconSrc.indexOf(this.HIDE) != -1) {
      this.target.slideUp("fast");
      this.icon.attr("src", iconSrc.replace(this.HIDE, this.SHOW));
      this.putState(stateKey, "hidden");
    }
  }
};


function SidebarEntry(id, toggleId, putState) {
  this.id = id;
  this.content = jQuery("#" + id + " .sidebar-content");
  this.toggle = new ShowHideToggle(toggleId, this.content, putState);
  
  if (!SidebarEntry.instances) SidebarEntry.instances = [];
  SidebarEntry.instances[id] = this;
}
SidebarEntry.prototype = {
  isContentHidden: function() {
    return this.content.css("display") == "none";
  }
    
};



/* 
 *  Tag Palette
 */

var ClassUtils = {
  registerInstance: function(newInstance, classObject) {
    if (!classObject.instances) classObject.instances = [];
    classObject.instances.push(newInstance);
    return classObject.instances.length - 1;
  }
};

function TagPalette(paletteDiv, onTagSelect, toggleButton) {
  this.ref = "TagPalette.instances[" + ClassUtils.registerInstance(this, TagPalette) + "]";
  
  this.paletteDiv = paletteDiv;
  this.onTagSelect = onTagSelect;
  this.onPaletteInit = null;
  this.onPaletteUpdate = null;
  this.decideMaxHeight = null;
  this.breadcrumbs = [];
  
  if (toggleButton != null) {
    this.toggleButton = toggleButton;
    var outer = this;
    this.toggleButton.click(function() {
      outer.onToggleButtonClick();
      return false;
    });
  }
  else {
    this.init();
  }
}
TagPalette.CLASS_OPENED = "pulled";
TagPalette.DRAGGABLE_SETTINGS = { 
  revert: true,
  helper: 'clone',
  appendTo: 'body',
  opacity: 0.70,
  zIndex: 120
};
TagPalette.prototype = {
  init: function() {
    this.breadcrumbs = [];  
    this.paletteDiv.empty().html(LOAD_ICON).show();
    var outer = this;
    getJSON("get-tags", null, function(tags) {
      outer.setTags(tags, false);
      if (outer.onPaletteInit) outer.onPaletteInit();
    });
  },
  
  onToggleButtonClick: function() {
    if (this.toggleButton.hasClass(TagPalette.CLASS_OPENED)) {
      this.close();
    } 
    else {
      this.toggleButton.addClass(TagPalette.CLASS_OPENED);
      this.init();
    }
  },
  
  close: function() {
    this.toggleButton.removeClass(TagPalette.CLASS_OPENED);
    this.paletteDiv.hide();
  },
  
  toRoot: function() {
    this.breadcrumbs = [];
    this.setLoading();
    var outer = this;
    getJSON("get-tags", null, function(tags) {
      outer.setTags(tags, false);
    });
  },
  
  back: function() {
    if (this.breadcrumbs.length <= 1) {
      this.toRoot();
      return;
    }
    
    this.breadcrumbs.pop();
    var redo = this.breadcrumbs[this.breadcrumbs.length - 1];
    var tagId = redo[0];
    var toChildren = redo[1];
    var parameters = toChildren ? {"parent": tagId} : {"child": tagId};
    
    this.setLoading();
    var outer = this;
    getJSON("get-tags", parameters, function(tags) {
      outer.setTags(tags, toChildren);
    });
  },
  
  toParentOrChild: function(tagId, toChildren) {
    this.setLoading();
    var parameters = toChildren ? {"parent": tagId} : {"child": tagId};
    var outer = this;
    getJSON("get-tags", parameters, function(tags) {
      outer.setTags(tags, toChildren);
    });
    this.breadcrumbs.push([tagId, toChildren]);
  },
  
  // tags don't necessarily hold their parents even if they actually have
  // so it is needed to be complemented by the "asChildren" parameter
  setTags: function(tags, asChildren) {
    if (tags.length == 0) {
      this.paletteDiv.html(EMPTY_TAG_PALETTE);
      return;
    }
    
    var outer = this;
    var directive = { 
      'a.back[style]' : function(arg) {
        if (outer.breadcrumbs.length == 0) return "display: none;";
      },
      'a.to-parents[style]' : function(arg) {
        if (!asChildren && !arg.item.hasParents) return "display: none;";
      },
      'a.to-children[style]' : function(arg) {
        if (!arg.item.hasChildren) return "display: none;";
      },
      'a.to-parents[onclick]' : function(arg) {
        return outer.ref + ".toParentOrChild(" + arg.item.id + ", false); return false;";
      },
      'a.to-children[onclick]' : function(arg) {
        return outer.ref + ".toParentOrChild(" + arg.item.id + ", true); return false;";
      },
      'span.miniTagIcon[class]' : function(arg) {
        return miniTagIconClass(arg.item.name);
      },
      'a.tag[onclick]' : function(arg) {
        return outer.ref + ".onTagSelect(this, " + 
          arg.item.id + ", '" + escapeJsString(arg.item.name) + "', " + outer.ref + "); return false;";
      }
    };
    
    // PURE's autoRender will remove the jQuery object from the DOM tree for some reason
    // so autoRender will called against the children of this.paletteDiv
    this.paletteDiv.html(jQuery("#tpl-tag-palette").html());
    this.paletteDiv.children().autoRender(tags, directive);

    this.paletteDiv.find("a.close").click(function() {
      outer.close(); return false;
    });
    this.paletteDiv.find("a.to-roots").click(function() {
      outer.toRoot(); return false;
    });
    this.paletteDiv.find("a.back").click(function() {
      outer.back(); return false;
    });
    
    if (this.decideMaxHeight) this.paletteDiv.css("max-height", this.decideMaxHeight());
    if (this.onPaletteUpdate) this.onPaletteUpdate();
  },
  
  setLoading: function() {
    if (navigator.userAgent.indexOf("AppleWebKit") != -1) return;
    this.paletteDiv.html(LOAD_ICON);
  }
};

